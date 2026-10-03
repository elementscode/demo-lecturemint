export function formatPrice(cents: number): string {
  let dollars = cents / 100;

  return dollars % 1 === 0 ? `$${dollars}` : `$${dollars.toFixed(2)}`;
}

/** 754 -> "12:34", 45 -> "0:45". */
export function formatClock(seconds: number): string {
  let m = Math.floor(seconds / 60);
  let s = Math.round(seconds % 60);

  return `${m}:${String(s).padStart(2, "0")}`;
}

/** A course's total running time: "48 sec", "6 min", "1 hr 20 min". */
export function formatRuntime(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} sec`;
  }

  let minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }

  let hours = Math.floor(minutes / 60);
  let rest = minutes % 60;

  return rest ? `${hours} hr ${rest} min` : `${hours} hr`;
}

export function percent(done: number, total: number): number {
  return total === 0 ? 0 : Math.round((done / total) * 100);
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function timeAgo(date: Date): string {
  let seconds = Math.max(0, (Date.now() - +date) / 1000);

  if (seconds < 60) {
    return "just now";
  }

  let minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes}m ago`;
  }

  let hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours}h ago`;
  }

  let days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days}d ago`;
  }

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
