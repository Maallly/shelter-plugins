import { deletedIds, getLog, logEdit, preserve } from "./log";
import { reinject } from "./reinject";
import { removeCss, updateCss } from "./css";

export { settings } from "./settings";

const {
  plugin: { scoped },
  util: { log },
} = shelter;

export function onLoad() {
  for (const m of getLog()) deletedIds.add(m.id);
  updateCss();

  scoped.flux.intercept((payload) => {
    try {
      return handle(payload);
    } catch (e) {
      log(`${payload.type} failed, ${e} payload: ${payload}`, "error");
    }
  });
}

function handle(payload: any) {
  if (
    (payload.type === "LOAD_MESSAGES_SUCCESS" ||
      payload.type === "LOCAL_MESSAGES_LOADED") &&
    Array.isArray(payload.messages)
  )
    reinject(payload);

  if (payload.type === "MESSAGE_UPDATE" && logEdit(payload.message))
    updateCss();

  if (payload.type === "MESSAGE_DELETE") {
    if (!preserve(payload.channelId, payload.id, payload.guildId)) return;
    updateCss();
    return false;
  }
  if (payload.type === "MESSAGE_DELETE_BULK") {
    const kept = payload.ids.filter((id: string) =>
      preserve(payload.channelId, id, payload.guildId),
    );
    if (!kept.length) return;

    updateCss();
    const rest = payload.ids.filter((id: string) => !kept.includes(id));
    if (!rest.length) return false;

    payload.ids = rest;
  }
}

export function onUnload() {
  removeCss();
  deletedIds.clear();
}
