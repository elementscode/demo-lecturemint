import { File, sql, ValidationError } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { CourseDetail, findCourseById } from "#app/shared/services/catalog";
import { storeMedia } from "#app/shared/services/uploads";

export const LEVELS = ["Beginner", "Intermediate", "Advanced", "All levels"];

export interface CourseForm {
  id: string;
  title: string;
  slug: string;
  tagline: string;
  level: string;
  price: string;
  description: string;
  published: boolean;
}

export interface EditorLesson {
  id: string;
  position: number;
  title: string;
  durationSeconds: number;
  hasVideo: boolean;
}

export function editorLessons(courseId: string): EditorLesson[] {
  return sql<EditorLesson>(`
    select id, position, title, durationSeconds,
           (videoMediaId is not null or videoAsset is not null) as hasVideo
      from lessons
     where courseId = ${courseId}
     order by position, createdAt
  `).all();
}

export function toForm(course: CourseDetail): CourseForm {
  return {
    id: course.id,
    title: course.title,
    slug: course.slug,
    tagline: course.tagline,
    level: course.level,
    price: (course.priceCents / 100).toFixed(2).replace(/\.00$/, ""),
    description: course.description,
    published: course.published,
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** @rpc */
export function saveCourse(form: CourseForm): CourseDetail {
  isInstructorOrThrow();

  let title = form.title.trim();
  let slug = slugify(form.slug || form.title);
  let priceCents = Math.round(Number(form.price) * 100);

  if (!title) {
    throw new ValidationError("Give the course a title.");
  }

  if (!slug) {
    throw new ValidationError("The url needs at least one letter or number.");
  }

  if (!Number.isFinite(priceCents) || priceCents < 100) {
    throw new ValidationError("Price must be at least $1.");
  }

  if (!LEVELS.includes(form.level)) {
    throw new ValidationError("Pick a level.");
  }

  let taken = !sql(`select 1 from courses where slug = ${slug} and id <> ${form.id}::uuid`).empty();

  if (taken) {
    throw new ValidationError("Another course already uses that url.");
  }

  if (form.published && sql(`select 1 from lessons where courseId = ${form.id}::uuid`).empty()) {
    throw new ValidationError("Add at least one lesson before publishing.");
  }

  sql(`
    update courses
       set title = ${title},
           slug = ${slug},
           tagline = ${form.tagline.trim()},
           level = ${form.level},
           priceCents = ${priceCents},
           description = ${form.description},
           published = ${form.published}
     where id = ${form.id}::uuid
  `);

  return findCourseById(form.id)!;
}

export interface CoverForm {
  courseId: string;
  file: File;
}

/** @rpc */
export function uploadCover(form: CoverForm): string {
  isInstructorOrThrow();

  if (!form.file) {
    throw new ValidationError("Choose an image first.");
  }

  let mediaId = storeMedia(form.file, "image");
  sql(`update courses set coverMediaId = ${mediaId} where id = ${form.courseId}::uuid`);

  return findCourseById(form.courseId)!.coverUrl;
}

/** @rpc */
export function addLesson(courseId: string): string {
  isInstructorOrThrow();

  let lesson = sql<{ id: string }>(`
    insert into lessons (courseId, position, title)
         select ${courseId}::uuid, coalesce(max(position), 0) + 1, 'Untitled lesson'
           from lessons where courseId = ${courseId}::uuid
      returning id
  `).firstOrThrow();

  return `/admin/lessons/${lesson.id}`;
}

/** Swaps a lesson with its neighbor above (-1) or below (1). */
/** @rpc */
export function moveLesson(courseId: string, lessonId: string, step: number): EditorLesson[] {
  isInstructorOrThrow();

  let lessons = editorLessons(courseId);
  let i = lessons.findIndex((l) => l.id === lessonId);
  let j = i + (step < 0 ? -1 : 1);

  if (i >= 0 && j >= 0 && j < lessons.length) {
    [lessons[i], lessons[j]] = [lessons[j]!, lessons[i]!];
    renumber(courseId, lessons.map((l) => l.id));
  }

  return editorLessons(courseId);
}

/** @rpc */
export function deleteLesson(courseId: string, lessonId: string): EditorLesson[] {
  isInstructorOrThrow();

  sql(`delete from lessons where id = ${lessonId}::uuid and courseId = ${courseId}::uuid`);
  renumber(courseId, editorLessons(courseId).map((l) => l.id));

  return editorLessons(courseId);
}

function renumber(courseId: string, ids: string[]) {
  sql(`
    update lessons l
       set position = o.ord
      from unnest(${ids}::uuid[]) with ordinality as o(id, ord)
     where l.id = o.id and l.courseId = ${courseId}::uuid
  `);
}
