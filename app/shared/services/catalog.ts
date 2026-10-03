import { sql } from "@elements/app";
import { marked } from "marked";
import { SEED_ASSETS } from "#app/shared/seed-assets";

export interface CourseCard {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  level: string;
  priceCents: number;
  coverUrl: string;
  lessonCount: number;
  totalSeconds: number;
  owned: boolean;
  completedCount: number;
}

export interface CourseDetail extends CourseCard {
  description: string;
  published: boolean;
}

export interface LessonItem {
  id: string;
  position: number;
  title: string;
  durationSeconds: number;
  completed: boolean;
}

export interface LessonFull extends LessonItem {
  courseId: string;
  notes: string;
  notesHtml: string;
  videoUrl: string;
}

export function mediaUrl(id: string, hash: string): string {
  return `/media/${id}/${hash}`;
}

/** The url for an upload if there is one, else for a shipped seed asset. */
export function assetUrl(mediaId: string | null, hash: string | null, asset: string | null): string {
  if (mediaId && hash) {
    return mediaUrl(mediaId, hash);
  }

  let url = (asset && SEED_ASSETS[asset]) || "";
  if (url.endsWith(".mp4")) {
    return `/seed-video/${asset}`;
  }

  return url;
}

export function renderMarkdown(text: string): string {
  return marked.parse(text, { async: false });
}

interface CourseRow {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  level: string;
  priceCents: number;
  description: string;
  published: boolean;
  coverMediaId: string | null;
  coverHash: string | null;
  coverAsset: string | null;
  lessonCount: number;
  totalSeconds: number;
  owned: boolean;
  completedCount: number;
}

type Fragment = ReturnType<typeof sql.raw>;

function selectCourses(userId: string | null, where: Fragment): CourseRow[] {
  return sql<CourseRow>(`
    select c.id, c.slug, c.title, c.tagline, c.level, c.priceCents, c.description,
           c.published, c.coverMediaId, m.hash as coverHash, c.coverAsset,
           (select count(*)::int from lessons l where l.courseId = c.id) as lessonCount,
           (select coalesce(sum(l.durationSeconds), 0)::int from lessons l where l.courseId = c.id) as totalSeconds,
           exists (select 1 from purchases p
                    where p.courseId = c.id and p.userId = ${userId}::uuid and p.status = 'paid') as owned,
           (select count(*)::int from lessonProgress lp join lessons l on l.id = lp.lessonId
             where l.courseId = c.id and lp.userId = ${userId}::uuid) as completedCount
      from courses c
      left join media m on m.id = c.coverMediaId
     where ${where}
     order by c.createdAt
  `).all();
}

function toDetail(row: CourseRow): CourseDetail {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    tagline: row.tagline,
    level: row.level,
    priceCents: row.priceCents,
    description: row.description,
    published: row.published,
    coverUrl: assetUrl(row.coverMediaId, row.coverHash, row.coverAsset),
    lessonCount: row.lessonCount,
    totalSeconds: row.totalSeconds,
    owned: row.owned,
    completedCount: row.completedCount,
  };
}

export function listPublishedCourses(userId: string | null): CourseDetail[] {
  return selectCourses(userId, sql.raw(`c.published`)).map(toDetail);
}

export function listAllCourses(): CourseDetail[] {
  return selectCourses(null, sql.raw(`true`)).map(toDetail);
}

export function findCourseBySlug(slug: string, userId: string | null): CourseDetail | undefined {
  let row = selectCourses(userId, sql.raw(`c.slug = ${slug}`))[0];

  return row && toDetail(row);
}

export function findCourseById(id: string): CourseDetail | undefined {
  let row = selectCourses(null, sql.raw(`c.id = ${id}::uuid`))[0];

  return row && toDetail(row);
}

export function listLessons(courseId: string, userId: string | null): LessonItem[] {
  return sql<LessonItem>(`
    select l.id, l.position, l.title, l.durationSeconds,
           exists (select 1 from lessonProgress lp
                    where lp.lessonId = l.id and lp.userId = ${userId}::uuid) as completed
      from lessons l
     where l.courseId = ${courseId}
     order by l.position, l.createdAt
  `).all();
}

interface LessonRow {
  id: string;
  courseId: string;
  position: number;
  title: string;
  notes: string;
  durationSeconds: number;
  videoMediaId: string | null;
  videoHash: string | null;
  videoAsset: string | null;
  completed: boolean;
}

export function findLesson(courseId: string, lessonId: string, userId: string | null): LessonFull | undefined {
  let row = sql<LessonRow>(`
    select l.id, l.courseId, l.position, l.title, l.notes, l.durationSeconds,
           l.videoMediaId, m.hash as videoHash, l.videoAsset,
           exists (select 1 from lessonProgress lp
                    where lp.lessonId = l.id and lp.userId = ${userId}::uuid) as completed
      from lessons l
      left join media m on m.id = l.videoMediaId
     where l.id = ${lessonId}::uuid and l.courseId = ${courseId}::uuid
  `).first();

  if (!row) {
    return undefined;
  }

  return {
    id: row.id,
    courseId: row.courseId,
    position: row.position,
    title: row.title,
    durationSeconds: row.durationSeconds,
    completed: row.completed,
    notes: row.notes,
    notesHtml: renderMarkdown(row.notes),
    videoUrl: assetUrl(row.videoMediaId, row.videoHash, row.videoAsset),
  };
}

/** A student who paid, or the instructor, can watch a course. */
export function canWatch(userId: string | null, courseId: string): boolean {
  if (!userId) {
    return false;
  }

  return !sql(`
    select 1 from users u
     where u.id = ${userId}
       and (u.role = 'instructor'
            or exists (select 1 from purchases p
                        where p.userId = u.id and p.courseId = ${courseId} and p.status = 'paid'))
  `).empty();
}
