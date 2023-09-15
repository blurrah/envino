import { z, ZodObject, type ZodType } from "zod";

type Options = {
  disableProcessEnv?: boolean;
  envInput?: NodeJS.ProcessEnv;
};

type VariableObject = {
  unset?: boolean;
  validate: ZodType;
};

type Variables = {
  [key: string]: VariableObject | ZodType;
};

type ParsedVariables = Record<string, ZodType>;

function checkIsVariableObject(
  variable: Variables[keyof Variables]
): variable is VariableObject {
  return variable.hasOwnProperty("validate");
}

/**
 * Parses the variables object into a ZodObject ready for parsing by zod.
 *
 * We allow both the direct ZodType and an object with additional options to be set on an environment variable.
 * This function will create an object with just the zod types so that we can create a zod object.
 */
function prepareVariables<TVariables extends Variables>(
  variables: TVariables
): ParsedVariables {
  return Object.entries(variables).reduce(
    (acc, [key, value]: [string, VariableObject | ZodType]) => {
      acc[key] = checkIsVariableObject(value) ? value.validate : value;
      return acc;
    },
    {} as ParsedVariables
  );
}

export function createEnv<TVariables extends Variables>(
  variables: TVariables,
  { disableProcessEnv, envInput }: Options = { disableProcessEnv: true }
): Readonly<z.infer<ZodObject<ParsedVariables>>> {
  // Step 1: Parse the env variables

  // Allow for potential input of env variables, fall back to process.env
  const env = envInput ?? process.env;

  const preparedVariables = prepareVariables(variables);

  const zodObject = z.object(preparedVariables);

  const parsed = zodObject.safeParse(env);

  if (!parsed.success) {
    console.error(parsed.error.flatten().fieldErrors);
    throw new Error("Error parsing environment variables");
  }

  // Step 2: (Optional) Unset variables
  for (const [key, value] of Object.entries(variables)) {
    if (checkIsVariableObject(value) && value.unset) {
      delete process.env[key];
    }
  }

  // Step 3: (Optional) Disable process.env access
  if (disableProcessEnv) {
    const disabledProcessEnv = new Proxy(process.env, {
      get(target, key) {
        throw new Error(
          `Cannot directly access process.env.${key.toString()}. Use the parsed object created by createEnv instead.`
        );
      },
    });

    // Override global process.env with proxy that disables getter
    process.env = disabledProcessEnv;
  }

  return parsed.data;
}
