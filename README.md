# processdev

Parses environment variables and does a few other things:
- Optionally unset process.env so they can't leak in the same codebase
- Optionally disallow access to process.env object

To install dependencies:

```bash
bun install
```

To run:

```bash
bun run index.ts
```

This project was created using `bun init` in bun v1.0.0. [Bun](https://bun.sh) is a fast all-in-one JavaScript runtime.
