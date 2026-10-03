import { Request, Response, NotFoundError, redirect, session } from "@elements/app";
import { canWatch, findCourseBySlug, findLesson, listLessons } from "#app/shared/services/catalog";
import { isInstructor } from "#app/shared/services/admin";
import { questions } from "#app/shared/services/questions";
import html from "./template";

export default function route(req: Request, res: Response) {
  if (!session.isLoggedIn()) {
    redirect(`/signin?next=${encodeURIComponent(req.originalUrl)}`);
    return;
  }

  let userId = session.getOrThrow("userId");
  let course = findCourseBySlug(req.path.slug, userId);

  if (!course) {
    throw new NotFoundError("course not found");
  }

  if (!canWatch(userId, course.id)) {
    redirect(`/courses/${course.slug}`);
    return;
  }

  let lesson = findLesson(course.id, req.path.lessonId, userId);

  if (!lesson) {
    throw new NotFoundError("lesson not found");
  }

  return new html({
    course,
    lesson,
    initialLessons: listLessons(course.id, userId),
    questions: questions.view({ lessonId: lesson.id }),
    instructor: isInstructor(userId),
  });
}
