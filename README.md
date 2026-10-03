![Lecturemint, an online watercolor course app built with Elements: a lesson page with the lesson video of a bouquet being painted, the lesson title and a Mark complete button, and a sidebar with the course's progress and lesson list.](https://elements.dev/demos/01a0f469-f275-7996-aabe-5ae0c9242bdc/poster?v=62ae0e272091)

# Lecturemint

> A demo app built with [Elements](https://elements.dev).

Courses sold by card, lesson videos with notes and progress, live lesson questions, and revenue and completion stats.

**Demo:** [Lecturemint](https://elements.dev/demos/01a0f469-f275-7996-aabe-5ae0c9242bdc)

## Agent specs

- **Agent:** Claude Code, Opus 5.5 Medium
- **Time:** 29 min
- **Cost:** $9.32 at API rates, September 2026

## Get started

```bash
elements create lecturemint -scaffold=elementscode/demo-lecturemint
```

## Seed data and demo accounts

The seed creates the instructor, Iris Calder, and three published courses with
watercolor covers: Wet-on-Wet Skies (6 lessons, $49), Botanical Watercolor (7
lessons, $79) and Loose Landscapes (8 lessons, $99). Every lesson has a short
sample video of a painting coming together, and markdown notes. Four students
own one to three courses each, with partial progress, and eight questions sit
under lessons, some answered and two waiting for a reply.

The sign-in page lists every account and fills the form when you click one.
Students use the password `paintalong`; the instructor uses `watercolor`.

| Email                   | Role                 |
| ----------------------- | -------------------- |
| iris@lecturemint.test   | instructor (Studio)  |
| maya@lecturemint.test   | student, 2 courses   |
| theo@lecturemint.test   | student, 1 course    |
| priya@lecturemint.test  | student, 3 courses   |
| sam@lecturemint.test    | student, 1 course    |

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

### What Elements gave the app

- **Live questions and replies.** Lesson questions are a LiveTable, so a question appears on the lesson page and in the instructor's inbox the moment it is posted, and the reply shows up under it just as fast. Only students who bought the course can ask, and only the instructor replies.

- **Card payments.** Buying a course is one `@rpc` call that reads the price on the server and sends the student to Stripe. The course is granted once whether the return page or Stripe's webhook arrives first. Until a Stripe key is set, a test checkout inside the app takes the payment, and in production the app registers its own webhook.

- **Video uploads.** The instructor uploads lesson videos straight through a server call, and the app streams them so the player can jump to any point.

- **Progress as a function call.** Marking a lesson complete is one server call that checks the student owns the course and returns the updated progress.

- **Data from SQL files.** Migrations define the platform and seed the instructor, three courses with covers and six to eight lessons each with sample videos and notes, four students with purchases and progress, and eight questions.

- **Sessions and roles.** Every studio page and server call shares one guard on the instructor role.

### What the project server gave the agent

The project server runs alongside the agent and answers as soon as a file is saved: it type-checks the templates, TypeScript and SQL, applies migrations and reruns the tests, so every question came back right away and the agent kept building.

### What shipped

The app type-checks with zero errors and all 26 tests pass. Every page works on desktop and phone. A real sandbox payment went through Stripe end to end.

**Demo:** [Lecturemint](https://elements.dev/demos/01a0f469-f275-7996-aabe-5ae0c9242bdc)

## License

MIT. See [LICENSE](LICENSE).
