import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Страница не найдена</h1>
      <Link href="/" className="underline">
        К списку постов
      </Link>
    </>
  );
}
