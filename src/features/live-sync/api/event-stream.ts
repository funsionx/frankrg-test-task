import type { PostEventBus } from "@/entities/post";
import { encodeSseEvent, SSE_HEARTBEAT } from "@/shared/lib/sse";
import { POST_CHANGED_EVENT } from "../model/live-events";

type EventStreamDeps = {
  signal: AbortSignal;
  postEvents: PostEventBus;
  heartbeatMs?: number;
  retryMs?: number;
};

export function createEventStream({
  signal,
  postEvents,
  heartbeatMs = 25_000,
  retryMs = 3_000,
}: EventStreamDeps): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let cleanup = () => {};

  return new ReadableStream<Uint8Array>({
    start(controller) {
      const send = (chunk: string) => controller.enqueue(encoder.encode(chunk));

      send(`retry: ${retryMs}\n\n`);
      const unsubscribe = postEvents.subscribe((event) => send(encodeSseEvent(POST_CHANGED_EVENT, event)));
      const heartbeat = setInterval(() => send(SSE_HEARTBEAT), heartbeatMs);

      cleanup = () => {
        clearInterval(heartbeat);
        unsubscribe();
      };
      signal.addEventListener("abort", () => {
        cleanup();
        controller.close();
      });
    },
    cancel() {
      cleanup();
    },
  });
}
