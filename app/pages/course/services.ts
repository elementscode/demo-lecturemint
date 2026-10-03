import { session, sql, AuthError } from "@elements/app";
import { startCheckout } from "#app/shared/checkout";

/**
 * Starts checkout for a course and returns the url to send the buyer to:
 * Stripe, or the in-app test checkout without a key. The price is read here,
 * never taken from the browser.
 */
/** @rpc */
export async function buyCourse(courseId: string): Promise<string> {
  if (!session.isLoggedIn()) {
    throw new AuthError("Sign in to buy this course.");
  }

  let userId = session.getOrThrow("userId");

  let course = sql<{ id: string; slug: string; title: string; tagline: string; priceCents: number; owned: boolean }>(`
    select c.id, c.slug, c.title, c.tagline, c.priceCents,
           exists (select 1 from purchases p
                    where p.courseId = c.id and p.userId = ${userId} and p.status = 'paid') as owned
      from courses c
     where c.id = ${courseId}::uuid and c.published
  `).firstOrThrow("course not found");

  if (course.owned) {
    return `/courses/${course.slug}`;
  }

  let email = sql<{ email: string }>(`select email from users where id = ${userId}`).firstOrThrow().email;

  let purchase = sql<{ id: string }>(`
    insert into purchases (userId, courseId, amountCents)
         values (${userId}, ${course.id}, ${course.priceCents})
      returning id
  `).firstOrThrow();

  return await startCheckout({
    purchaseId: purchase.id,
    slug: course.slug,
    title: course.title,
    tagline: course.tagline,
    amountCents: course.priceCents,
    email,
  });
}
