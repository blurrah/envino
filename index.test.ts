import { beforeEach, describe, expect, test } from "bun:test";
import { z } from "zod";
import { createEnv, taintProcessEnv } from ".";

beforeEach(() => {
  process.env = {};
});

describe("createEnv", () => {
  test("creates env object from process.env", () => {
    process.env.TEST = "test";
    expect(createEnv({ variables: { TEST: z.string() } })).toEqual({
      TEST: "test",
    });
  });

  test("creates env object from manual input, overriding process.env", () => {
    process.env.TEST = "test";
    const envInput = { TEST: "extra-test" };
    expect(
      createEnv({
        variables: { TEST: z.string() },
        options: { envInput },
      })
    ).toEqual({ TEST: "extra-test" });
  });

  test("unsets env variable if unset is true", () => {
    process.env.TEST = "test";
    createEnv({ variables: { TEST: { validate: z.string(), unset: true } } });

    expect(process.env.TEST).toBeUndefined();
  });

  test("throws error when input is incorrect", () => {
    process.env.TEST = "incorrect input";
    expect(() =>
      createEnv({ variables: { TEST: z.literal("test") } })
    ).toThrow();
  });
});

describe("taintProcessEnv", () => {
  test("throws error if process.env is accessed after tainting", () => {
    process.env.TEST = "test";
    taintProcessEnv();
    expect(() => process.env.TEST).toThrow();
  });
});
