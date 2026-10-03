import { Request, Response, NotFoundError } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { findCourseById } from "#app/shared/services/catalog";
import { editorLessons, toForm } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  isInstructorOrThrow();

  let course = findCourseById(req.path.id);

  if (!course) {
    throw new NotFoundError("course not found");
  }

  return new html({
    initial: course,
    initialForm: toForm(course),
    initialLessons: editorLessons(course.id),
  });
}
