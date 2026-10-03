import { test, assert, equal, session, AuthError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { buyCourse } from "./services";

test("buying a course", () => {
  let f = makeFixture();

  test("needs a signed-in student", async () => {
    let threw = false;

    try {
      await buyCourse(f.courseId);
    } catch (err) {
      threw = true;
      assert(err instanceof AuthError, `got ${err}`);
    }

    assert(threw);
  });

  test("an owner is sent straight to the course", async () => {
    session.login({ userId: f.studentId, userName: "Owner", role: "student" });
    equal(await buyCourse(f.courseId), `/courses/${f.slug}`);
  });
});
