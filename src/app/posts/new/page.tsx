import { CreatePostForm } from "@/features/post-editor";

export default function NewPostPage() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-bold">Новый пост</h1>
      <CreatePostForm />
    </>
  );
}
