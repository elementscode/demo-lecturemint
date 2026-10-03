import { sql } from "@elements/app";

export interface Fixture {
  instructorId: string;
  studentId: string;
  otherId: string;
  courseId: string;
  lessonIds: string[];
  slug: string;
  studentEmail: string;
}

/** A small catalog for tests: one instructor, two students, a three-lesson course the first student owns. */
export function makeFixture(): Fixture {
  // users.email and courses.slug are unique and test files run in parallel, so each fixture gets its own
  let tag = crypto.randomUUID().slice(0, 8);
  let slug = `test-course-${tag}`;
  let studentEmail = `owner-${tag}@test.dev`;

  let user = (email: string, name: string, role: string) =>
    sql<{ id: string }>(`
      insert into users (email, name, passwordHash, role)
           values (${email}, ${name}, crypt('paintalong', genSalt('bf', 4)), ${role}::userRole)
        returning id
    `).firstOrThrow().id;

  let instructorId = user(`teach-${tag}@test.dev`, "Teacher", "instructor");
  let studentId = user(studentEmail, "Owner", "student");
  let otherId = user(`other-${tag}@test.dev`, "Other", "student");

  let courseId = sql<{ id: string }>(`
    insert into courses (slug, title, tagline, priceCents, published)
         values (${slug}, 'Test Course', 'Testing washes', 4900, true)
      returning id
  `).firstOrThrow().id;

  let lessonIds = [1, 2, 3].map((position) =>
    sql<{ id: string }>(`
      insert into lessons (courseId, position, title, durationSeconds)
           values (${courseId}, ${position}, ${`Lesson ${position}`}, 60)
        returning id
    `).firstOrThrow().id,
  );

  sql(`
    insert into purchases (userId, courseId, amountCents, status, paidAt)
         values (${studentId}, ${courseId}, 4900, 'paid', now())
  `);

  return { instructorId, studentId, otherId, courseId, lessonIds, slug, studentEmail };
}
