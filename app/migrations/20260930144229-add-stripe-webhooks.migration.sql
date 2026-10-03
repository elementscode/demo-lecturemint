-- add stripe webhooks
--
-- One row per url the app has served from in production. The app registers
-- its own Stripe endpoint on the first checkout and keeps the signing secret
-- here; Stripe returns it only when the endpoint is created.

create table stripeWebhooks (
  url text primary key,
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  endpointId text not null,
  secret text not null
);

create trigger stripeWebhooksTouchUpdatedAt
  before update on stripeWebhooks
  for each row execute function touchUpdatedAt();
