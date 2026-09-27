"use client";

import { useActionState, useState } from "react";
import type { PostInput } from "@/entities/post";
import { createPostAction } from "../api/post-actions";
import type { CreatePostState } from "../model/form-state";
import { PostForm } from "./post-form";

const initialState: CreatePostState = { status: "idle" };

export function CreatePostForm() {
  const [values, setValues] = useState<PostInput>({ title: "", body: "" });
  const [state, formAction, isPending] = useActionState(createPostAction, initialState);

  return (
    <PostForm
      action={formAction}
      values={values}
      onChange={setValues}
      fieldErrors={state.status === "invalid" ? state.fieldErrors : undefined}
      isPending={isPending}
      submitLabel="Опубликовать"
    />
  );
}
