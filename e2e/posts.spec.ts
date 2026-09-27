import { expect, test } from "@playwright/test";
import { createPost, uniqueTitle } from "./helpers";

test("lists posts and opens one by direct link", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("link", { name: "Добро пожаловать" });
  await expect(link).toBeVisible();

  await link.click();
  await expect(page.getByRole("heading", { level: 1, name: "Добро пожаловать" })).toBeVisible();
  await expect(page.getByRole("definition").nth(1)).toHaveText("—");

  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: "Добро пожаловать" })).toBeVisible();
});

test("unknown post shows 404", async ({ page }) => {
  const response = await page.goto("/posts/does-not-exist");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Страница не найдена" })).toBeVisible();
});

test("create, view and edit a post", async ({ page }) => {
  const title = uniqueTitle("Первый пост");
  await createPost(page, title, "Строка 1\nСтрока 2");

  await expect(page.getByText("Строка 1\nСтрока 2")).toBeVisible();
  await expect(page.getByRole("definition").nth(1)).toHaveText("—");

  await page.getByRole("link", { name: "Редактировать" }).click();
  const editedTitle = `${title} (изменён)`;
  await page.getByLabel("Заголовок").fill(editedTitle);
  await page.getByRole("button", { name: "Сохранить" }).click();

  await expect(page.getByRole("heading", { level: 1, name: editedTitle })).toBeVisible();
  await expect(page.getByRole("definition").nth(1)).not.toHaveText("—");

  await page.getByRole("link", { name: "Все посты" }).click();
  const row = page.getByRole("row").filter({ hasText: editedTitle });
  await expect(row.getByRole("cell")).toHaveCount(3);
  await expect(row.getByRole("cell").nth(2)).not.toHaveText("—");
});

test("shows validation errors and keeps the input", async ({ page }) => {
  await page.goto("/posts/new");
  await page.getByLabel("Текст").fill("Текст без заголовка");
  await page.getByRole("button", { name: "Опубликовать" }).click();

  await expect(page.getByText("Введите заголовок")).toBeVisible();
  await expect(page.getByLabel("Текст")).toHaveValue("Текст без заголовка");
});

test("direct links and reload work on every page", async ({ page }) => {
  const title = uniqueTitle("Прямая ссылка");
  const postUrl = await createPost(page, title);

  await page.goto(postUrl);
  await page.reload();
  await expect(page.getByRole("heading", { level: 1, name: title })).toBeVisible();

  await page.goto(`${postUrl}/edit`);
  await page.reload();
  await expect(page.getByLabel("Заголовок")).toHaveValue(title);

  await page.goto("/");
  await page.reload();
  await expect(page.getByRole("link", { name: title })).toBeVisible();
});
