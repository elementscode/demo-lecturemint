import { sql, session, ForbiddenError } from "@elements/app";

export function isInstructor(userId: string): boolean {
  return !sql(`select 1 from users where id = ${userId} and role = 'instructor'`).empty();
}

export function isInstructorOrThrow() {
  session.isLoggedInOrThrow();

  if (!isInstructor(session.getOrThrow("userId"))) {
    throw new ForbiddenError("Instructor access required.");
  }
}
