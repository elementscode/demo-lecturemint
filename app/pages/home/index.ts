import { Request, Response, session } from "@elements/app";
import { listPublishedCourses } from "#app/shared/services/catalog";
import html from "./template";

export default function route(req: Request, res: Response) {
  let courses = listPublishedCourses(session.get("userId") ?? null);

  return new html({ courses });
}
