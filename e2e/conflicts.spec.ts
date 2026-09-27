import { expect, test } from "@playwright/test";
import { createPost, uniqueTitle, waitForLiveUpdates } from "./helpers";

test("stale save rejected by the server shows a conflict", async ({ context }) => {
  const tabA = await context.newPage();
  const title = uniqueTitle("Серверный конфликт");
  const postUrl = await createPost(tabA, title);

  // SSE во вкладке B заблокирован, чтобы она не узнала об изменении заранее.
  const tabB = await context.newPage();
  await tabB.route("**/api/events", (route) => route.abort());
  await tabB.goto(`${postUrl}/edit`);
  await tabB.getByLabel("Текст").fill("Устаревшая правка");

  await tabA.goto(`${postUrl}/edit`);
  await tabA.getByLabel("Текст").fill("Свежая правка");
  await tabA.getByRole("button", { name: "Сохранить" }).click();
  await expect(tabA.getByText("Свежая правка")).toBeVisible();

  await tabB.getByRole("button", { name: "Сохранить" }).click();
  await expect(tabB.getByRole("alert").filter({ hasText: "Пост изменён в другом месте" })).toBeVisible();
  await expect(tabB.getByLabel("Текст")).toHaveValue("Устаревшая правка");

  await tabB.getByRole("button", { name: "Загрузить актуальную версию" }).click();
  await expect(tabB.getByLabel("Текст")).toHaveValue("Свежая правка");
});

test("concurrent edit shows a conflict and never overwrites silently", async ({ context }) => {
  const tabA = await context.newPage();
  const title = uniqueTitle("Конфликт");
  const postUrl = await createPost(tabA, title);

  const tabB = await context.newPage();
  await Promise.all([waitForLiveUpdates(tabB), tabB.goto(`${postUrl}/edit`)]);
  await tabB.getByLabel("Текст").fill("Правка из вкладки B");

  await tabA.goto(`${postUrl}/edit`);
  await tabA.getByLabel("Текст").fill("Правка из вкладки A");
  await tabA.getByRole("button", { name: "Сохранить" }).click();
  await expect(tabA.getByText("Правка из вкладки A")).toBeVisible();

  // B видит предупреждение, его текст не тронут, сохранить молча нельзя.
  const banner = tabB.getByRole("alert").filter({ hasText: "Пост изменён в другом месте" });
  await expect(banner).toBeVisible();
  await expect(tabB.getByLabel("Текст")).toHaveValue("Правка из вкладки B");
  await expect(tabB.getByRole("button", { name: "Сохранить" })).toBeDisabled();

  // Осознанная перезапись.
  await banner.getByRole("button", { name: "Оставить мои правки" }).click();
  await tabB.getByRole("button", { name: "Сохранить" }).click();
  await expect(tabB.getByText("Правка из вкладки B")).toBeVisible();
  await expect(tabA.getByText("Правка из вкладки B")).toBeVisible();
});
