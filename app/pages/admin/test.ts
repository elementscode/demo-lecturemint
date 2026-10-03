import { test, assert, equal, session, sql, ForbiddenError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { isInstructorOrThrow } from "#app/shared/services/admin";
import { courseStats, totals } from "./services";

test("studio stats", () => {
  let f = makeFixture();

  sql(`insert into purchases (userId, courseId, amountCents, status) values (${f.otherId}, ${f.courseId}, 4900, 'pending')`);
  sql(`
    insert into lessonProgress (userId, lessonId)
    select ${f.studentId}::uuid, id from lessons where courseId = ${f.courseId}::uuid
  `);

  let [course] = courseStats();
  equal(course!.students, 1);
  equal(course!.revenueCents, 4900);
  equal(course!.avgCompletion, 100);
  equal(course!.finished, 1);

  let t = totals(courseStats());
  equal(t.revenueCents, 4900);
  equal(t.students, 1);
});

test("studio pages are for the instructor", () => {
  let f = makeFixture();

  session.login({ userId: f.studentId, userName: "Owner", role: "student" });

  let threw = false;
  try {
    isInstructorOrThrow();
  } catch (err) {
    threw = true;
    assert(err instanceof ForbiddenError, `got ${err}`);
  }

  assert(threw);
});
