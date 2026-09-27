import { notFound } from "next/navigation";
import { connection } from "next/server";
import { EditPostForm } from "@/features/post-editor";
import { postService } from "@/entities/post/index.server";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const post = postService.get(id);
  if (!post) notFound();

  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Редактирование</h1>
      <EditPostForm post={post} />
    </>
  );
}
