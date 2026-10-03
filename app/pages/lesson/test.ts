import { test, assert, equal, session, ForbiddenError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { setComplete } from "./services";

test("lesson progress", () => {
  let f = makeFixture();

  test("marking complete and undoing it", () => {
    session.login({ userId: f.studentId, userName: "Owner", role: "student" });

    equal(setComplete(f.lessonIds[1]!, true).map((l) => l.completed), [false, true, false]);
    equal(setComplete(f.lessonIds[1]!, true).filter((l) => l.completed).length, 1);
    equal(setComplete(f.lessonIds[1]!, false).some((l) => l.completed), false);
  });

  test("a student without the course cannot track it", () => {
    session.login({ userId: f.otherId, userName: "Other", role: "student" });

    let threw = false;
    try {
      setComplete(f.lessonIds[0]!, true);
    } catch (err) {
      threw = true;
      assert(err instanceof ForbiddenError, `got ${err}`);
    }

    assert(threw);
  });
});
