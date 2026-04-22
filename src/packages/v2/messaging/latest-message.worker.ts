export type Message<T> = { kind: string; payload: T };

const dataMap: Map<string, unknown[]> = new Map<string, unknown[]>();

globalThis.onmessage = (event: MessageEvent<Message<unknown>>): void => {
  const data = event.data;
  if (!data || (dataMap.has("ready") && data.kind === "ready")) {
    return;
  }

  if (!dataMap.has(data.kind)) {
    dataMap.set(data.kind, [data.payload])
  } else {
    const kindsData = dataMap.get(data.kind)!;
    kindsData?.push(data.payload);
    dataMap.set(data.kind, kindsData);
  }

  globalThis.postMessage(data);
};
