export type SameSite = "lax" | "strict" | "none" | boolean;
export type Priority = "low" | "medium" | "high";

export interface SerializeOptions {
  /** Encode the value. Default `encodeURIComponent`. */
  encode?: (value: string) => string;
  /** `Max-Age` in seconds (integer). */
  maxAge?: number;
  /** `Expires` date. */
  expires?: Date;
  /** `Domain`. */
  domain?: string;
  /** `Path`. */
  path?: string;
  /** `HttpOnly` flag. */
  httpOnly?: boolean;
  /** `Secure` flag. */
  secure?: boolean;
  /** `Partitioned` flag (CHIPS). */
  partitioned?: boolean;
  /** `Priority` attribute. */
  priority?: Priority;
  /** `SameSite`: `true`→Strict, or `"lax"`/`"strict"`/`"none"`. */
  sameSite?: SameSite;
}

// RFC 6265 cookie-name token.
const NAME_RE = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/;
// cookie-value: cookie-octets (%x21, %x23-2B, %x2D-3A, %x3C-5B, %x5D-7E),
// optionally wrapped in a matched pair of double quotes.
const VALUE_RE = new RegExp(
  "^(\"?)[\\u0021\\u0023-\\u002B\\u002D-\\u003A\\u003C-\\u005B\\u005D-\\u007E]*\\1$",
);
// Domain: a hostname; Path: visible ASCII (%x20-3A, %x3D-7E) excluding ';'.
const DOMAIN_RE = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
const PATH_RE = /^[ -:=-~]*$/;

/**
 * Serialize a single `Set-Cookie` value with optional attributes. The name and
 * value are validated; the value is encoded (default `encodeURIComponent`).
 *
 * ```ts
 * serialize("sid", "abc", { httpOnly: true, secure: true, sameSite: "lax", maxAge: 3600 });
 * // "sid=abc; Max-Age=3600; HttpOnly; Secure; SameSite=Lax"
 * ```
 */
export function serialize(name: string, value: string, options: SerializeOptions = {}): string {
  const encode = options.encode ?? encodeURIComponent;

  if (!NAME_RE.test(name)) throw new TypeError(`serialize: invalid cookie name "${name}"`);
  const encoded = encode(value);
  if (encoded && !VALUE_RE.test(encoded)) {
    throw new TypeError(`serialize: invalid cookie value "${value}"`);
  }

  let out = `${name}=${encoded}`;

  if (options.maxAge !== undefined) {
    if (!Number.isInteger(options.maxAge)) {
      throw new TypeError(`serialize: maxAge must be an integer, got ${options.maxAge}`);
    }
    out += `; Max-Age=${options.maxAge}`;
  }
  if (options.domain !== undefined) {
    if (!DOMAIN_RE.test(options.domain)) {
      throw new TypeError(`serialize: invalid domain "${options.domain}"`);
    }
    out += `; Domain=${options.domain}`;
  }
  if (options.path !== undefined) {
    if (!PATH_RE.test(options.path)) {
      throw new TypeError(`serialize: invalid path "${options.path}"`);
    }
    out += `; Path=${options.path}`;
  }
  if (options.expires !== undefined) {
    const time = options.expires.getTime();
    if (Number.isNaN(time)) throw new TypeError("serialize: invalid expires date");
    out += `; Expires=${options.expires.toUTCString()}`;
  }
  if (options.httpOnly) out += "; HttpOnly";
  if (options.secure) out += "; Secure";
  if (options.partitioned) out += "; Partitioned";

  if (options.priority !== undefined) {
    const map: Record<Priority, string> = { low: "Low", medium: "Medium", high: "High" };
    const value_ = map[options.priority];
    if (!value_) throw new TypeError(`serialize: invalid priority "${options.priority}"`);
    out += `; Priority=${value_}`;
  }

  if (options.sameSite !== undefined && options.sameSite !== false) {
    const ss = options.sameSite === true ? "strict" : options.sameSite;
    const map: Record<string, string> = { lax: "Lax", strict: "Strict", none: "None" };
    const value_ = map[ss];
    if (!value_) throw new TypeError(`serialize: invalid sameSite "${String(options.sameSite)}"`);
    out += `; SameSite=${value_}`;
  }

  return out;
}
