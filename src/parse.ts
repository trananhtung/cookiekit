export interface ParseOptions {
  /** Decode each cookie value. Default: a safe `decodeURIComponent`. */
  decode?: (value: string) => string;
}

function tryDecode(value: string): string {
  if (value.indexOf("%") === -1) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/**
 * Parse a `Cookie` header into a name → value map. The first occurrence of a
 * name wins; surrounding whitespace and a single layer of double quotes are
 * stripped, and values are decoded (default `decodeURIComponent`).
 *
 * ```ts
 * parse("a=1; b=hello%20world");      // { a: "1", b: "hello world" }
 * parse('id="42"; theme=dark');       // { id: "42", theme: "dark" }
 * ```
 */
export function parse(header: string, options: ParseOptions = {}): Record<string, string> {
  const decode = options.decode ?? tryDecode;
  const out: Record<string, string> = {};
  const len = header.length;
  let index = 0;

  while (index < len) {
    const eqIdx = header.indexOf("=", index);
    if (eqIdx === -1) break;

    let endIdx = header.indexOf(";", index);
    if (endIdx === -1) endIdx = len;
    else if (endIdx < eqIdx) {
      // A bare attribute with no value before this `=`; skip past it.
      index = header.lastIndexOf(";", eqIdx - 1) + 1;
      continue;
    }

    const key = header.slice(index, eqIdx).trim();
    if (out[key] === undefined) {
      let val = header.slice(eqIdx + 1, endIdx).trim();
      if (val.charCodeAt(0) === 0x22) val = val.slice(1, -1); // strip wrapping quotes
      out[key] = decode(val);
    }
    index = endIdx + 1;
  }
  return out;
}
