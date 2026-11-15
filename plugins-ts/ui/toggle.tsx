import type { Base } from "./base";

const {
  plugin: { store },
  ui: { SwitchItem, CheckboxItem },
} = shelter;

export const SwitchSetting = (p: Base & { fallback?: boolean }) => (
  <SwitchItem
    note={p.note}
    checked={store[p.key] ?? p.fallback ?? false}
    onChange={(v) => (store[p.key] = v)}
  >
    {p.label}
  </SwitchItem>
);

export const CheckboxSetting = (p: Base & { fallback?: boolean }) => (
  <CheckboxItem
    checked={store[p.key] ?? p.fallback ?? false}
    onChange={(v) => (store[p.key] = v)}
  >
    {p.label}
  </CheckboxItem>
);
