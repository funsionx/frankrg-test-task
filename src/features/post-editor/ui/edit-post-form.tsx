"use client";

import { useActionState, useState } from "react";
import type { Post, PostInput } from "@/entities/post";
import { updatePostAction } from "../api/post-actions";
import { resolveConflict } from "../model/conflict";
import type { UpdatePostState } from "../model/form-state";
import { PostForm } from "./post-form";

const initialState: UpdatePostState = { status: "idle" };

/**
 * `post` приходит свежим после каждого router.refresh() (см. features/live-sync),
 * а `baseVersion` — версия, с которой пользователь начал править.
 */
export function EditPostForm({ post }: { post: Post }) {
  const [values, setValues] = useState<PostInput>({ title: post.title, body: post.body });
  const [baseVersion, setBaseVersion] = useState(post.version);
  const [state, formAction, isPending] = useActionState(updatePostAction, initialState);

  const { latest, hasConflict } = resolveConflict({ post, baseVersion, state, isPending });

  const loadLatest = () => {
    setValues({ title: latest.title, body: latest.body });
    setBaseVersion(latest.version);
  };
  const keepMine = () => setBaseVersion(latest.version);

  return (
    <PostForm
      action={formAction}
      values={values}
      onChange={setValues}
      fieldErrors={state.status === "invalid" ? state.fieldErrors : undefined}
      isPending={isPending}
      submitLabel="Сохранить"
      submitDisabled={hasConflict}
    >
      <input type="hidden" name="id" value={post.id} />
      <input type="hidden" name="expectedVersion" value={baseVersion} />

      {hasConflict && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded border border-amber-500 bg-amber-50 p-3 text-amber-950"
        >
          <p>Пост изменён в другом месте. Ваши правки не сохранены.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={loadLatest} className="rounded border border-amber-700 px-3 py-1">
              Загрузить актуальную версию
            </button>
            <button type="button" onClick={keepMine} className="rounded border border-amber-700 px-3 py-1">
              Оставить мои правки
            </button>
          </div>
        </div>
      )}

      {state.status === "not_found" && (
        <p role="alert" className="text-red-700">
          Пост не найден.
        </p>
      )}
    </PostForm>
  );
}
