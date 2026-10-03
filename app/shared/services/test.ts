import { test, assert, equal, session, sql, AuthError, ForbiddenError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { signin, signup } from "./auth";
import { assetUrl, canWatch, findCourseBySlug, listLessons, listPublishedCourses } from "./catalog";
import { questions } from "./questions";

test("auth", () => {
  let f = makeFixture();

  test("signin sets the session with the role", () => {
    signin(`${f.studentEmail.toUpperCase()} `, "paintalong");
    equal(session.get("userName"), "Owner");
    equal(session.get("role"), "student");
  });

  test("a wrong password is refused", () => {
    let threw = false;

    try {
      signin(f.studentEmail, "nope-nope");
    } catch (err) {
      threw = true;
      assert(err instanceof AuthError, `got ${err}`);
    }

    assert(threw);
  });

  test("signup creates a student", () => {
    signup("New Painter", "new@test.dev", "longenough");
    equal(sql<{ role: string }>(`select role from users where email = 'new@test.dev'`).firstOrThrow().role, "student");
  });
});

test("catalog", () => {
  let f = makeFixture();

  test("an owner sees ownership and progress", () => {
    sql(`insert into lessonProgress (userId, lessonId) values (${f.studentId}, ${f.lessonIds[0]!})`);

    let course = findCourseBySlug(f.slug, f.studentId)!;
    equal(course.owned, true);
    equal(course.lessonCount, 3);
    equal(course.completedCount, 1);
    equal(course.totalSeconds, 180);
    equal(listLessons(f.courseId, f.studentId).map((l) => l.completed), [true, false, false]);
  });

  test("drafts stay out of the catalog", () => {
    let listed = () => listPublishedCourses(null).some((c) => c.id === f.courseId);
    equal(listed(), true);
    sql(`update courses set published = false where id = ${f.courseId}`);
    equal(listed(), false);
  });

  test("who can watch", () => {
    equal(canWatch(f.studentId, f.courseId), true);
    equal(canWatch(f.otherId, f.courseId), false);
    equal(canWatch(f.instructorId, f.courseId), true);
    equal(canWatch(null, f.courseId), false);
  });

  test("seed videos go through the range route, covers do not", () => {
    equal(assetUrl(null, null, "bot-1"), "/seed-video/bot-1");
    assert(assetUrl(null, null, "botanical-watercolor").endsWith(".jpg"));
  });
});

test("questions", () => {
  let f = makeFixture();
  let lessonId = f.lessonIds[0]!;

  let ask = (body: string, parentId: string | null = null) =>
    questions.view({ lessonId }).insert({
      body,
      parentId,
      userId: session.get("userId") ?? "",
      userName: "",
      fromInstructor: false,
      createdAt: new Date(),
    });

  test("an owner asks, the instructor replies", () => {
    session.login({ userId: f.studentId, userName: "Owner", role: "student" });
    let question = ask("How wet should the paper be?");

    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });
    ask("Shiny, but no puddles.", question.id);

    let rows = sql<{ userName: string; fromInstructor: boolean }>(
      `select userName, fromInstructor from questions where lessonId = ${lessonId} order by parentId is not null`,
    ).all();
    equal(rows, [
      { userName: "Owner", fromInstructor: false },
      { userName: "Teacher", fromInstructor: true },
    ]);
  });

  test("a student who has not bought the course cannot ask", () => {
    session.login({ userId: f.otherId, userName: "Other", role: "student" });

    let threw = false;
    try {
      ask("Can I peek?");
    } catch (err) {
      threw = true;
      assert(err instanceof ForbiddenError, `got ${err}`);
    }

    assert(threw);
  });

  test("students cannot reply", () => {
    session.login({ userId: f.studentId, userName: "Owner", role: "student" });
    let question = ask("First question");

    let threw = false;
    try {
      ask("Answering myself", question.id);
    } catch (err) {
      threw = true;
      assert(err instanceof ForbiddenError, `got ${err}`);
    }

    assert(threw);
  });
});
