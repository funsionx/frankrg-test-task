import { expect, test } from "@playwright/test";
import { createPost, uniqueTitle, waitForLiveUpdates } from "./helpers";

test("changes from one tab appear in another without reload", async ({ context }) => {
  const listTab = await context.newPage();
  await Promise.all([waitForLiveUpdates(listTab), listTab.goto("/")]);

  const authorTab = await context.newPage();
  const title = uniqueTitle("Синхронизация");
  const postUrl = await createPost(authorTab, title);

  // Новый пост появился в списке без перезагрузки.
  await expect(listTab.getByRole("link", { name: title })).toBeVisible();

  const viewerTab = await context.newPage();
  await Promise.all([waitForLiveUpdates(viewerTab), viewerTab.goto(postUrl)]);

  await authorTab.goto(`${postUrl}/edit`);
  await authorTab.getByLabel("Текст").fill("Обновлённый текст");
  await authorTab.getByRole("button", { name: "Сохранить" }).click();
  await expect(authorTab.getByText("Обновлённый текст")).toBeVisible();

  // Открытый пост и список обновились сами.
  await expect(viewerTab.getByText("Обновлённый текст")).toBeVisible();
  await expect(listTab.getByRole("row").filter({ hasText: title }).getByRole("cell").nth(2)).not.toHaveText(
    "—",
  );
});

test("changes sync across different browsers", async ({ page, browser }) => {
  await Promise.all([waitForLiveUpdates(page), page.goto("/")]);

  const otherBrowser = await browser.newContext();
  const author = await otherBrowser.newPage();
  const title = uniqueTitle("Из другого браузера");
  await createPost(author, title);

  await expect(page.getByRole("link", { name: title })).toBeVisible();
  await otherBrowser.close();
});
