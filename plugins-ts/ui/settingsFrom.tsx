import type { JSX } from "solid-js";
import { TextSetting, TextAreaSetting, NumberSetting } from "./text";
import { SwitchSetting, CheckboxSetting } from "./toggle";
import { SelectSetting } from "./select";
import { SliderSetting } from "./slider";

/**
 * Plug-n-play settings page from a list:
 *   export const settings = settingsFrom([
 *     { type: "switch", key: "fixApostrophes", label: "Fix apostrophes" },
 *     { type: "text", key: "url", label: "URL", placeholder: "https://..." },
 *   ]);
 * Anything that isn't an object (JSX) is rendered as-is.
 */
type P<C extends (p: any) => JSX.Element> = Parameters<C>[0];
export type SettingItem =
  | ({ type: "switch" } & P<typeof SwitchSetting>)
  | ({ type: "checkbox" } & P<typeof CheckboxSetting>)
  | ({ type: "text" } & P<typeof TextSetting>)
  | ({ type: "textarea" } & P<typeof TextAreaSetting>)
  | ({ type: "number" } & P<typeof NumberSetting>)
  | ({ type: "slider" } & P<typeof SliderSetting>)
  | ({ type: "select" } & P<typeof SelectSetting>);

const components = {
  switch: SwitchSetting,
  checkbox: CheckboxSetting,
  text: TextSetting,
  textarea: TextAreaSetting,
  number: NumberSetting,
  slider: SliderSetting,
  select: SelectSetting,
} as Record<SettingItem["type"], (p: any) => JSX.Element>;

export const settingsFrom =
  (items: (SettingItem | JSX.Element)[]) => () => (
    <>
      {items.map((i) =>
        i && typeof i === "object" && "type" in i && i.type in components
          ? components[(i as SettingItem).type](i)
          : i,
      )}
    </>
  );
