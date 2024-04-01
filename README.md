# envino

Pour your environment variables safely into your codebase.
A collection of helper tools to work with environment variables in your codebase.

## Why

Improve process.env variable handling with:
 - [Zod](https://zod.dev/) parsing
 - Disabling access to `process.env` directly in your codebase

## Features
- Validate environment variables using `zod` using `createEnv()`
    - Allow unsetting or removing the environment variables the source object
- Disable access to `process.env` using `taintProcessEnv()`

-------

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
