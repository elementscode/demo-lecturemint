import { test, equal } from "@elements/app";
import { safeNext } from "#app/shared/next";

test("signin only returns to paths on this site", () => {
  equal(safeNext("/courses/wet-on-wet-skies"), "/courses/wet-on-wet-skies");
  equal(safeNext("//evil.example"), "/");
  equal(safeNext("https://evil.example"), "/");
  equal(safeNext(undefined), "/");
});
