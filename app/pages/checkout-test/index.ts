import { NotFoundError, Request, Response, redirect } from "@elements/app";
import { findCourseById } from "#app/shared/services/catalog";
import { testCheckout } from "#app/shared/stripe";
import { findTestOrder } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  if (!testCheckout()) {
    throw new NotFoundError();
  }

  let order = findTestOrder(req.path.purchaseId);

  if (!order) {
    throw new NotFoundError("checkout not found");
  }

  // Paid already, or replaced by a newer checkout for an owned course.
  if (order.status !== "pending") {
    redirect(`/courses/${order.slug}`);
    return;
  }

  return new html({ order, coverUrl: findCourseById(order.courseId)?.coverUrl ?? "" });
}
