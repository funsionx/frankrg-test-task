import Link from "next/link";
import { connection } from "next/server";
import { FormattedDate } from "@/shared/ui/formatted-date";
import { postService } from "@/entities/post/index.server";

export default async function PostsPage() {
  await connection();
  const posts = postService.list();

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Посты</h1>
      {posts.length === 0 ? (
        <p>
          Постов пока нет.{" "}
          <Link href="/posts/new" className="underline">
            Написать первый
          </Link>
        </p>
      ) : (
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-300">
              <th className="py-2 pr-4">Заголовок</th>
              <th className="py-2 pr-4">Создан</th>
              <th className="py-2">Изменён</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b border-neutral-200">
                <td className="py-2 pr-4">
                  <Link href={`/posts/${post.id}`} className="underline">
                    {post.title}
                  </Link>
                </td>
                <td className="py-2 pr-4 whitespace-nowrap">
                  <FormattedDate iso={post.createdAt} />
                </td>
                <td className="py-2 whitespace-nowrap">
                  {post.updatedAt ? <FormattedDate iso={post.updatedAt} /> : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
