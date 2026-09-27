"use client";

import { useSyncExternalStore } from "react";

const localFormatter = new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" });
const utcFormatter = new Intl.DateTimeFormat("ru-RU", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "UTC",
});

const subscribe = () => () => {};

/**
 * Дата в часовом поясе браузера. На сервере пояс неизвестен (в Docker это UTC),
 * поэтому при SSR и гидрации рендерим UTC, а сразу после гидрации — локальное время.
 */
export function FormattedDate({ iso }: { iso: string }) {
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const date = new Date(iso);

  return (
    <time dateTime={iso}>{isClient ? localFormatter.format(date) : `${utcFormatter.format(date)} UTC`}</time>
  );
}
