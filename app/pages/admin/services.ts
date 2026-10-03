import { sql } from "@elements/app";
import { isInstructorOrThrow } from "#app/shared/services/admin";

export interface CourseStats {
  id: string;
  slug: string;
  title: string;
  published: boolean;
  priceCents: number;
  lessonCount: number;
  students: number;
  revenueCents: number;
  avgCompletion: number;
  finished: number;
}

export interface Totals {
  revenueCents: number;
  students: number;
  enrollments: number;
  avgCompletion: number;
  openQuestions: number;
}

export interface RecentSale {
  id: string;
  studentName: string;
  courseTitle: string;
  amountCents: number;
  paidAt: Date;
}

export function courseStats(): CourseStats[] {
  return sql<CourseStats>(`
    with lessonCounts as (
      select courseId, count(*)::int as n from lessons group by courseId
    ),
    enrolled as (
      select p.courseId, p.userId, p.amountCents,
             (select count(*) from lessonProgress lp join lessons l on l.id = lp.lessonId
               where l.courseId = p.courseId and lp.userId = p.userId)::int as done
        from purchases p
       where p.status = 'paid'
    )
    select c.id, c.slug, c.title, c.published, c.priceCents,
           coalesce(lc.n, 0) as lessonCount,
           count(e.userId)::int as students,
           coalesce(sum(e.amountCents), 0)::int as revenueCents,
           coalesce(round(avg(case when lc.n > 0 then e.done * 100.0 / lc.n end)), 0)::int as avgCompletion,
           count(*) filter (where lc.n > 0 and e.done >= lc.n)::int as finished
      from courses c
      left join lessonCounts lc on lc.courseId = c.id
      left join enrolled e on e.courseId = c.id
     group by c.id, lc.n
     order by c.createdAt
  `).all();
}

export function totals(courses: CourseStats[]): Totals {
  let people = sql<{ students: number; openQuestions: number }>(`
    select (select count(distinct userId) from purchases where status = 'paid')::int as students,
           (select count(*) from questions q
             where q.parentId is null
               and not exists (select 1 from questions r where r.parentId = q.id and r.fromInstructor))::int as openQuestions
  `).firstOrThrow();

  let enrollments = courses.reduce((n, c) => n + c.students, 0);
  let weighted = courses.reduce((n, c) => n + c.avgCompletion * c.students, 0);

  return {
    revenueCents: courses.reduce((n, c) => n + c.revenueCents, 0),
    students: people.students,
    enrollments,
    avgCompletion: enrollments ? Math.round(weighted / enrollments) : 0,
    openQuestions: people.openQuestions,
  };
}

export function recentSales(): RecentSale[] {
  return sql<RecentSale>(`
    select p.id, u.name as studentName, c.title as courseTitle, p.amountCents, p.paidAt
      from purchases p
      join users u on u.id = p.userId
      join courses c on c.id = p.courseId
     where p.status = 'paid'
     order by p.paidAt desc
     limit 6
  `).all();
}

/** Creates a draft course and returns its editor url. */
/** @rpc */
export function createCourse(): string {
  isInstructorOrThrow();

  let slug = `new-course-${Date.now().toString(36)}`;
  let course = sql<{ id: string }>(`
    insert into courses (slug, title, tagline, priceCents)
         values (${slug}, 'Untitled course', '', 4900)
      returning id
  `).firstOrThrow();

  return `/admin/courses/${course.id}`;
}
