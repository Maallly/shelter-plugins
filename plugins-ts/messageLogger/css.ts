import { deletedIds, getEdits } from "./log";

const {
  ui: { injectCss },
} = shelter;

let modifyCss: ((css?: string) => void) | undefined;

const cssStr = (s: string) =>
  `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\r?\n/g, "\\A ")}"`;

export function updateCss() {
  const deleted = [...deletedIds].map(
    (id) =>
      `#message-content-${id}{color:var(--text-danger,#f23f43)!important}` +
      `#message-content-${id}::after{content:" (deleted)";opacity:.6;font-size:.75em}`,
  );
  const edited = Object.values(getEdits()).map(
    (e) =>
      `#message-content-${e.id}::before{content:${cssStr(
        e.history.map((h) => h.content + " (edited)").join("\n"),
      )};display:block;white-space:pre-wrap;opacity:.5;font-size:.875em;text-decoration:line-through}`,
  );

  const css = [...deleted, ...edited].join("");
  if (modifyCss) modifyCss(css);
  else modifyCss = injectCss(css);
}

export function removeCss() {
  modifyCss?.();
  modifyCss = undefined;
}
