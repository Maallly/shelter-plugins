import type { JSX } from "solid-js";

const {
  ui: { Header, HeaderTags, Text, TextTags, Space },
} = shelter;

export type Base = { key: string; label: JSX.Element; note?: JSX.Element };

export const Setting = (p: {
  label: JSX.Element;
  note?: JSX.Element;
  children: JSX.Element;
}) => (
  <>
    <Header tag={HeaderTags.H5}>{p.label}</Header>
    {p.note && (
      <Text
        tag={TextTags.textSM}
        style={{
          display: "block",
          "margin-bottom": "8px",
          color: "var(--text-muted)",
        }}
      >
        {p.note}
      </Text>
    )}
    {p.children}
    <Space />
  </>
);

export const ButtonRow = (p: { children: JSX.Element }) => (
  <div style={{ display: "flex", gap: "8px", "margin-bottom": "16px" }}>
    {p.children}
  </div>
);
