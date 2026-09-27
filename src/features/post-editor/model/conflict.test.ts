import { describe, expect, it } from "vitest";
import type { Post } from "@/entities/post";
import { resolveConflict } from "./conflict";

function makePost(version: number, title = `v${version}`): Post {
  return {
    id: "p1",
    title,
    body: "Body",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: null,
    version,
  };
}

describe("resolveConflict", () => {
  it("reports no conflict while the post is at the version editing started from", () => {
    const post = makePost(1);

    expect(resolveConflict({ post, baseVersion: 1, state: { status: "idle" }, isPending: false })).toEqual({
      latest: post,
      hasConflict: false,
    });
  });

  it("reports a conflict when a newer version arrives via live updates", () => {
    const post = makePost(2);

    expect(resolveConflict({ post, baseVersion: 1, state: { status: "idle" }, isPending: false })).toEqual({
      latest: post,
      hasConflict: true,
    });
  });

  it("prefers the server's current post when it is newer than the rendered one", () => {
    const current = makePost(2, "from server");

    const result = resolveConflict({
      post: makePost(1),
      baseVersion: 1,
      state: { status: "conflict", current },
      isPending: false,
    });

    expect(result).toEqual({ latest: current, hasConflict: true });
  });

  it("prefers the rendered post when live updates brought an even newer version", () => {
    const post = makePost(3);

    const result = resolveConflict({
      post,
      baseVersion: 1,
      state: { status: "conflict", current: makePost(2) },
      isPending: false,
    });

    expect(result.latest).toBe(post);
  });

  it("hides the conflict while the form is being submitted", () => {
    const result = resolveConflict({
      post: makePost(2),
      baseVersion: 1,
      state: { status: "idle" },
      isPending: true,
    });

    expect(result.hasConflict).toBe(false);
  });

  it("clears the conflict once the user accepts the latest version as the base", () => {
    const current = makePost(2);

    const result = resolveConflict({
      post: makePost(1),
      baseVersion: 2,
      state: { status: "conflict", current },
      isPending: false,
    });

    expect(result.hasConflict).toBe(false);
  });
});
