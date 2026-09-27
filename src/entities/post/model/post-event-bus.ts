export type PostEvent = {
  type: "post.created" | "post.updated";
  id: string;
  version: number;
};

export type PostEventListener = (event: PostEvent) => void;

export interface PostEventBus {
  publish(event: PostEvent): void;
  subscribe(listener: PostEventListener): () => void;
}
