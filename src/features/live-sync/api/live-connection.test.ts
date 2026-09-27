import { afterEach, beforeEach, describe, expect, it, type Mock, vi } from "vitest";
import { connectLive, type LiveEventSource } from "./live-connection";

class FakeEventSource implements LiveEventSource {
  closed = false;
  private readonly listeners = new Map<string, ((event: MessageEvent) => void)[]>();

  addEventListener(type: string, listener: (event: MessageEvent) => void): void {
    this.listeners.set(type, [...(this.listeners.get(type) ?? []), listener]);
  }

  close(): void {
    this.closed = true;
  }

  emit(type: string, data?: unknown): void {
    const event = new MessageEvent(type, { data: data === undefined ? undefined : JSON.stringify(data) });
    for (const listener of this.listeners.get(type) ?? []) listener(event);
  }
}

describe("connectLive", () => {
  let source: FakeEventSource;
  let onPostChange: Mock<() => void>;
  let close: () => void;

  beforeEach(() => {
    vi.useFakeTimers();
    source = new FakeEventSource();
    onPostChange = vi.fn<() => void>();
    close = connectLive({ onPostChange, createSource: () => source });
  });

  afterEach(() => {
    close();
    vi.useRealTimers();
  });

  it("collapses a burst of post events into a single refresh", () => {
    source.emit("open");
    source.emit("post", { id: "p1" });
    source.emit("post", { id: "p2" });
    source.emit("post", { id: "p3" });

    vi.advanceTimersByTime(100);

    expect(onPostChange).toHaveBeenCalledTimes(1);
  });

  it("does not refresh on the first connection", () => {
    source.emit("open");
    vi.advanceTimersByTime(100);

    expect(onPostChange).not.toHaveBeenCalled();
  });

  it("refreshes after reconnecting because events may have been missed", () => {
    source.emit("open");
    source.emit("error");
    source.emit("open");
    vi.advanceTimersByTime(100);

    expect(onPostChange).toHaveBeenCalledTimes(1);
  });

  it("closes the source and drops a pending refresh on close", () => {
    source.emit("post", { id: "p1" });

    close();
    vi.advanceTimersByTime(100);

    expect(source.closed).toBe(true);
    expect(onPostChange).not.toHaveBeenCalled();
  });
});
