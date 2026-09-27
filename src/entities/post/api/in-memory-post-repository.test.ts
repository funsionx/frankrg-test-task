import { describe, expect, it } from "vitest";
import { InMemoryPostRepository } from "./in-memory-post-repository";
import type { Post } from "../model/post";

function makePost(overrides: Partial<Post> = {}): Post {
  return {
    id: "p1",
    title: "Title",
    body: "Body",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: null,
    version: 1,
    ...overrides,
  };
}

describe("InMemoryPostRepository", () => {
  it("lists posts newest first", () => {
    const repo = new InMemoryPostRepository();
    repo.insert(makePost({ id: "old", createdAt: "2026-01-01T00:00:00.000Z" }));
    repo.insert(makePost({ id: "new", createdAt: "2026-01-02T00:00:00.000Z" }));

    expect(repo.list().map((p) => p.id)).toEqual(["new", "old"]);
  });

  it("returns null for an unknown id", () => {
    expect(new InMemoryPostRepository().findById("missing")).toBeNull();
  });

  it("applies the patch and bumps the version when expectedVersion matches", () => {
    const repo = new InMemoryPostRepository();
    repo.insert(makePost());

    const result = repo.update(
      "p1",
      { title: "New", body: "New body", updatedAt: "2026-01-03T00:00:00.000Z" },
      1,
    );

    expect(result).toEqual({
      status: "updated",
      post: makePost({ title: "New", body: "New body", updatedAt: "2026-01-03T00:00:00.000Z", version: 2 }),
    });
    expect(repo.findById("p1")?.version).toBe(2);
  });

  it("rejects the update on version mismatch and leaves the post untouched", () => {
    const repo = new InMemoryPostRepository();
    repo.insert(makePost({ version: 3 }));

    const result = repo.update("p1", { title: "New", body: "New", updatedAt: "x" }, 2);

    expect(result).toEqual({ status: "conflict", current: makePost({ version: 3 }) });
    expect(repo.findById("p1")).toEqual(makePost({ version: 3 }));
  });

  it("reports not_found for an unknown id", () => {
    const result = new InMemoryPostRepository().update(
      "missing",
      { title: "t", body: "b", updatedAt: "x" },
      1,
    );
    expect(result).toEqual({ status: "not_found" });
  });
});
