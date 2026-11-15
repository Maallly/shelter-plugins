import { clearEdits, clearLog, getEdits, getLog } from "./log";

const {
  ui: { Button, Header, HeaderTags, Text },
} = shelter;

const jump = (m: { guildId?: string; channelId: string; id: string }) => (
  <a href={`/channels/${m.guildId ?? "@me"}/${m.channelId}/${m.id}`}>jump</a>
);

export const settings = () => (
  <>
    <Header tag={HeaderTags.H3}>Deleted messages ({getLog().length})</Header>
    <Button onClick={clearLog}>Clear deleted</Button>
    <br />
    {getLog().map((m) => (
      <div style={{ "margin-bottom": "8px" }}>
        <Text>
          <b>{m.author}</b> · {new Date(m.deletedAt).toLocaleString()} ·{" "}
          {jump(m)}
        </Text>
        <br />
        <Text>{m.content || "(no text)"}</Text>
        {m.attachments.map((url) => (
          <>
            <br />
            <a href={url} target="_blank">
              {url.split("/").pop()?.split("?")[0]}
            </a>
          </>
        ))}
      </div>
    ))}

    <Header tag={HeaderTags.H3}>
      Edited messages ({Object.keys(getEdits()).length})
    </Header>
    <Button onClick={clearEdits}>Clear edits</Button>
    <br />
    {Object.values(getEdits())
      .reverse()
      .map((e) => (
        <div style={{ "margin-bottom": "8px" }}>
          <Text>
            <b>{e.author}</b> · {e.history.length} edit(s) · {jump(e)}
          </Text>
          {e.history.map((h) => (
            <>
              <br />
              <Text>
                {new Date(h.editedAt).toLocaleString()}:{" "}
                {h.content || "(no text)"}
              </Text>
            </>
          ))}
        </div>
      ))}
  </>
);
