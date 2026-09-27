import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Post } from "@/entities/post";
import { createPostAction, updatePostAction } from "./post-actions";

const { postService, redirect } = vi.hoisted(() => ({
  postService: { create: vi.fn(), update: vi.fn() },
  redirect: vi.fn(),
}));

vi.mock("@/entities/post/index.server", () => ({ postService }));
vi.mock("next/navigation", () => ({ redirect }));

const post: Post = {
  id: "p1",
  title: "Title",
  body: "Body",
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: null,
  version: 1,
};

function formData(fields: Record<string, string>): FormData {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createPostAction", () => {
  it("passes the submitted fields to the service and redirects to the new post", async () => {
    postService.create.mockReturnValue({ status: "created", post });

    await createPostAction({ status: "idle" }, formData({ title: "Title", body: "Body" }));

    expect(postService.create).toHaveBeenCalledWith({ title: "Title", body: "Body" });
    expect(redirect).toHaveBeenCalledWith("/posts/p1");
  });

  it("returns validation errors to the form without redirecting", async () => {
    const invalid = { status: "invalid", fieldErrors: { title: "Введите заголовок" } };
    postService.create.mockReturnValue(invalid);

    const state = await createPostAction({ status: "idle" }, formData({ title: "", body: "Body" }));

    expect(state).toEqual(invalid);
    expect(redirect).not.toHaveBeenCalled();
  });
});

describe("updatePostAction", () => {
  it("passes the post id and the numeric expected version to the service", async () => {
    postService.update.mockReturnValue({ status: "updated", post });

    await updatePostAction(
      { status: "idle" },
      formData({ id: "p1", expectedVersion: "3", title: "New", body: "New body" }),
    );

    expect(postService.update).toHaveBeenCalledWith("p1", { title: "New", body: "New body" }, 3);
    expect(redirect).toHaveBeenCalledWith("/posts/p1");
  });

  it.each([
    { status: "conflict", current: post },
    { status: "not_found" },
    { status: "invalid", fieldErrors: { body: "Введите текст" } },
  ])("returns the $status result to the form without redirecting", async (result) => {
    postService.update.mockReturnValue(result);

    const state = await updatePostAction(
      { status: "idle" },
      formData({ id: "p1", expectedVersion: "1", title: "Title", body: "Body" }),
    );

    expect(state).toEqual(result);
    expect(redirect).not.toHaveBeenCalled();
  });
});
