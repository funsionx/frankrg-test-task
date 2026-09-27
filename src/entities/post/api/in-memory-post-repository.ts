import type { Post } from "../model/post";
import type { PostPatch, PostRepository, RepositoryUpdateResult } from "../model/post-repository";

export class InMemoryPostRepository implements PostRepository {
  private readonly posts = new Map<string, Post>();

  list(): Post[] {
    return [...this.posts.values()].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  findById(id: string): Post | null {
    return this.posts.get(id) ?? null;
  }

  insert(post: Post): void {
    this.posts.set(post.id, post);
  }

  update(id: string, patch: PostPatch, expectedVersion: number): RepositoryUpdateResult {
    const current = this.posts.get(id);
    if (!current) return { status: "not_found" };
    if (current.version !== expectedVersion) return { status: "conflict", current };

    const post: Post = { ...current, ...patch, version: current.version + 1 };
    this.posts.set(id, post);
    return { status: "updated", post };
  }
}
