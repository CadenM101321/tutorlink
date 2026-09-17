import { describe, expect, it } from "vitest";
import { homePathFor, isProtectedPath, safeNextPath } from "./paths";

describe("safeNextPath", () => {
  it("keeps paths on this site, including the query string", () => {
    expect(safeNextPath("/dashboard")).toBe("/dashboard");
    expect(safeNextPath("/tutor?tab=sessions")).toBe("/tutor?tab=sessions");
  });

  it("rejects anything that could leave the site", () => {
    expect(safeNextPath("https://evil.example")).toBeNull();
    expect(safeNextPath("//evil.example/login")).toBeNull();
    expect(safeNextPath("/\\evil.example")).toBeNull();
    expect(safeNextPath("javascript:alert(1)")).toBeNull();
    expect(safeNextPath("dashboard")).toBeNull();
  });

  it("rejects missing or non-text values", () => {
    expect(safeNextPath(null)).toBeNull();
    expect(safeNextPath(undefined)).toBeNull();
    expect(safeNextPath(["/dashboard"])).toBeNull();
  });
});

describe("isProtectedPath", () => {
  it("protects dashboards and everything under them", () => {
    expect(isProtectedPath("/dashboard")).toBe(true);
    expect(isProtectedPath("/tutor/settings")).toBe(true);
    expect(isProtectedPath("/admin")).toBe(true);
  });

  it("leaves public pages and look-alike paths open", () => {
    expect(isProtectedPath("/")).toBe(false);
    expect(isProtectedPath("/login")).toBe(false);
    expect(isProtectedPath("/tutors")).toBe(false);
    expect(isProtectedPath("/dashboards")).toBe(false);
  });
});

describe("homePathFor", () => {
  it("sends each role to its own dashboard", () => {
    expect(homePathFor("student")).toBe("/dashboard");
    expect(homePathFor("tutor")).toBe("/tutor");
    expect(homePathFor("admin")).toBe("/admin");
  });
});
