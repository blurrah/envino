import { config } from "dotenv";
import { z } from "zod";
import { createEnv } from "../..";
const variables = config({ path: "./examples/basic/.env" });

const parsedVariables = createEnv({
  TEST_ENV_VARIABLE: {
    check: z.string(),
    unset: true,
  },
});

console.log(parsedVariables); // { TEST_ENV_VARIABLE: "test" }
console.log(process.env.TEST_ENV_VARIABLE);
