/**
 * The keys your app stores in the session, so `session.get("userId")` is
 * typed. `role` is for showing or hiding links; every instructor route and
 * rpc still checks the users table.
 */
declare module "@elements/app" {
  interface SessionData {
    userId: string;
    userName: string;
    role: "student" | "instructor";
  }
}

export {};
