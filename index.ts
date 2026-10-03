import { App, getEnv, redirect } from "@elements/app";
import config from "#config";
import home from "#app/pages/home";
import signin from "#app/pages/signin";
import signup from "#app/pages/signup";
import course from "#app/pages/course";
import lesson from "#app/pages/lesson";
import checkoutReturn from "#app/pages/checkout-return";
import checkoutTest from "#app/pages/checkout-test";
import admin from "#app/pages/admin";
import adminCourse from "#app/pages/admin-course";
import adminLesson from "#app/pages/admin-lesson";
import adminQuestions from "#app/pages/admin-questions";
import serveMedia from "#app/routes/media";
import serveSeedVideo from "#app/routes/seed-video";
import stripeWebhook from "#app/routes/stripe-webhook";
import notFound from "#app/pages/errors/not-found";
import unhandled from "#app/pages/errors/unhandled";
import { stripeConfigured } from "#app/shared/stripe";

if (getEnv() === "production" && !stripeConfigured()) {
  throw new Error("STRIPE_SECRET_KEY is required in production.");
}

const app = new App();

app.route("/", home);
app.route("/signin", signin);
app.route("/signup", signup);
app.route("/courses/:slug", course);
app.route("/courses/:slug/lessons/:lessonId", lesson);
app.route("/checkout/return", checkoutReturn);
app.route("/checkout/test/:purchaseId", checkoutTest);
app.route("/admin", admin);
app.route("/admin/courses/:id", adminCourse);
app.route("/admin/lessons/:id", adminLesson);
app.route("/admin/questions", adminQuestions);
app.route("/media/:id/:hash", serveMedia);
app.route("/seed-video/:key", serveSeedVideo);
app.route({ method: "post", path: "/stripe/webhook", handler: stripeWebhook });

app.error((req, res, err) => {
  switch (err.statusCode) {
    case 401:
      redirect(`/signin?next=${encodeURIComponent(req.originalUrl)}`);
      return;

    case 404:
      return notFound(req, res, err);

    default:
      return unhandled(req, res, err);
  }
});

app.start(config);
