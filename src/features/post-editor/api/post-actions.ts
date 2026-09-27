"use server";

import { redirect } from "next/navigation";
import { postService } from "@/entities/post/index.server";
import type { CreatePostState, UpdatePostState } from "../model/form-state";

export async function createPostAction(_prev: CreatePostState, formData: FormData): Promise<CreatePostState> {
  const result = postService.create(readPostInput(formData));
  if (result.status !== "created") return result;
  redirect(`/posts/${result.post.id}`);
}

export async function updatePostAction(_prev: UpdatePostState, formData: FormData): Promise<UpdatePostState> {
  const id = String(formData.get("id"));
  const expectedVersion = Number(formData.get("expectedVersion"));
  const result = postService.update(id, readPostInput(formData), expectedVersion);
  if (result.status !== "updated") return result;
  redirect(`/posts/${id}`);
}

function readPostInput(formData: FormData) {
  return { title: formData.get("title"), body: formData.get("body") };
}
