# cookiekit

> Tiny, type-safe **HTTP cookie** parse & serialize — RFC 6265 with `SameSite`, `Partitioned`, and `Priority`. **Zero dependencies**.

[![CI](https://github.com/trananhtung/cookiekit/actions/workflows/ci.yml/badge.svg)](https://github.com/trananhtung/cookiekit/actions/workflows/ci.yml)
[![npm version](https://img.shields.io/npm/v/cookiekit.svg)](https://www.npmjs.com/package/cookiekit)
[![bundle size](https://img.shields.io/bundlephobia/minzip/cookiekit)](https://bundlephobia.com/package/cookiekit)
[![types](https://img.shields.io/npm/types/cookiekit.svg)](https://www.npmjs.com/package/cookiekit)
[![license](https://img.shields.io/npm/l/cookiekit.svg)](./LICENSE)

Reading a `Cookie` header and building a `Set-Cookie` is the kind of thing you
should never hand-roll — the encoding and attribute rules are fiddly and a
mistake is a security bug. `cookiekit` does both per RFC 6265, **validates**
names and values, and supports the modern attributes (`SameSite`, `Partitioned`,
`Priority`). **Zero dependencies**, isomorphic.

```ts
import { parse, serialize } from "cookiekit";

parse("sid=abc; theme=dark");
// { sid: "abc", theme: "dark" }

serialize("sid", "abc", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600 });
// "sid=abc; Max-Age=3600; HttpOnly; Secure; SameSite=Lax"
```

## Why cookiekit?

- **Both directions, done right.** `parse` decodes and de-quotes; `serialize`
  encodes and **validates** the name, value, domain, and path.
- **Modern attributes.** `SameSite` (`lax`/`strict`/`none`), `Partitioned`
  (CHIPS), and `Priority` — alongside `Max-Age`, `Expires`, `Domain`, `Path`,
  `HttpOnly`, `Secure`.
- **Safe by default.** Throws `TypeError` on an invalid name/value/domain/path
  instead of emitting a broken header.
- **Isomorphic & tiny.** Works in Node, Deno, Bun, the edge, and browsers. Full
  types, ESM + CJS, zero dependencies.

## Install

```bash
npm install cookiekit
# or: pnpm add cookiekit  /  yarn add cookiekit  /  bun add cookiekit
```

## `parse(header, options?)`

```ts
import { parse } from "cookiekit";

parse("a=1; b=hello%20world");  // { a: "1", b: "hello world" }
parse('id="42"; theme=dark');   // { id: "42", theme: "dark" }
parse("a=1; a=2");              // { a: "1" }  (first wins)

// custom decoder
parse("a=AAA", { decode: (v) => v.toLowerCase() }); // { a: "aaa" }
```

Whitespace is trimmed, a single layer of quotes is stripped, and values are
decoded (default `decodeURIComponent`, which falls back to the raw string on
malformed input).

## `serialize(name, value, options?)`

```ts
import { serialize } from "cookiekit";

serialize("sid", "abc", {
  maxAge: 60 * 60,        // Max-Age (integer seconds)
  expires: new Date(),    // Expires
  domain: "example.com",
  path: "/",
  httpOnly: true,
  secure: true,
  sameSite: "lax",        // "lax" | "strict" | "none" | true (= Strict)
  partitioned: true,      // CHIPS
  priority: "high",       // "low" | "medium" | "high"
});
```

```ts
interface SerializeOptions {
  encode?: (value: string) => string; // default encodeURIComponent
  maxAge?: number;        // integer seconds
  expires?: Date;
  domain?: string;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  partitioned?: boolean;
  priority?: "low" | "medium" | "high";
  sameSite?: "lax" | "strict" | "none" | boolean;
}
```

Invalid input throws `TypeError` — e.g. a name with spaces, a non-integer
`maxAge`, an invalid domain/path, or a value that doesn't survive encoding.

## Pairs well with

| Need | Use |
| --- | --- |
| Parse/stringify URL query strings | [`@billdaddy/qskit`](https://www.npmjs.com/package/@billdaddy/qskit) |
| Base64URL encode a signed cookie payload | [`codeckit`](https://www.npmjs.com/package/codeckit) |

## License

[MIT](./LICENSE) © Tung Tran
