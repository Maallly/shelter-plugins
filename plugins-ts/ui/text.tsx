import { type Base, Setting } from "./base";

const {
  plugin: { store },
  ui: { TextBox, TextArea },
} = shelter;

export const TextSetting = (
  p: Base & { placeholder?: string; suggestions?: string[]; fallback?: string },
) => {
  const listId = p.suggestions && `shelter-ts-${p.key}`;
  return (
    <Setting label={p.label} note={p.note}>
      <TextBox
        value={store[p.key] ?? p.fallback ?? ""}
        placeholder={p.placeholder}
        list={listId}
        onInput={(v) => (store[p.key] = v || undefined)}
      />
      {listId && (
        <datalist id={listId}>
          {p.suggestions!.map((s) => (
            <option value={s} />
          ))}
        </datalist>
      )}
    </Setting>
  );
};

export const TextAreaSetting = (
  p: Base & { placeholder?: string; mono?: boolean; fallback?: string },
) => (
  <Setting label={p.label} note={p.note}>
    <TextArea
      value={store[p.key] ?? p.fallback ?? ""}
      placeholder={p.placeholder}
      mono={p.mono}
      resize-y
      onInput={(v) => (store[p.key] = v || undefined)}
    />
  </Setting>
);

export const NumberSetting = (
  p: Base & { placeholder?: string; fallback?: number },
) => (
  <Setting label={p.label} note={p.note}>
    <TextBox
      inputmode="decimal"
      placeholder={p.placeholder}
      value={String(store[p.key] ?? p.fallback ?? "")}
      onInput={(v) => {
        const n = Number(v);
        store[p.key] = v.trim() === "" || Number.isNaN(n) ? undefined : n;
      }}
    />
  </Setting>
);
