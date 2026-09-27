import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { PostEvent, PostEventBus } from "@/entities/post";
import { createEventStream } from "./event-stream";

function createFakeBus() {
  const listeners = new Set<(event: PostEvent) => void>();
  const bus: PostEventBus = {
    publish: (event) => listeners.forEach((listener) => listener(event)),
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
  return { bus, listeners };
}

function openStream(bus: PostEventBus) {
  const abort = new AbortController();
  const reader = createEventStream({ signal: abort.signal, postEvents: bus }).getReader();
  const decoder = new TextDecoder();
  const next = async () => {
    const { value, done } = await reader.read();
    return done ? null : decoder.decode(value);
  };
  return { abort, next };
}

describe("createEventStream", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with the reconnect delay for EventSource", async () => {
    const { next } = openStream(createFakeBus().bus);

    expect(await next()).toBe("retry: 3000\n\n");
  });

  it("forwards post events as named SSE events", async () => {
    const { bus } = createFakeBus();
    const { next } = openStream(bus);
    await next();

    bus.publish({ type: "post.updated", id: "p1", version: 2 });

    expect(await next()).toBe('event: post\ndata: {"type":"post.updated","id":"p1","version":2}\n\n');
  });

  it("sends a heartbeat so idle connections are not dropped by proxies", async () => {
    const { next } = openStream(createFakeBus().bus);
    await next();

    vi.advanceTimersByTime(25_000);

    expect(await next()).toBe(": ping\n\n");
  });

  it("releases the subscription and closes when the client disconnects", async () => {
    const { bus, listeners } = createFakeBus();
    const { abort, next } = openStream(bus);
    await next();
    expect(listeners.size).toBe(1);

    abort.abort();

    expect(listeners.size).toBe(0);
    expect(await next()).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
  });
});
