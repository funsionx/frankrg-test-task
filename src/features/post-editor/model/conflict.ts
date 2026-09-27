import type { Post } from "@/entities/post";
import type { UpdatePostState } from "./form-state";

type ConflictInput = {
  post: Post;
  baseVersion: number;
  state: UpdatePostState;
  isPending: boolean;
};

export function resolveConflict({ post, baseVersion, state, isPending }: ConflictInput): {
  latest: Post;
  hasConflict: boolean;
} {
  // Сервер может сообщить о конфликте раньше, чем придёт SSE-событие, поэтому берём самую свежую версию.
  const latest = state.status === "conflict" && state.current.version > post.version ? state.current : post;
  // Пока идёт своё сохранение, собственное SSE-событие может прийти раньше редиректа.
  return { latest, hasConflict: !isPending && latest.version > baseVersion };
}
