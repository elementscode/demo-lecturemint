import { test, equal, sql } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { listPublishedCourses } from "#app/shared/services/catalog";

test("home lists published courses for a visitor", () => {
  makeFixture();

  let [course] = listPublishedCourses(null);
  equal(course!.title, "Test Course");
  equal(course!.owned, false);
  equal(sql<{ n: number }>(`select count(*)::int as n from courses`).firstOrThrow().n, 1);
});
