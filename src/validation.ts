import { z, ZodObject } from "zod";
import { checkIsVariableObject, createFlattenedZodObject } from "./helpers";
import type { EnvInput, ParsedVariables, Variables } from "./types";

/**
 * Creates a new environment object based on the provided variables.
 *
 * @param variables The variables to parse
 * @param options Options for the parser
 * @returns A readonly object with the parsed variables
 */
export function createEnv<TVariables extends Variables>({
  variables,
  envInput = {},
}: {
  variables: TVariables;
  envInput?: EnvInput;
}): z.infer<ZodObject<ParsedVariables<TVariables>>> {
  // Allow for potential input of env variables, fall back to process.env
  const env = Object.keys(envInput).length > 0 ? envInput : process.env;

  // Flatten and collect all the zod validations from the variables object
  const preparedVariables = createFlattenedZodObject(variables);

  // Parse environment variables through zod
  const zodObject = z.object(preparedVariables);
  const parsed = zodObject.safeParse(env);

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Error parsing environment variables");
  }

  // Unset environment variables if `unset` is set to true
  for (const [key, value] of Object.entries(variables)) {
    if (checkIsVariableObject(value) && value.unset) {
      try {
        delete env[key];
      } catch (err) {}
    }
  }

  return parsed.data;
}
