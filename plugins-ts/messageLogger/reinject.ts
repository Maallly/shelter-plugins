import { getLog } from "./log";

const cmp = (a: string, b: string) =>
  BigInt(a) > BigInt(b) ? -1 : BigInt(a) < BigInt(b) ? 1 : 0;

export function reinject(payload: any) {
  const msgs: any[] = payload.messages;
  const ids = new Set(msgs.map((m) => m.id));
  const latest = !payload.isBefore && !payload.hasMoreAfter;
  const [max, min] = msgs.length
    ? [BigInt(msgs[0].id), BigInt(msgs[msgs.length - 1].id)]
    : [0n, 0n];

  const add = getLog().filter((m) => {
    if (m.channelId !== payload.channelId || !m.raw || ids.has(m.id))
      return false;
    const id = BigInt(m.id);
    return msgs.length ? id > min && (id < max || latest) : latest;
  });

  if (add.length)
    payload.messages = [...msgs, ...add.map((m) => m.raw)].sort((a, b) =>
      cmp(a.id, b.id),
    );
}
