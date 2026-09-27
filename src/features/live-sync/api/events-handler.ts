import "server-only";
import { postEvents } from "@/entities/post/index.server";
import { createEventStream } from "./event-stream";

export function handleLiveEvents(request: Request): Response {
  return new Response(createEventStream({ signal: request.signal, postEvents }), {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
