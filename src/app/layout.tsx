import type { Metadata } from "next";
import Link from "next/link";
import { LiveUpdates } from "@/features/live-sync";
import "./globals.css";

export const metadata: Metadata = {
  title: "Блог",
  description: "Тестовое задание: блог с синхронизацией между вкладками",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <LiveUpdates />
        <header className="border-b border-neutral-300">
          <nav className="mx-auto flex max-w-3xl gap-4 px-4 py-3">
            <Link href="/" className="font-semibold">
              Все посты
            </Link>
            <Link href="/posts/new">Новый пост</Link>
          </nav>
        </header>
        <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
