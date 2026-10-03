import { LiveTable, ForbiddenError, ValidationError, session, sql } from "@elements/app";
import { canWatch } from "#app/shared/services/catalog";
import { isInstructor } from "#app/shared/services/admin";

export interface Question {
  id: string;
  createdAt: Date;
  lessonId: string;
  parentId: string | null;
  userId: string;
  userName: string;
  fromInstructor: boolean;
  body: string;
}

export const MAX_QUESTION = 4000;

/**
 * Lesson pages open this on `{ lessonId }` and the instructor's inbox opens
 * it whole. The channel is pinned so the notify trigger in the schema
 * migration reaches both.
 */
export let questions: LiveTable<Question> = new LiveTable<Question>({
  channel: (partition) => (partition ? `questions:${partition}` : "questions"),

  insert: (item) => {
    session.isLoggedInOrThrow();

    let userId = session.getOrThrow("userId");
    let body = (item.body ?? "").trim();

    if (!body) {
      throw new ValidationError("Write something first.");
    }

    if (body.length > MAX_QUESTION) {
      throw new ValidationError(`Keep it under ${MAX_QUESTION} characters.`);
    }

    let lesson = sql<{ courseId: string }>(
      `select courseId from lessons where id = ${item.lessonId!}::uuid`,
    ).firstOrThrow("lesson not found");

    let instructor = isInstructor(userId);

    if (!instructor && !canWatch(userId, lesson.courseId)) {
      throw new ForbiddenError("Buy the course to ask a question.");
    }

    if (item.parentId) {
      if (!instructor) {
        throw new ForbiddenError("Only the instructor replies to questions.");
      }

      let parent = sql(`
        select 1 from questions
         where id = ${item.parentId}::uuid and lessonId = ${item.lessonId!}::uuid and parentId is null
      `);

      if (parent.empty()) {
        throw new ValidationError("That question is gone.");
      }
    }

    let name = sql<{ name: string }>(`select name from users where id = ${userId}`).firstOrThrow().name;

    return sql<Question>(`
      insert into questions (id, lessonId, parentId, userId, userName, fromInstructor, body)
           values (${item.id}, ${item.lessonId!}, ${item.parentId ?? null}, ${userId}, ${name}, ${instructor}, ${body})
        returning *
    `).firstOrThrow();
  },

  update: () => {
    throw new ForbiddenError();
  },

  delete: (item) => {
    session.isLoggedInOrThrow();

    let userId = session.getOrThrow("userId");

    if (item.userId !== userId && !isInstructor(userId)) {
      throw new ForbiddenError();
    }

    questions.delete(item);
  },
});
