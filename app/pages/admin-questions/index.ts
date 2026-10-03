import { Request, Response, sql } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { questions } from "#app/shared/services/questions";
import html, { LessonRef } from "./template";

export default function route(req: Request, res: Response) {
  isInstructorOrThrow();

  let lessons = sql<LessonRef>(`
    select l.id, l.position, l.title, c.title as courseTitle, c.slug as courseSlug
      from lessons l join courses c on c.id = l.courseId
  `).all();

  return new html({ questions: questions.view(), lessons });
}
