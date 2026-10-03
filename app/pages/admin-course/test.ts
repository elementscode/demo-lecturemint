import { test, assert, equal, session, ValidationError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { editorLessons, moveLesson, deleteLesson, saveCourse } from "./services";

test("course editor", () => {
  let f = makeFixture();

  test("reorders and renumbers lessons", () => {
    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });

    let moved = moveLesson(f.courseId, f.lessonIds[2]!, -1);
    equal(moved.map((l) => l.title), ["Lesson 1", "Lesson 3", "Lesson 2"]);
    equal(moved.map((l) => l.position), [1, 2, 3]);

    let left = deleteLesson(f.courseId, f.lessonIds[0]!);
    equal(left.map((l) => l.position), [1, 2]);
  });

  test("saves details and rejects a bad price", () => {
    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });

    let saved = saveCourse({
      id: f.courseId,
      title: "Washes",
      slug: "Big Washes!",
      tagline: "",
      level: "Beginner",
      price: "59.50",
      description: "",
      published: true,
    });
    equal(saved.slug, "big-washes");
    equal(saved.priceCents, 5950);

    let threw = false;
    try {
      saveCourse({ ...editorForm(f.courseId), price: "0.5" });
    } catch (err) {
      threw = true;
      assert(err instanceof ValidationError, `got ${err}`);
    }

    assert(threw);
    equal(editorLessons(f.courseId).length, 3);
  });
});

function editorForm(id: string) {
  return { id, title: "T", slug: "t", tagline: "", level: "Beginner", price: "10", description: "", published: false };
}
