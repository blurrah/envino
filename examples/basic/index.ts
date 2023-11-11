import { config } from "dotenv";
import { z } from "zod";
import { createEnv } from "../..";

config({ path: "./examples/basic/.testenv" });

const parsedVariables = createEnv({
  variables: {
    TEST_ENV_VARIABLE: {
      validate: z.string(),
      unset: true,
    },
    TEST_BLA: z.string(),
  },
  options: {},
});

console.log(parsedVariables); // { TEST_ENV_VARIABLE: "test" }
console.log(process.env.TEST_ENV_VARIABLE); // undefined
console.log(process.env.TEST_BLA); // "test_bla_string"
