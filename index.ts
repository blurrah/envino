import { z, ZodObject, type ZodType } from "zod";

type Options = {
  disableProcessEnv?: boolean;
  envInput?: NodeJS.ProcessEnv;
};

type Variables = {
  [key: string]: {
    unset?: boolean;
    check: ZodType;
  };
};

type ParsedVariables = Record<string, ZodType>;

/**
 * Parses the variables object into a ZodObject ready for parsing
 * @param variables
 * @returns
 */
function prepareVariables<TVariables extends Variables>(
  variables: TVariables
): ParsedVariables {
  return Object.entries(variables).reduce(
    (acc: ParsedVariables, [key, value]) => {
      acc[key] = value.check as ZodType;
      return acc;
    },
    {}
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
    throw new Error(parsed.error.message);
  }

  // Step 2: (Optional) Unset variables
  for (const [key, value] of Object.entries(variables)) {
    if (value.unset) {
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
