import { describe, it, expect } from "vitest";
import { createRateLimiter, getClientIP } from "./rate-limit";

describe("createRateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = createRateLimiter({ max: 3, windowMs: 60000 });
    const r1 = limiter.check("test-ip");
    expect(r1.limited).toBe(false);
    expect(r1.remaining).toBe(2);
  });

  it("blocks requests at the limit", () => {
    const limiter = createRateLimiter({ max: 2, windowMs: 60000 });
    limiter.check("test-ip");
    limiter.check("test-ip");
    const r3 = limiter.check("test-ip");
    expect(r3.limited).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("tracks different IPs independently", () => {
    const limiter = createRateLimiter({ max: 1, windowMs: 60000 });
    limiter.check("ip-a");
    const blocked = limiter.check("ip-a");
    expect(blocked.limited).toBe(true);

    const other = limiter.check("ip-b");
    expect(other.limited).toBe(false);
  });
});

describe("getClientIP", () => {
  it("extracts first IP from x-forwarded-for", () => {
    const req = new Request("http://localhost", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIP(req)).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://localhost", {
      headers: { "x-real-ip": "10.0.0.1" },
    });
    expect(getClientIP(req)).toBe("10.0.0.1");
  });

  it("returns 127.0.0.1 when no headers present", () => {
    const req = new Request("http://localhost");
    expect(getClientIP(req)).toBe("127.0.0.1");
  });
});
