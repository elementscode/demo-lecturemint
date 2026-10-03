import { Request, Response } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { courseStats, recentSales, totals } from "./services";
import html from "./template";

export default function route(req: Request, res: Response) {
  isInstructorOrThrow();

  let courses = courseStats();

  return new html({
    courses,
    totals: totals(courses),
    sales: recentSales(),
  });
}
