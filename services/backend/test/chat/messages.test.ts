import { describe, expect, it } from "vitest";

import {
  parseMessageBody,
  parseMessageLimit,
} from "../../src/functions/lib/chat/messages";

describe("parseMessageLimit", () => {
  it("defaults to 50 when missing or empty", () => {
    expect(parseMessageLimit(undefined)).toBe(50);
    expect(parseMessageLimit("")).toBe(50);
  });

  it("accepts integers in 1..100", () => {
    expect(parseMessageLimit("1")).toBe(1);
    expect(parseMessageLimit("100")).toBe(100);
  });

  it("rejects invalid limits", () => {
    expect(parseMessageLimit("0")).toBeNull();
    expect(parseMessageLimit("101")).toBeNull();
    expect(parseMessageLimit("1.5")).toBeNull();
    expect(parseMessageLimit("abc")).toBeNull();
  });
});

describe("parseMessageBody", () => {
  it("trims and accepts valid bodies", () => {
    expect(parseMessageBody("  hello  ")).toBe("hello");
  });

  it("rejects empty, non-string, and overlong bodies", () => {
    expect(parseMessageBody("")).toBeNull();
    expect(parseMessageBody("   ")).toBeNull();
    expect(parseMessageBody(null)).toBeNull();
    expect(parseMessageBody(123)).toBeNull();
    expect(parseMessageBody("x".repeat(4001))).toBeNull();
  });

  it("accepts the max length body", () => {
    expect(parseMessageBody("x".repeat(4000))?.length).toBe(4000);
  });
});
