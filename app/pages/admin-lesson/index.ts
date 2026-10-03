import { Request, Response } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { loadLesson } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  isInstructorOrThrow();

  return new html({ initial: loadLesson(req.path.id) });
}
