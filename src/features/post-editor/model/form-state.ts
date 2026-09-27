import type { Post, PostFieldErrors } from "@/entities/post";

export type CreatePostState = { status: "idle" } | { status: "invalid"; fieldErrors: PostFieldErrors };

export type UpdatePostState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: PostFieldErrors }
  | { status: "conflict"; current: Post }
  | { status: "not_found" };
