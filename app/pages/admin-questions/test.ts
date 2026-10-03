import { test, assert, equal, session, sql, ForbiddenError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { questions } from "#app/shared/services/questions";

test("the inbox can remove a question, other students cannot", () => {
  let f = makeFixture();
  let lessonId = f.lessonIds[0]!;

  session.login({ userId: f.studentId, userName: "Owner", role: "student" });
  let q = questions.view({ lessonId }).insert({ body: "Spam?", parentId: null, createdAt: new Date() });

  session.login({ userId: f.otherId, userName: "Other", role: "student" });
  let row = sql<any>(`select * from questions where id = ${q.id}`).firstOrThrow();

  let threw = false;
  try {
    questions.view().delete(row);
  } catch (err) {
    threw = true;
    assert(err instanceof ForbiddenError, `got ${err}`);
  }

  assert(threw);

  session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });
  questions.view().delete(row);
  equal(sql(`select 1 from questions where id = ${q.id}`).empty(), true);
});
