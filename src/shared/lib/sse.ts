export function encodeSseEvent(event: string, data: unknown): string {
  // JSON.stringify экранирует переводы строк, поэтому data всегда занимает одну строку.
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export const SSE_HEARTBEAT = ": ping\n\n";
