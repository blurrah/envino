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
  globalThis.process.env = taintEnvSource(globalThis.process.env);
}
