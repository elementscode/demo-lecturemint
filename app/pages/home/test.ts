import { test, equal, sql } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { listPublishedCourses } from "#app/shared/services/catalog";

test("home lists published courses for a visitor", () => {
  let f = makeFixture();

  let course = listPublishedCourses(null).find((c) => c.id === f.courseId);
  equal(course!.title, "Test Course");
  equal(course!.owned, false);
  equal(sql(`select 1 from courses where id = ${f.courseId}`).all().length, 1);
});
