import type { Post } from "./post";

export type PostPatch = Pick<Post, "title" | "body" | "updatedAt">;

export type RepositoryUpdateResult =
  { status: "updated"; post: Post } | { status: "conflict"; current: Post } | { status: "not_found" };

export interface PostRepository {
  list(): Post[];
  findById(id: string): Post | null;
  insert(post: Post): void;
  update(id: string, patch: PostPatch, expectedVersion: number): RepositoryUpdateResult;
}
