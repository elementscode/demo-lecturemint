-- add schema

-- Auto-update updatedAt on row changes.
create or replace function touchUpdatedAt()
returns trigger
language plpgsql
as $$
begin
  new.updatedAt = now();
  return new;
end;
$$;

create type userRole as enum ('student', 'instructor');

create table users (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  email text not null unique,
  name text not null,
  passwordHash text not null,
  role userRole not null default 'student'
);

create trigger usersTouchUpdatedAt
  before update on users
  for each row execute function touchUpdatedAt();

-- Uploaded covers and videos. The hash goes in the url so the bytes can be
-- cached forever.
create table media (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  name text not null,
  contentType text not null,
  size integer not null,
  data bytea not null,
  hash text generated always as (encode(sha256(data), 'hex')) stored
);

create trigger mediaTouchUpdatedAt
  before update on media
  for each row execute function touchUpdatedAt();

-- A cover or video is either an upload (the media id) or a file shipped with
-- the app (the asset key, used by the seed rows).
create table courses (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  slug text not null unique,
  title text not null,
  tagline text not null default '',
  description text not null default '',
  level text not null default 'Beginner',
  priceCents integer not null check (priceCents >= 100),
  coverMediaId uuid references media (id) on delete set null,
  coverAsset text,
  published boolean not null default false
);

create trigger coursesTouchUpdatedAt
  before update on courses
  for each row execute function touchUpdatedAt();

create table lessons (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  courseId uuid not null references courses (id) on delete cascade,
  position integer not null,
  title text not null,
  notes text not null default '',
  durationSeconds integer not null default 0,
  videoMediaId uuid references media (id) on delete set null,
  videoAsset text
);

create index lessonsCourseIdIdx on lessons (courseId, position);

create trigger lessonsTouchUpdatedAt
  before update on lessons
  for each row execute function touchUpdatedAt();

create type purchaseStatus as enum ('pending', 'paid');

create table purchases (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  userId uuid not null references users (id) on delete cascade,
  courseId uuid not null references courses (id) on delete cascade,
  amountCents integer not null,
  status purchaseStatus not null default 'pending',
  stripeSessionId text unique,
  paidAt timestamptz
);

-- One paid purchase per student per course; pending ones can pile up when a
-- buyer abandons checkout.
create unique index purchasesPaidIdx on purchases (userId, courseId) where status = 'paid';

create trigger purchasesTouchUpdatedAt
  before update on purchases
  for each row execute function touchUpdatedAt();

create table lessonProgress (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  userId uuid not null references users (id) on delete cascade,
  lessonId uuid not null references lessons (id) on delete cascade,
  unique (userId, lessonId)
);

create trigger lessonProgressTouchUpdatedAt
  before update on lessonProgress
  for each row execute function touchUpdatedAt();

-- A question has no parentId; a reply points at its question.
create table questions (
  id uuid primary key default uuidGenerateV7(),
  createdAt timestamptz not null default now(),
  updatedAt timestamptz not null default now(),
  lessonId uuid not null references lessons (id) on delete cascade,
  parentId uuid references questions (id) on delete cascade,
  userId uuid not null references users (id) on delete cascade,
  userName text not null,
  fromInstructor boolean not null default false,
  body text not null check (length(body) between 1 and 4000)
);

create index questionsLessonIdIdx on questions (lessonId);

create trigger questionsTouchUpdatedAt
  before update on questions
  for each row execute function touchUpdatedAt();

-- Every write reaches both the lesson page (partitioned on lessonId) and the
-- instructor's inbox (the whole table), whichever view or path made it. Both
-- hear the table's one channel.
create or replace function questionsNotify() returns trigger
language plpgsql as $$
declare
  r record;
  payload text;
begin
  r := coalesce(new, old);

  payload := json_build_object(
    'op', lower(tg_op),
    'data', json_build_object(
      'id', r.id,
      'createdAt', json_build_object('$type', 'Date', '$value', (extract(epoch from r.createdAt) * 1000)::bigint),
      'lessonId', r.lessonId,
      'parentId', r.parentId,
      'userId', r.userId,
      'userName', r.userName,
      'fromInstructor', r.fromInstructor,
      'body', r.body
    )
  )::text;

  if octet_length(payload) >= 8000 then
    payload := json_build_object('op', lower(tg_op), 'id', r.id)::text;
  end if;

  perform pg_notify(channel_name('questions'), payload);

  return r;
end;
$$;

create trigger questionsNotifyTrigger
  after insert or update or delete on questions
  for each row execute function questionsNotify();
