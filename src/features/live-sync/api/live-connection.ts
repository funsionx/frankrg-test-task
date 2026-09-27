import { POST_CHANGED_EVENT } from "../model/live-events";

export type LiveEventSource = {
  addEventListener(type: string, listener: (event: MessageEvent) => void): void;
  close(): void;
};

type LiveConnectionOptions = {
  onPostChange: () => void;
  url?: string;
  debounceMs?: number;
  createSource?: (url: string) => LiveEventSource;
};

/**
 * Одно SSE-соединение на вкладку. Синхронизируется состояние, а не события:
 * onPostChange должен перечитать актуальные данные, поэтому пачка событий
 * схлопывается в один вызов, а после реконнекта он вызывается на случай пропущенных.
 */
export function connectLive({
  onPostChange,
  url = "/api/events",
  debounceMs = 100,
  createSource = (sourceUrl) => new EventSource(sourceUrl),
}: LiveConnectionOptions): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let disconnected = false;

  const scheduleRefresh = () => {
    clearTimeout(timer);
    timer = setTimeout(onPostChange, debounceMs);
  };

  const source = createSource(url);
  source.addEventListener(POST_CHANGED_EVENT, scheduleRefresh);
  source.addEventListener("error", () => {
    disconnected = true;
  });
  source.addEventListener("open", () => {
    if (disconnected) scheduleRefresh();
    disconnected = false;
  });

  return () => {
    clearTimeout(timer);
    source.close();
  };
}
