import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryPostRepository } from "../api/in-memory-post-repository";
import { InMemoryPostEventBus } from "../api/in-memory-post-event-bus";
import type { PostEvent } from "./post-event-bus";
import { PostService } from "./post-service";

describe("PostService", () => {
  let clock: Date;
  let ids: number;
  let events: PostEvent[];
  let service: PostService;

  beforeEach(() => {
    clock = new Date("2026-01-01T10:00:00.000Z");
    ids = 0;
    events = [];
    const bus = new InMemoryPostEventBus();
    bus.subscribe((event) => events.push(event));
    service = new PostService({
      repository: new InMemoryPostRepository(),
      events: bus,
      now: () => clock,
      generateId: () => `id-${++ids}`,
    });
  });

  function createPost(title = "Title", body = "Body") {
    const result = service.create({ title, body });
    if (result.status !== "created") throw new Error("expected post to be created");
    return result.post;
  }

  describe("create", () => {
    it("creates a post with trimmed fields, createdAt and version 1", () => {
      const result = service.create({ title: "  Hello ", body: " World  " });

      expect(result).toEqual({
        status: "created",
        post: {
          id: "id-1",
          title: "Hello",
          body: "World",
          createdAt: "2026-01-01T10:00:00.000Z",
          updatedAt: null,
          version: 1,
        },
      });
      expect(service.get("id-1")).toEqual(result.status === "created" ? result.post : null);
    });

    it("publishes post.created", () => {
      createPost();
      expect(events).toEqual([{ type: "post.created", id: "id-1", version: 1 }]);
    });

    it("returns field errors for blank or too long input and publishes nothing", () => {
      const result = service.create({ title: "   ", body: "x".repeat(10_001) });

      expect(result).toEqual({
        status: "invalid",
        fieldErrors: { title: "Введите заголовок", body: "Не длиннее 10000 символов" },
      });
      expect(service.list()).toEqual([]);
      expect(events).toEqual([]);
    });

    it("treats non-object input as invalid", () => {
      expect(service.create(null).status).toBe("invalid");
    });
  });

  describe("update", () => {
    it("updates fields, sets updatedAt, bumps version and keeps createdAt", () => {
      const post = createPost();
      clock = new Date("2026-01-01T11:00:00.000Z");

      const result = service.update(post.id, { title: "New", body: "New body" }, 1);

      expect(result).toEqual({
        status: "updated",
        post: {
          ...post,
          title: "New",
          body: "New body",
          updatedAt: "2026-01-01T11:00:00.000Z",
          version: 2,
        },
      });
    });

    it("publishes post.updated with the new version", () => {
      const post = createPost();
      events.length = 0;

      service.update(post.id, { title: "New", body: "New" }, 1);

      expect(events).toEqual([{ type: "post.updated", id: post.id, version: 2 }]);
    });

    it("returns conflict with the current post when expectedVersion is stale", () => {
      const post = createPost();
      service.update(post.id, { title: "First", body: "First" }, 1);
      events.length = 0;

      const result = service.update(post.id, { title: "Second", body: "Second" }, 1);

      expect(result).toMatchObject({ status: "conflict", current: { title: "First", version: 2 } });
      expect(service.get(post.id)?.title).toBe("First");
      expect(events).toEqual([]);
    });

    it("returns not_found for an unknown id", () => {
      expect(service.update("missing", { title: "t", body: "b" }, 1)).toEqual({ status: "not_found" });
      expect(events).toEqual([]);
    });

    it("validates input before touching the repository", () => {
      const post = createPost();
      events.length = 0;

      const result = service.update(post.id, { title: "", body: "" }, 1);

      expect(result).toEqual({
        status: "invalid",
        fieldErrors: { title: "Введите заголовок", body: "Введите текст" },
      });
      expect(service.get(post.id)?.version).toBe(1);
      expect(events).toEqual([]);
    });
  });

  describe("list", () => {
    it("returns posts newest first", () => {
      createPost("First");
      clock = new Date("2026-01-02T10:00:00.000Z");
      createPost("Second");

      expect(service.list().map((p) => p.title)).toEqual(["Second", "First"]);
    });
  });
});
