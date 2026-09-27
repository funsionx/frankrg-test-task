"use client";

import { useEffect } from "react";

export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Что-то пошло не так</h1>
      <button type="button" onClick={() => retry()} className="rounded border border-neutral-400 px-3 py-1">
        Попробовать снова
      </button>
    </>
  );
}
