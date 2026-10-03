import { session, sql, ForbiddenError } from "@elements/app";
import { canWatch, listLessons, LessonItem } from "#app/shared/services/catalog";

/** Marks a lesson complete or not, and returns the course's lesson list. */
/** @rpc */
export function setComplete(lessonId: string, done: boolean): LessonItem[] {
  session.isLoggedInOrThrow();

  let userId = session.getOrThrow("userId");
  let lesson = sql<{ courseId: string }>(
    `select courseId from lessons where id = ${lessonId}::uuid`,
  ).firstOrThrow("lesson not found");

  if (!canWatch(userId, lesson.courseId)) {
    throw new ForbiddenError("Buy the course to track progress.");
  }

  if (done) {
    sql(`insert into lessonProgress (userId, lessonId) values (${userId}, ${lessonId}) on conflict do nothing`);
  } else {
    sql(`delete from lessonProgress where userId = ${userId} and lessonId = ${lessonId}`);
  }

  return listLessons(lesson.courseId, userId);
}
