const {
  plugin: { store, flushStore },
  util: { log },
  flux: { storesFlat },
} = shelter;

const MAX_LOG = 500;

export const plain = <T>(x: T): T => (x === undefined ? x : JSON.parse(JSON.stringify(x)));

export type Logged = {
  id: string;
  channelId: string;
  guildId?: string;
  author: string;
  content: string;
  attachments: string[];
  sentAt: string;
  deletedAt: number;
  raw?: any;
};

store.deleted ??= [] as Logged[];

export const getLog = () => store.deleted as Logged[];
export const clearLog = () => (store.deleted = []);

// ids of preserved messages, styled as deleted
export const deletedIds = new Set<string>();

export type Edited = {
  id: string;
  channelId: string;
  guildId?: string;
  author: string;
  history: { content: string; editedAt: number }[]; // old versions, oldest first
};

store.edits ??= {} as Record<string, Edited>;

export const getEdits = () => store.edits as Record<string, Edited>;
export const clearEdits = () => (store.edits = {});

export function logEdit(update: any) {
  if (typeof update?.content !== "string") return false;
  const old = (storesFlat.MessageStore as any).getMessage(
    update.channel_id,
    update.id,
  );
  if (!old || old.content === update.content) return false;

  const prev = getEdits()[update.id];
  const entry: Edited = {
    id: update.id,
    channelId: update.channel_id,
    guildId: update.guild_id,
    author: old.author?.username ?? "unknown",
    history: [
      ...(prev?.history ?? []),
      { content: old.content, editedAt: Date.now() },
    ],
  };

  const rest = Object.entries(getEdits()).filter(([id]) => id !== update.id);
  store.edits = Object.fromEntries([
    ...rest.slice(-(MAX_LOG - 1)),
    [update.id, entry],
  ]);

  flushStore();
  return true;
}

const toRaw = (msg: any, channelId: string, guildId?: string) => ({
  id: msg.id,
  channel_id: channelId,
  guild_id: guildId,
  type: msg.type,
  content: msg.content,
  author: {
    id: msg.author.id,
    username: msg.author.username,
    global_name: msg.author.globalName,
    avatar: msg.author.avatar,
    discriminator: msg.author.discriminator,
    bot: msg.author.bot,
  },
  timestamp: new Date(msg.timestamp).toISOString(),
  edited_timestamp: msg.editedTimestamp
    ? new Date(msg.editedTimestamp).toISOString()
    : null,
  attachments: msg.attachments ?? [],
  embeds: [],
  mentions: [],
  mention_roles: [],
  mention_everyone: false,
  pinned: false,
  tts: false,
  flags: msg.flags ?? 0,
  message_reference: msg.messageReference
    ? {
        channel_id: msg.messageReference.channel_id,
        guild_id: msg.messageReference.guild_id,
        message_id: msg.messageReference.message_id,
      }
    : undefined,
});

export function preserve(channelId: string, id: string, guildId?: string) {
  const msg = (storesFlat.MessageStore as any).getMessage(channelId, id);
  if (!msg || msg.state !== "SENT" || msg.flags & 64) return false;

  let raw;
  try {
    raw = plain(toRaw(msg, channelId, guildId));
  } catch (e) {
    log(`messageLogger: couldn't snapshot ${id}: ${e}`, "error");
  }

  deletedIds.add(id);
  store.deleted = [
    {
      id,
      channelId,
      guildId,
      author: msg.author?.username ?? "unknown",
      content: msg.content,
      attachments: msg.attachments?.map((a: any) => a.url) ?? [],
      sentAt: raw?.timestamp ?? String(msg.timestamp),
      deletedAt: Date.now(),
      raw,
    },
    ...store.deleted,
  ].slice(0, MAX_LOG);

  flushStore();
  return true;
}
