import { expect, type Page } from "@playwright/test";

export function uniqueTitle(prefix: string): string {
  return `${prefix} ${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

/** Создаёт пост через UI и возвращает его URL. */
export async function createPost(page: Page, title: string, body = "Текст поста"): Promise<string> {
  await page.goto("/posts/new");
  await page.getByLabel("Заголовок").fill(title);
  await page.getByLabel("Текст").fill(body);
  await page.getByRole("button", { name: "Опубликовать" }).click();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();
  return page.url();
}

/** Ждёт, пока LiveUpdates установит SSE-соединение, иначе событие может прийти раньше подписки. */
export async function waitForLiveUpdates(page: Page): Promise<void> {
  await page.waitForResponse((response) => response.url().endsWith("/api/events"));
}
