/** A same-site path to return to after signing in, or "/". */
export function safeNext(next: unknown): string {
  let path = typeof next === "string" ? next : "";

  return path.startsWith("/") && !path.startsWith("//") ? path : "/";
}
