import { type Base, Setting } from "./base";

const {
  plugin: { store },
  ui: { Slider },
} = shelter;

export const SliderSetting = (
  p: Base & { min: number; max: number; step?: number; fallback?: number },
) => (
  <Setting label={p.label} note={p.note}>
    <Slider
      min={p.min}
      max={p.max}
      step={p.step}
      tick
      value={store[p.key] ?? p.fallback ?? p.min}
      onInput={(v) => (store[p.key] = v)}
    />
  </Setting>
);
