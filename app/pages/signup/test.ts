import { test, assert, AuthError } from "@elements/app";
import { signup } from "#app/shared/services/auth";

test("signup rejects a short password", () => {
  let threw = false;

  try {
    signup("Short", "short@test.dev", "abc");
  } catch (err) {
    threw = true;
    assert(err instanceof AuthError, `got ${err}`);
  }

  assert(threw);
});
