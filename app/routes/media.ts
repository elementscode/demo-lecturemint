import { Request, Response, session, sql } from "@elements/app";
import { canWatch } from "#app/shared/services/catalog";

// Types we are willing to render on our own origin. Everything else goes out
// as an opaque download.
const INLINE = new Set(["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/webm"]);

const YEAR = 31536000;

interface MediaInfo {
  id: string;
  contentType: string;
  hash: string;
  length: number;
  lessonCourseId: string | null;
}

/**
 * Serves an uploaded cover or video. Lesson videos are for students who own
 * the course, and a video answers byte ranges so the player can seek.
 */
export default function serveMedia(req: Request, res: Response) {
  let info = sql<MediaInfo>(`
    select m.id, m.contentType, m.hash, octet_length(m.data) as length,
           (select l.courseId from lessons l where l.videoMediaId = m.id limit 1) as lessonCourseId
      from media m
     where m.id = ${req.path.id}::uuid
  `).firstOrThrow("media not found");

  if (req.path.hash !== info.hash) {
    res.status(404);
    return res.end();
  }

  if (info.lessonCourseId && !canWatch(session.get("userId") ?? null, info.lessonCourseId)) {
    res.status(403);
    return res.end();
  }

  if (INLINE.has(info.contentType)) {
    res.setHeader("Content-Type", info.contentType);
  } else {
    res.setHeader("Content-Type", "application/octet-stream");
    res.setHeader("Content-Disposition", "attachment");
  }

  res.setHeader("Cache-Control", info.lessonCourseId ? "private, max-age=3600" : `public, max-age=${YEAR}, immutable`);
  res.setHeader("Accept-Ranges", "bytes");

  let range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range ?? ""));
  if (!range || (!range[1] && !range[2])) {
    return sql<{ data: Buffer }>(`select data from media where id = ${info.id}`).firstOrThrow().data;
  }

  let start = range[1] ? Number(range[1]) : Math.max(0, info.length - Number(range[2]));
  let end = range[1] && range[2] ? Math.min(Number(range[2]), info.length - 1) : info.length - 1;

  if (start >= info.length || start > end) {
    res.status(416);
    res.setHeader("Content-Range", `bytes */${info.length}`);
    return res.end();
  }

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${info.length}`);

  // Postgres substring is 1-based.
  return sql<{ data: Buffer }>(`
    select substring(data from ${start + 1} for ${end - start + 1}) as data from media where id = ${info.id}
  `).firstOrThrow().data;
}
