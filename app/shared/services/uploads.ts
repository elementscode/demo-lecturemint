import { File, sql, ValidationError } from "@elements/app";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const VIDEO_TYPES = ["video/mp4", "video/webm"];

const MAX_IMAGE = 8 * 1024 * 1024;
const MAX_VIDEO = 60 * 1024 * 1024;

/** Stores an upload after checking its type and size, and returns the media id. */
export function storeMedia(file: File, kind: "image" | "video"): string {
  let allowed = kind === "image" ? IMAGE_TYPES : VIDEO_TYPES;
  let max = kind === "image" ? MAX_IMAGE : MAX_VIDEO;

  if (!allowed.includes(file.contentType)) {
    throw new ValidationError(kind === "image" ? "Upload a JPEG, PNG or WebP image." : "Upload an MP4 or WebM video.");
  }

  if (file.size > max) {
    throw new ValidationError(`That file is over ${Math.round(max / 1024 / 1024)} MB.`);
  }

  return sql<{ id: string }>(`
    insert into media (name, contentType, size, data)
         values (${file.name}, ${file.contentType}, ${file.size}, ${file.data})
      returning id
  `).firstOrThrow().id;
}
