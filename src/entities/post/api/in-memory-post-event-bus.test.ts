import { describe, expect, it } from "vitest";
import type { PostEvent } from "../model/post-event-bus";
import { InMemoryPostEventBus } from "./in-memory-post-event-bus";

const event: PostEvent = { type: "post.updated", id: "p1", version: 2 };

describe("InMemoryPostEventBus", () => {
  it("delivers published events to every subscriber", () => {
    const bus = new InMemoryPostEventBus();
    const first: PostEvent[] = [];
    const second: PostEvent[] = [];
    bus.subscribe((e) => first.push(e));
    bus.subscribe((e) => second.push(e));

    bus.publish(event);

    expect(first).toEqual([event]);
    expect(second).toEqual([event]);
  });

  it("stops delivering events after unsubscribe", () => {
    const bus = new InMemoryPostEventBus();
    const received: PostEvent[] = [];
    const unsubscribe = bus.subscribe((e) => received.push(e));

    unsubscribe();
    bus.publish(event);

    expect(received).toEqual([]);
  });

  it("does not warn about listener leaks with many open tabs", async () => {
    const bus = new InMemoryPostEventBus();
    const warnings: string[] = [];
    const onWarning = (warning: Error) => warnings.push(warning.name);
    process.on("warning", onWarning);

    for (let i = 0; i < 50; i++) bus.subscribe(() => {});
    // Node сообщает о превышении лимита слушателей асинхронно.
    await new Promise((resolve) => setImmediate(resolve));
    process.off("warning", onWarning);

    expect(warnings).not.toContain("MaxListenersExceededWarning");
  });
});
