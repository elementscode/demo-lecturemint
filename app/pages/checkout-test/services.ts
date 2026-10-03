import { ForbiddenError, session, sql } from "@elements/app";
import { recordPayment } from "#app/shared/checkout";
import { testCheckout } from "#app/shared/stripe";

export interface TestOrder {
  purchaseId: string;
  status: string;
  amountCents: number;
  courseId: string;
  slug: string;
  title: string;
  tagline: string;
  lessonCount: number;
  totalSeconds: number;
}

/** The caller's purchase, with what the test checkout shows for it. */
export function findTestOrder(purchaseId: string): TestOrder | undefined {
  let userId = session.getOrThrow("userId");

  return sql<TestOrder>(`
    select p.id as purchaseId,
           p.status::text as status,
           p.amountCents,
           c.id as courseId,
           c.slug,
           c.title,
           c.tagline,
           (select count(*)::int from lessons l where l.courseId = c.id) as lessonCount,
           (select coalesce(sum(l.durationSeconds), 0)::int from lessons l where l.courseId = c.id) as totalSeconds
      from purchases p
      join courses c on c.id = p.courseId
     where p.id = ${purchaseId}::uuid
       and p.userId = ${userId}
  `).first();
}

/**
 * Pays a pending purchase through the in-app test checkout. Development
 * without a Stripe key only. Records through the same recordPayment a Stripe
 * payment uses, and returns the course slug.
 */
/** @rpc */
export function payTestPurchase(purchaseId: string): string {
  if (!testCheckout()) {
    throw new ForbiddenError("The test checkout is off.");
  }

  let userId = session.getOrThrow("userId");
  let purchase = sql<{ amountCents: number; slug: string }>(`
    select p.amountCents, c.slug
      from purchases p
      join courses c on c.id = p.courseId
     where p.id = ${purchaseId}::uuid
       and p.userId = ${userId}
       and p.status = 'pending'
  `).firstOrThrow("purchase not found");

  recordPayment(`test_${purchaseId}`, purchaseId, purchase.amountCents);

  return purchase.slug;
}
