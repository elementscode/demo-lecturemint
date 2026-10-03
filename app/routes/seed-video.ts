import * as fs from "node:fs";
import * as path from "node:path";
import { Request, Response, session, sql } from "@elements/app";
import { SEED_ASSETS } from "#app/shared/seed-assets";
import { canWatch } from "#app/shared/services/catalog";

// The seed videos ship as app assets, but the asset server sends a whole file
// with no byte ranges, so a player cannot seek and Safari will not play it.
// This route serves the same file with ranges, behind the same access check
// as an uploaded video.

let root: string | null = null;

// The build writes a `.root` file at the top of the emitted tree, next to the
// `assets` directory the asset urls point into.
function emitRoot(): string {
  if (root) {
    return root;
  }

  let dir = __dirname;
  while (!fs.existsSync(path.join(dir, ".root"))) {
    let parent = path.dirname(dir);
    if (parent === dir) {
      throw new Error("could not find the build root");
    }

    dir = parent;
  }

  root = dir;

  return root;
}

export default function serveSeedVideo(req: Request, res: Response) {
  let key = String(req.path.key);
  let url = SEED_ASSETS[key];
  if (!url || !url.endsWith(".mp4")) {
    res.status(404);
    return res.end();
  }

  let lesson = sql<{ courseId: string }>(`
    select courseId from lessons where videoAsset = ${key} limit 1
  `).first();

  if (!lesson || !canWatch(session.get("userId") ?? null, lesson.courseId)) {
    res.status(403);
    return res.end();
  }

  let file = path.join(emitRoot(), new URL(url, "http://localhost").pathname);
  let size = fs.statSync(file).size;

  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Cache-Control", "private, max-age=3600");
  res.setHeader("Accept-Ranges", "bytes");

  let range = /^bytes=(\d*)-(\d*)$/.exec(String(req.headers.range ?? ""));
  if (!range || (!range[1] && !range[2])) {
    return fs.readFileSync(file);
  }

  let start = range[1] ? Number(range[1]) : Math.max(0, size - Number(range[2]));
  let end = range[1] && range[2] ? Math.min(Number(range[2]), size - 1) : size - 1;

  if (start >= size || start > end) {
    res.status(416);
    res.setHeader("Content-Range", `bytes */${size}`);
    return res.end();
  }

  res.status(206);
  res.setHeader("Content-Range", `bytes ${start}-${end}/${size}`);

  return fs.readFileSync(file).subarray(start, end + 1);
}
