import type { ZodType } from "zod";

export type EnvInput = NodeJS.ProcessEnv | Record<string, unknown>;

export type VariableObject = {
  unset?: boolean;
  validate: ZodType;
};

export type VariableContent = VariableObject | ZodType;

export type Variables = {
  [key: string]: VariableContent;
};

export type ParsedVariables<TVariables extends Variables> = {
  [TKey in keyof TVariables]: TVariables[TKey] extends VariableObject
    ? TVariables[TKey]["validate"]
    : TVariables[TKey] extends ZodType
    ? TVariables[TKey]
    : never;
};
