import type { ParsedVariables, VariableObject, Variables } from "./types";

/**
 * Parses the variables object into a ZodObject ready for parsing by zod.
 *
 * We allow both the direct ZodType and an object with additional options to be set on an environment variable.
 * This function will create an object with just the zod types so that we can create a zod object.
 */
export function createFlattenedZodObject<TVariables extends Variables>(
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
 * Simple check to see if the variable uses the shorthand syntax or the complete object syntax
 *
 * Should replace this with a more robust check in the future, where we check if it's a zod validation object
 */
export function checkIsVariableObject(
  variable: Variables[keyof Variables]
): variable is VariableObject {
  // This is quite a finicky check, if zod ever adds a `validate` property to their validation objects this will break
  return (
    variable.hasOwnProperty("validate") && !variable.hasOwnProperty("parse")
  );
}
