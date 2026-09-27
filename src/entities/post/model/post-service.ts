import type { Post, PostFieldErrors, PostInput } from "./post";
import { postInputSchema } from "./post";
import type { PostEventBus } from "./post-event-bus";
import type { PostRepository } from "./post-repository";

export type CreatePostResult =
  { status: "created"; post: Post } | { status: "invalid"; fieldErrors: PostFieldErrors };

export type UpdatePostResult =
  | { status: "updated"; post: Post }
  | { status: "invalid"; fieldErrors: PostFieldErrors }
  | { status: "conflict"; current: Post }
  | { status: "not_found" };

type Deps = {
  repository: PostRepository;
  events: PostEventBus;
  now?: () => Date;
  generateId?: () => string;
};

export class PostService {
  private readonly repository: PostRepository;
  private readonly events: PostEventBus;
  private readonly now: () => Date;
  private readonly generateId: () => string;

  constructor({ repository, events, now = () => new Date(), generateId = () => crypto.randomUUID() }: Deps) {
    this.repository = repository;
    this.events = events;
    this.now = now;
    this.generateId = generateId;
  }

  list(): Post[] {
    return this.repository.list();
  }

  get(id: string): Post | null {
    return this.repository.findById(id);
  }

  create(input: unknown): CreatePostResult {
    const parsed = parseInput(input);
    if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

    const post: Post = {
      id: this.generateId(),
      ...parsed.data,
      createdAt: this.now().toISOString(),
      updatedAt: null,
      version: 1,
    };
    this.repository.insert(post);
    this.events.publish({ type: "post.created", id: post.id, version: post.version });
    return { status: "created", post };
  }

  update(id: string, input: unknown, expectedVersion: number): UpdatePostResult {
    const parsed = parseInput(input);
    if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors };

    const result = this.repository.update(
      id,
      { ...parsed.data, updatedAt: this.now().toISOString() },
      expectedVersion,
    );
    if (result.status === "updated") {
      this.events.publish({ type: "post.updated", id, version: result.post.version });
    }
    return result;
  }
}

function parseInput(
  input: unknown,
): { ok: true; data: PostInput } | { ok: false; fieldErrors: PostFieldErrors } {
  const result = postInputSchema.safeParse(input);
  if (result.success) return { ok: true, data: result.data };

  const fieldErrors: PostFieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0];
    if ((field === "title" || field === "body") && !fieldErrors[field]) {
      fieldErrors[field] = issue.message;
    }
  }
  return { ok: false, fieldErrors };
}
