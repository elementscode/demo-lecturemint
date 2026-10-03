import { test, assert, equal, session, sql, NotFoundError } from "@elements/app";
import { makeFixture } from "#app/shared/fixtures";
import { findCourseBySlug } from "#app/shared/services/catalog";
import { buyCourse } from "#app/pages/course/services";
import { testCheckout } from "#app/shared/stripe";
import { findTestOrder, payTestPurchase } from "./services";

// Tests read config/env/development.env, so with a Stripe key set there the
// pay button goes to real Stripe Checkout and these do not apply.
test("the test checkout", () => {
  if (!testCheckout()) {
    return;
  }

  let f = makeFixture();

  test("buying without a key goes to the in-app checkout and grants the course", async () => {
    session.login({ userId: f.otherId, userName: "Other", role: "student" });
    let url = await buyCourse(f.courseId);
    assert(url.startsWith("/checkout/test/"), `got ${url}`);

    let purchaseId = url.split("/").pop()!;
    let order = findTestOrder(purchaseId)!;
    equal(order.status, "pending");
    equal(order.amountCents, 4900);
    equal(order.title, "Test Course");
    equal(order.lessonCount, 3);
    equal(findCourseBySlug("test-course", f.otherId)!.owned, false);

    equal(payTestPurchase(purchaseId), "test-course");

    let paid = sql<{ status: string; stripeSessionId: string; paidAt: Date | null }>(`
      select status::text, stripeSessionId, paidAt from purchases where id = ${purchaseId}
    `).firstOrThrow();
    equal(paid.status, "paid");
    equal(paid.stripeSessionId, `test_${purchaseId}`);
    assert(paid.paidAt !== null);
    equal(findCourseBySlug("test-course", f.otherId)!.owned, true);

    let threw = false;
    try {
      payTestPurchase(purchaseId);
    } catch (err) {
      threw = true;
      assert(err instanceof NotFoundError, `got ${err}`);
    }

    assert(threw, "a paid purchase cannot be paid again");
    equal(await buyCourse(f.courseId), "/courses/test-course");
  });

  test("another student's checkout is not found", async () => {
    session.login({ userId: f.instructorId, userName: "Teacher", role: "instructor" });
    let url = await buyCourse(f.courseId);
    let purchaseId = url.split("/").pop()!;

    session.login({ userId: f.studentId, userName: "Owner", role: "student" });
    equal(findTestOrder(purchaseId), undefined);
  });
});
