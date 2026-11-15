import type { JSX } from "solid-js";
import type { Base } from "./base";

const {
  plugin: { store },
  ui: { SelectItem, SelectOption },
} = shelter;

type Opt = string | { value: string | number; label: JSX.Element };
export const SelectSetting = (
  p: Base & { options: Opt[]; fallback?: string | number },
) => (
  <SelectItem
    label={p.label}
    note={p.note}
    value={store[p.key] ?? p.fallback}
    onChange={(v) => (store[p.key] = v)}
  >
    {p.options.map((o) =>
      typeof o === "string" ? (
        <SelectOption value={o}>{o}</SelectOption>
      ) : (
        <SelectOption value={o.value}>{o.label}</SelectOption>
      ),
    )}
  </SelectItem>
);
