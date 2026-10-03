import { getAppUrl, sql } from "@elements/app";
import { stripe, testCheckout } from "#app/shared/stripe";
import { ensureWebhook } from "#app/shared/stripe-webhook";

export interface CheckoutCourse {
  purchaseId: string;
  slug: string;
  title: string;
  tagline: string;
  amountCents: number;
  email: string;
}

/** Returns the url to send the buyer to: Stripe, or the test checkout. */
export async function startCheckout(course: CheckoutCourse): Promise<string> {
  if (testCheckout()) {
    return `/checkout/test/${course.purchaseId}`;
  }

  await ensureWebhook();

  let checkout = await stripe().checkout.sessions.create({
    mode: "payment",
    customer_email: course.email,
    client_reference_id: course.purchaseId,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: course.amountCents,
          product_data: {
            name: course.title,
            description: course.tagline || undefined,
          },
        },
      },
    ],
    success_url: `${getAppUrl()}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${getAppUrl()}/courses/${course.slug}`,
  });

  return checkout.url!;
}

/**
 * Records a paid session and grants the course. Idempotent: the return page
 * and the webhook both call it, in either order, any number of times. Returns
 * the course slug once paid.
 */
export async function fulfillCheckout(sessionId: string): Promise<string | undefined> {
  let checkout = await stripe().checkout.sessions.retrieve(sessionId);

  if (checkout.payment_status !== "paid" || !checkout.client_reference_id) {
    return undefined;
  }

  return recordPayment(checkout.id, checkout.client_reference_id, checkout.amount_total!);
}

/**
 * The one place a payment is recorded, real or test. Grants the course and
 * returns its slug.
 */
export function recordPayment(sessionId: string, purchaseId: string, amountCents: number): string | undefined {
  // A second paid checkout for a course the buyer already owns stays
  // pending rather than breaking the one-paid-purchase index.
  sql(`
    update purchases
       set status = 'paid',
           paidAt = now(),
           stripeSessionId = ${sessionId},
           amountCents = ${amountCents}
     where id = ${purchaseId}
       and status = 'pending'
       and not exists (select 1 from purchases owned
                        where owned.userId = purchases.userId
                          and owned.courseId = purchases.courseId
                          and owned.status = 'paid')
  `);

  return sql<{ slug: string }>(`
    select c.slug from purchases p join courses c on c.id = p.courseId
     where p.id = ${purchaseId}
  `).first()?.slug;
}
