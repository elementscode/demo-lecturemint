import { Request, Response, redirect } from "@elements/app";
import { fulfillCheckout } from "#app/shared/checkout";
import html from "./template";

export default async function route(req: Request, res: Response) {
  let sessionId = String(req.query.session_id ?? "");
  let slug: string | undefined;

  // A made-up or expired id is a page that says "processing", not a 500. The
  // webhook still fulfills a real one.
  try {
    slug = sessionId ? await fulfillCheckout(sessionId) : undefined;
  } catch {
    slug = undefined;
  }

  if (slug) {
    redirect(`/courses/${slug}?purchased=1`);
    return;
  }

  return new html();
}
