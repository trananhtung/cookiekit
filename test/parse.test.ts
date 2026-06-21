import { describe, it, expect } from "vitest";
import { parse } from "../src/index.js";

describe("parse", () => {
  it("parses basic pairs", () => {
    expect(parse("a=1; b=2")).toEqual({ a: "1", b: "2" });
    expect(parse("foo=bar")).toEqual({ foo: "bar" });
  });

  it("trims whitespace around names and values", () => {
    expect(parse("a = 1 ;   b= 2")).toEqual({ a: "1", b: "2" });
  });

  it("decodes percent-encoded values", () => {
    expect(parse("b=hello%20world")).toEqual({ b: "hello world" });
    expect(parse("u=a%40b.com")).toEqual({ u: "a@b.com" });
  });

  it("leaves malformed encoding untouched", () => {
    expect(parse("x=%E0%A4%A")).toEqual({ x: "%E0%A4%A" });
  });

  it("strips a single layer of double quotes", () => {
    expect(parse('id="42"')).toEqual({ id: "42" });
  });

  it("keeps the first occurrence of a duplicate name", () => {
    expect(parse("a=1; a=2")).toEqual({ a: "1" });
  });

  it("handles empty values and empty input", () => {
    expect(parse("a=; b=2")).toEqual({ a: "", b: "2" });
    expect(parse("")).toEqual({});
  });

  it("ignores stray pairs without =", () => {
    expect(parse("a=1; nonsense; b=2")).toEqual({ a: "1", b: "2" });
  });

  it("accepts a custom decoder", () => {
    expect(parse("a=AAA", { decode: (v) => v.toLowerCase() })).toEqual({ a: "aaa" });
  });
});
