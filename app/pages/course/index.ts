import { Request, Response, NotFoundError, session } from "@elements/app";
import { findCourseBySlug, listLessons, renderMarkdown } from "#app/shared/services/catalog";
import { isInstructor } from "#app/shared/services/admin";
import { testCheckout } from "#app/shared/stripe";
import html from "./template";

export default function route(req: Request, res: Response) {
  let userId = session.get("userId") ?? null;
  let instructor = userId ? isInstructor(userId) : false;
  let course = findCourseBySlug(req.path.slug, userId);

  if (!course || (!course.published && !instructor)) {
    throw new NotFoundError("course not found");
  }

  return new html({
    course,
    descriptionHtml: renderMarkdown(course.description),
    lessons: listLessons(course.id, userId),
    canWatch: course.owned || instructor,
    instructor,
    testMode: testCheckout(),
    justPurchased: req.query.purchased === "1",
  });
}
