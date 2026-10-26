![Online courses with card checkout, built by Claude Code on Elements: a lesson page with the lesson video of a bouquet being painted, the lesson title and a Mark complete button, and a sidebar with the course's progress and lesson list.](https://elements.dev/demos/01a0f469-f275-7996-aabe-5ae0c9242bdc/poster?v=62ae0e272091)

# Online courses with card checkout, built by Claude Code on Elements

> Lecturemint is a full-stack app built with Claude Code on Elements.

Courses sold by card, lesson videos with notes and progress, live lesson questions, and revenue and completion stats.

[Run this app on your machine](https://elements.dev/demos/01a0f469-f275-7996-aabe-5ae0c9242bdc). Use this demo as inspiration, or as the starting point for your own app. Your agent creates a new app with this one as the scaffold, and you prompt it to add whatever features you want.

## Payments

Students pay by card. Without a Stripe key, payments run through the built-in
test checkout: the Buy button opens an order summary inside the app, and its
Pay button grants the course the same way a real payment does. For real Stripe
Checkout, add a Stripe secret key (sandbox keys are free at
[dashboard.stripe.com/register](https://dashboard.stripe.com/register)) as
`STRIPE_SECRET_KEY` in `config/env/development.env`, and test with card
`4242 4242 4242 4242`, any future date and any CVC. Production requires the
key and registers its own Stripe webhook on the first checkout.

## How it's built

Lecturemint needed course sales by card, video lessons with progress, a question thread under each lesson that the instructor answers live, and a studio for uploading lessons and reading the numbers. Each of those is a part of Elements, so the agent spent its 29 minutes on the course platform itself.

- **Live questions and replies.** Lesson questions are a LiveTable, so a question appears on the lesson page and in the instructor's inbox the moment it is posted, and the reply shows up under it just as fast. Only students who bought the course can ask, and only the instructor replies.

- **Card payments.** Buying a course is one `@rpc` call that reads the price on the server and sends the student to Stripe. The course is granted once whether the return page or Stripe's webhook arrives first. Until a Stripe key is set, a test checkout inside the app takes the payment, and in production the app registers its own webhook.

- **Video uploads.** The instructor uploads lesson videos straight through a server call, and the app streams them so the player can jump to any point.

- **Progress as a function call.** Marking a lesson complete is one server call that checks the student owns the course and returns the updated progress.

- **Data from SQL files.** Migrations define the platform and seed the instructor, three courses with covers and six to eight lessons each with sample videos and notes, four students with purchases and progress, and eight questions.

- **Sessions and roles.** Every studio page and server call shares one guard on the instructor role.

## Why Elements

Elements is an integrated full-stack app framework and a project server. The project server checks the agent's work as it builds: it type-checks the server and browser code, analyzes the program, applies migrations and runs the tests, then reports the results to the agent. A security mistake, such as calling a server-only function from the browser, is a compile error. The agent reads the report and fixes its own mistakes before it tells you a feature is done. The same checks run on every feature you ask for next.
