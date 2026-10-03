import { test, assert, equal, session, ValidationError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { saveLesson, setDuration, loadLesson } from "./services";

test("lesson editor", () => {
  let f = makeFixture();
  let id = f.lessonIds[0]!;

  test("saves title, notes and duration", () => {
    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });

    let saved = saveLesson({ id, title: "  Wet paper  ", notes: "## Tape it" });
    equal(saved.title, "Wet paper");

    setDuration(id, 94.6);
    equal(loadLesson(id).durationSeconds, 95);
  });

  test("an empty title is refused", () => {
    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });

    let threw = false;
    try {
      saveLesson({ id, title: " ", notes: "" });
    } catch (err) {
      threw = true;
      assert(err instanceof ValidationError, `got ${err}`);
    }

    assert(threw);
  });
});
