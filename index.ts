import { z, ZodObject, type ZodType } from "zod";

type Options = {
  envInput?: NodeJS.ProcessEnv;
};

type VariableObject = {
  unset?: boolean;
  validate: ZodType;
};

type VariableContent = VariableObject | ZodType;

type Variables = {
  [key: string]: VariableContent;
};

type ParsedVariables<TVariables extends Variables> = {
  [TKey in keyof TVariables]: TVariables[TKey] extends VariableObject
    ? TVariables[TKey]["validate"]
    : TVariables[TKey] extends ZodType
    ? TVariables[TKey]
    : never;
};

/**
 * Simple check to see if the variable uses the shorthand syntax or the complete object syntax
 *
 * Should replace this with a more robust check in the future, where we check if it's a zod validation object
 */
function checkIsVariableObject(
  variable: Variables[keyof Variables]
): variable is VariableObject {
  // This is quite a finicky check, if zod ever adds a `validate` property to their validation objects this will break
  return variable.hasOwnProperty("validate");
}

/**
 * Parses the variables object into a ZodObject ready for parsing by zod.
 *
 * We allow both the direct ZodType and an object with additional options to be set on an environment variable.
 * This function will create an object with just the zod types so that we can create a zod object.
 */
function createFlattenedZodObject<TVariables extends Variables>(
  variables: TVariables
): ParsedVariables<TVariables> {
  return Object.entries(variables).reduce((acc, [key, value]) => {
    // Using reflect since we can't directly use a string to index the ParsedVariables object
    Reflect.set(
      acc,
      key,
      checkIsVariableObject(value) ? value.validate : value
    );
    return acc;
  }, {} as ParsedVariables<TVariables>); // TODO: Fix type casting
}

/**
 * Taints an object so that it cannot be accessed directly.
 * This is used to prevent direct access to the environment variable
 * @param obj Object with environment variables to taint
 * @returns Proxy object that throws an error when accessed
 */
export function taintEnvSource(obj: Dict<string>) {
  return new Proxy(obj, {
    get(target, key) {
      throw new Error(
        `Cannot directly access process.env.${key.toString()}. Use the parsed object created by createEnv instead.`
      );
    },
  });
}

/**
 * Taints the global process.env object so that it cannot be accessed directly.
 */
export function taintProcessEnv() {
  process.env = taintEnvSource(process.env);
}

/**
 * Creates a new environment object based on the provided variables.
 *
 * @param variables The variables to parse
 * @param options Options for the parser
 * @returns A readonly object with the parsed variables
 */
export function createEnv<TVariables extends Variables>({
  variables,
  options: { envInput } = {},
}: {
  variables: TVariables;
  options?: Options;
}): z.infer<ZodObject<ParsedVariables<TVariables>>> {
  // Allow for potential input of env variables, fall back to process.env
  const env = envInput ?? process.env;

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
