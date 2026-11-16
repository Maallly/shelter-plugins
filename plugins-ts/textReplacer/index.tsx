import { applyRules } from "./rules";

export { settings } from "./settings";

const {
  plugin: { scoped },
  flux: { stores },
} = shelter;

// Channels used for sharing/requesting rules, replacing there gets messy.
const EXEMPT_CHANNELS = ["1102784112584040479", "1419347113745059961"];

function modifyIncoming(msg: any) {
  const me = (stores.UserStore as any).getCurrentUser()?.id;
  if (!msg?.content || !me || !msg.author?.id || msg.author.id === me) return;
  msg.content = applyRules(msg.content, "othersMessages");
}

export function onLoad() {
  scoped.http.intercept("post", /\/channels\/\d+\/messages$/, (req, send) => {
    const channelId = req.url.match(/channels\/(\d+)/)?.[1];
    if (
      typeof req.body?.content === "string" &&
      !EXEMPT_CHANNELS.includes(channelId!)
    )
      req.body.content = applyRules(req.body.content, "myMessages");
    return send(req);
  });

  scoped.flux.intercept((p) => {
    if (p.type === "MESSAGE_CREATE" || p.type === "MESSAGE_UPDATE")
      modifyIncoming(p.message);
    else if (p.type === "LOAD_MESSAGES_SUCCESS")
      p.messages?.forEach(modifyIncoming);
  });
}
