import { EventEmitter } from "node:events";
import type { PostEvent, PostEventBus, PostEventListener } from "../model/post-event-bus";

export class InMemoryPostEventBus implements PostEventBus {
  private readonly emitter = new EventEmitter();

  constructor() {
    this.emitter.setMaxListeners(0);
  }

  publish(event: PostEvent): void {
    this.emitter.emit("post", event);
  }

  subscribe(listener: PostEventListener): () => void {
    this.emitter.on("post", listener);
    return () => {
      this.emitter.off("post", listener);
    };
  }
}
