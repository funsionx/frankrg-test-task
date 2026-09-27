import "server-only";
import type { PostEventBus } from "../model/post-event-bus";
import { PostService } from "../model/post-service";
import { InMemoryPostEventBus } from "./in-memory-post-event-bus";
import { InMemoryPostRepository } from "./in-memory-post-repository";

const DEMO_POSTS = [
  {
    title: "Добро пожаловать на проверку тестового задания! :)",
    body: "Это демо-пост. Откройте приложение в двух вкладках и отредактируйте его в одной из них — изменения появятся во второй без перезагрузки.",
  },
  {
    title: "Как хранятся данные",
    body: "Посты живут в памяти Next.js-сервера.\nПосле перезапуска сервера останутся только демо-посты.",
  },
];

type PostStore = { postService: PostService; postEvents: PostEventBus };

const globalForPosts = globalThis as typeof globalThis & { __postStore?: PostStore };

function createPostStore(): PostStore {
  const postEvents = new InMemoryPostEventBus();
  const postService = new PostService({ repository: new InMemoryPostRepository(), events: postEvents });
  for (const post of DEMO_POSTS) postService.create(post);
  return { postService, postEvents };
}

export const { postService, postEvents } = (globalForPosts.__postStore ??= createPostStore());
