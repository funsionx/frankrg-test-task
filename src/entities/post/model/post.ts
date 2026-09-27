import { z } from "zod";

export type Post = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  updatedAt: string | null;
  version: number;
};

export const TITLE_MAX_LENGTH = 200;
export const BODY_MAX_LENGTH = 10_000;

export const postInputSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, "Введите заголовок")
    .max(TITLE_MAX_LENGTH, `Не длиннее ${TITLE_MAX_LENGTH} символов`),
  body: z
    .string()
    .trim()
    .min(1, "Введите текст")
    .max(BODY_MAX_LENGTH, `Не длиннее ${BODY_MAX_LENGTH} символов`),
});

export type PostInput = z.infer<typeof postInputSchema>;

export type PostFieldErrors = Partial<Record<keyof PostInput, string>>;
