import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { FormattedDate } from "@/shared/ui/formatted-date";
import { postService } from "@/entities/post/index.server";

export default async function PostPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const post = postService.get(id);
  if (!post) notFound();

  return (
    <article className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold break-words">{post.title}</h1>
      <dl className="grid grid-cols-[auto_1fr] gap-x-4 text-sm text-neutral-600">
        <dt>Создан</dt>
        <dd>
          <FormattedDate iso={post.createdAt} />
        </dd>
        <dt>Изменён</dt>
        <dd>{post.updatedAt ? <FormattedDate iso={post.updatedAt} /> : "—"}</dd>
      </dl>
      <p className="whitespace-pre-wrap break-words">{post.body}</p>
      <div>
        <Link href={`/posts/${post.id}/edit`} className="underline">
          Редактировать
        </Link>
      </div>
    </article>
  );
}
