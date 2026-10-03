import { File, sql, NotFoundError, ValidationError } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { assetUrl } from "#app/shared/services/catalog";
import { storeMedia } from "#app/shared/services/uploads";

export interface LessonForm {
  id: string;
  title: string;
  notes: string;
}

export interface EditorLessonDetail {
  id: string;
  courseId: string;
  courseTitle: string;
  position: number;
  lessonCount: number;
  title: string;
  notes: string;
  durationSeconds: number;
  videoUrl: string;
}

export function loadLesson(id: string): EditorLessonDetail {
  let row = sql<{
    id: string;
    courseId: string;
    courseTitle: string;
    position: number;
    lessonCount: number;
    title: string;
    notes: string;
    durationSeconds: number;
    videoMediaId: string | null;
    videoHash: string | null;
    videoAsset: string | null;
  }>(`
    select l.id, l.courseId, c.title as courseTitle, l.position, l.title, l.notes, l.durationSeconds,
           (select count(*)::int from lessons x where x.courseId = l.courseId) as lessonCount,
           l.videoMediaId, m.hash as videoHash, l.videoAsset
      from lessons l
      join courses c on c.id = l.courseId
      left join media m on m.id = l.videoMediaId
     where l.id = ${id}::uuid
  `).first();

  if (!row) {
    throw new NotFoundError("lesson not found");
  }

  return {
    id: row.id,
    courseId: row.courseId,
    courseTitle: row.courseTitle,
    position: row.position,
    lessonCount: row.lessonCount,
    title: row.title,
    notes: row.notes,
    durationSeconds: row.durationSeconds,
    videoUrl: assetUrl(row.videoMediaId, row.videoHash, row.videoAsset),
  };
}

/** @rpc */
export function saveLesson(form: LessonForm): EditorLessonDetail {
  isInstructorOrThrow();

  let title = form.title.trim();

  if (!title) {
    throw new ValidationError("Give the lesson a title.");
  }

  sql(`update lessons set title = ${title}, notes = ${form.notes} where id = ${form.id}::uuid`);

  return loadLesson(form.id);
}

export interface VideoForm {
  lessonId: string;
  file: File;
}

/** @rpc */
export function uploadVideo(form: VideoForm): EditorLessonDetail {
  isInstructorOrThrow();

  if (!form.file) {
    throw new ValidationError("Choose a video first.");
  }

  let mediaId = storeMedia(form.file, "video");

  // The duration is unknown until the browser reads the new file's metadata.
  sql(`update lessons set videoMediaId = ${mediaId}, videoAsset = null, durationSeconds = 0 where id = ${form.lessonId}::uuid`);

  return loadLesson(form.lessonId);
}

/** Records the running time the editor's player read from the video. */
/** @rpc */
export function setDuration(lessonId: string, seconds: number) {
  isInstructorOrThrow();

  let rounded = Math.round(seconds);

  if (Number.isFinite(rounded) && rounded > 0) {
    sql(`update lessons set durationSeconds = ${rounded} where id = ${lessonId}::uuid`);
  }
}
