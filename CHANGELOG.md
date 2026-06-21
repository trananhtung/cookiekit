# Changelog

All notable changes to this project are documented here.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-22

### Added

- `parse(header, options?)` — RFC 6265 `Cookie` header → name/value map; trims
  whitespace, strips one layer of quotes, decodes values (custom `decode`
  supported), first occurrence wins.
- `serialize(name, value, options?)` — build a `Set-Cookie` value with `maxAge`,
  `expires`, `domain`, `path`, `httpOnly`, `secure`, `partitioned`, `priority`,
  and `sameSite` (`lax`/`strict`/`none`/`true`). Validates name, value, domain,
  and path; throws `TypeError` on invalid input.
- ESM + CJS builds, types, and CI across Node 18 / 20 / 22.
