"use client";

import type { ReactNode } from "react";
import type { PostFieldErrors, PostInput } from "@/entities/post";

type PostFormProps = {
  action: (formData: FormData) => void;
  values: PostInput;
  onChange: (values: PostInput) => void;
  fieldErrors?: PostFieldErrors;
  isPending: boolean;
  submitLabel: string;
  submitDisabled?: boolean;
  /** Скрытые поля и уведомления, специфичные для конкретной формы. */
  children?: ReactNode;
};

export function PostForm({
  action,
  values,
  onChange,
  fieldErrors,
  isPending,
  submitLabel,
  submitDisabled = false,
  children,
}: PostFormProps) {
  return (
    <form action={action} className="flex flex-col gap-4" noValidate>
      {children}

      <label className="flex flex-col gap-1">
        <span className="font-medium">Заголовок</span>
        <input
          name="title"
          value={values.title}
          onChange={(e) => onChange({ ...values, title: e.target.value })}
          aria-invalid={Boolean(fieldErrors?.title)}
          aria-describedby={fieldErrors?.title ? "title-error" : undefined}
          className="rounded border border-neutral-400 px-2 py-1"
        />
        {fieldErrors?.title && (
          <span id="title-error" className="text-sm text-red-700">
            {fieldErrors.title}
          </span>
        )}
      </label>

      <label className="flex flex-col gap-1">
        <span className="font-medium">Текст</span>
        <textarea
          name="body"
          rows={12}
          value={values.body}
          onChange={(e) => onChange({ ...values, body: e.target.value })}
          aria-invalid={Boolean(fieldErrors?.body)}
          aria-describedby={fieldErrors?.body ? "body-error" : undefined}
          className="rounded border border-neutral-400 px-2 py-1 font-mono text-sm"
        />
        {fieldErrors?.body && (
          <span id="body-error" className="text-sm text-red-700">
            {fieldErrors.body}
          </span>
        )}
      </label>

      <div>
        <button
          type="submit"
          disabled={isPending || submitDisabled}
          className="rounded bg-neutral-900 px-4 py-2 text-white disabled:opacity-50"
        >
          {isPending ? "Сохранение…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
