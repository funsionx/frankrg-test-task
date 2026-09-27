import { describe, expect, it } from "vitest";
import { encodeSseEvent } from "./sse";

describe("encodeSseEvent", () => {
  it("formats a named event with JSON data", () => {
    expect(encodeSseEvent("post", { id: "1", version: 2 })).toBe(
      'event: post\ndata: {"id":"1","version":2}\n\n',
    );
  });

  it("keeps multiline strings on a single data line", () => {
    const encoded = encodeSseEvent("post", { body: "a\nb" });
    expect(encoded).toBe('event: post\ndata: {"body":"a\\nb"}\n\n');
    expect(encoded.split("\n").filter((line) => line.startsWith("data:"))).toHaveLength(1);
  });
});
