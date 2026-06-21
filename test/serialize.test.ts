import { describe, it, expect } from "vitest";
import { serialize, parse } from "../src/index.js";

describe("serialize — basics", () => {
  it("serializes a simple cookie", () => {
    expect(serialize("foo", "bar")).toBe("foo=bar");
  });

  it("encodes the value by default", () => {
    expect(serialize("foo", "hello world")).toBe("foo=hello%20world");
    expect(serialize("foo", "a@b.com")).toBe("foo=a%40b.com");
  });

  it("round-trips with parse", () => {
    const header = serialize("session", "a b&c=d");
    expect(parse(header)).toEqual({ session: "a b&c=d" });
  });

  it("rejects invalid names", () => {
    expect(() => serialize("foo bar", "x")).toThrow(TypeError);
    expect(() => serialize("foo\nbar", "x")).toThrow(TypeError);
  });

  it("rejects an un-encodable value from a custom encoder", () => {
    expect(() => serialize("foo", "a b", { encode: (v) => v })).toThrow(TypeError);
  });
});

describe("serialize — attributes", () => {
  it("Max-Age (integer only)", () => {
    expect(serialize("a", "b", { maxAge: 3600 })).toBe("a=b; Max-Age=3600");
    expect(() => serialize("a", "b", { maxAge: 1.5 })).toThrow(TypeError);
  });

  it("Expires", () => {
    const d = new Date("2030-01-01T00:00:00Z");
    expect(serialize("a", "b", { expires: d })).toBe(`a=b; Expires=${d.toUTCString()}`);
    expect(() => serialize("a", "b", { expires: new Date("nope") })).toThrow(TypeError);
  });

  it("Domain and Path with validation", () => {
    expect(serialize("a", "b", { domain: "example.com", path: "/" })).toBe(
      "a=b; Domain=example.com; Path=/",
    );
    expect(() => serialize("a", "b", { domain: "bad domain" })).toThrow(TypeError);
    expect(() => serialize("a", "b", { path: "/x;y" })).toThrow(TypeError);
  });

  it("boolean flags", () => {
    expect(serialize("a", "b", { httpOnly: true, secure: true, partitioned: true })).toBe(
      "a=b; HttpOnly; Secure; Partitioned",
    );
    expect(serialize("a", "b", { httpOnly: false })).toBe("a=b");
  });

  it("SameSite variants", () => {
    expect(serialize("a", "b", { sameSite: "lax" })).toBe("a=b; SameSite=Lax");
    expect(serialize("a", "b", { sameSite: "strict" })).toBe("a=b; SameSite=Strict");
    expect(serialize("a", "b", { sameSite: "none" })).toBe("a=b; SameSite=None");
    expect(serialize("a", "b", { sameSite: true })).toBe("a=b; SameSite=Strict");
    expect(serialize("a", "b", { sameSite: false })).toBe("a=b");
  });

  it("Priority", () => {
    expect(serialize("a", "b", { priority: "high" })).toBe("a=b; Priority=High");
    expect(serialize("a", "b", { priority: "low" })).toBe("a=b; Priority=Low");
  });

  it("composes attributes in a sensible order", () => {
    expect(
      serialize("sid", "abc", {
        maxAge: 3600,
        path: "/",
        httpOnly: true,
        secure: true,
        sameSite: "lax",
      }),
    ).toBe("sid=abc; Max-Age=3600; Path=/; HttpOnly; Secure; SameSite=Lax");
  });
});
