import { ButtonRow, Setting } from "../ui/base";
import {
  applyRules,
  emptyRule,
  KEYS,
  Rule,
  RuleKey,
  rulesOf,
  Scope,
  stringToRegex,
} from "./rules";

const {
  plugin: { store },
  solid: { createSignal, Index, Show },
  ui: {
    Button,
    ButtonColors,
    ButtonSizes,
    Header,
    HeaderTags,
    Text,
    TextBox,
    Divider,
  },
  util: { log },
} = shelter;

const SCOPES: [Scope, string][] = [
  ["myMessages", "Apply to your messages (visible to everyone)"],
  ["othersMessages", "Apply to others' messages (only visible to you)"],
  ["allMessages", "Apply to all messages"],
];

function regexError(find: string) {
  try {
    stringToRegex(find);
    return null;
  } catch (e) {
    return String(e);
  }
}

function RuleList(p: {
  key: RuleKey;
  title: string;
  description: string;
  regex?: boolean;
}) {
  const [rules, setRules] = createSignal(rulesOf(p.key));
  const save = (next: Rule[]) => {
    setRules(next);
    store[p.key] = next;
  };
  const edit = (i: number, field: keyof Rule, value: string) =>
    save(rules().map((r, j) => (j === i ? { ...r, [field]: value } : r)));

  const row = (
    i: number,
    field: keyof Rule,
    label: string,
    placeholder: string,
    r: () => Rule,
  ) => (
    <Setting label={label}>
      <TextBox
        value={r()[field]}
        placeholder={placeholder}
        spellcheck={false}
        onInput={(v) => edit(i, field, v)}
      />
    </Setting>
  );

  return (
    <>
      <Header tag={HeaderTags.H3}>{p.title}</Header>
      <Text>{p.description}</Text>
      <Index each={rules()}>
        {(r, i) => (
          <details
            style={{
              margin: "8px 0",
              padding: "8px",
              border: "1px solid var(--background-modifier-accent)",
              "border-radius": "8px",
            }}
          >
            <summary style={{ cursor: "pointer" }}>
              <Text>
                {r().name ||
                  (r().find
                    ? `Rule ${i + 1} - ${r().find}`
                    : `Empty Rule ${i + 1}`)}
              </Text>
            </summary>
            {row(
              i,
              "name",
              "Name",
              "An optional name to help you identify this rule.",
              r,
            )}
            {row(
              i,
              "find",
              "Find",
              p.regex ? "The regex pattern" : "The text to replace",
              r,
            )}
            {row(
              i,
              "replace",
              "Replace",
              "The text to replace the found text with",
              r,
            )}
            {row(
              i,
              "onlyIfIncludes",
              "Only if includes",
              "Only apply if the message includes this text",
              r,
            )}
            <select
              value={r().scope}
              onChange={(e) => edit(i, "scope", e.currentTarget.value)}
              style={{ width: "100%", padding: "6px" }}
            >
              {SCOPES.map(([v, l]) => (
                <option value={v}>{l}</option>
              ))}
            </select>
            <Show when={p.regex && regexError(r().find)}>
              <div style={{ color: "var(--text-feedback-critical, red)" }}>
                {regexError(r().find)}
              </div>
            </Show>
            <Button
              color={ButtonColors.RED}
              size={ButtonSizes.SMALL}
              style={{ "margin-top": "8px" }}
              onClick={() => save(rules().filter((_, j) => j !== i))}
            >
              Delete Rule
            </Button>
          </details>
        )}
      </Index>
      <Button
        grow
        disabled={rules().length > 0 && !rules()[rules().length - 1].find}
        onClick={() => save([...rules(), emptyRule()])}
      >
        Add Rule
      </Button>
      <Divider mt mb />
    </>
  );
}

function exportRules() {
  const json = JSON.stringify(
    { stringRules: rulesOf("stringRules"), regexRules: rulesOf("regexRules") },
    null,
    4,
  );
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([json], { type: "application/json" }));
  a.download = "textreplace-rules.json";
  a.click();
  URL.revokeObjectURL(a.href);
}

function importRules(onDone: () => void) {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = async () => {
    const file = input.files?.[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      for (const key of KEYS) {
        const imported = (data[key] ?? [])
          .filter((r: Rule) => typeof r?.find === "string" && r.find)
          .map((r: Rule) => ({ ...emptyRule(), ...r }));
        store[key] = [...rulesOf(key).filter((r) => r.find), ...imported];
      }
      onDone();
    } catch (e) {
      log(`TextReplace: failed to import rules ${e}`, "error");
    }
  };
  input.click();
}

export const settings = () => {
  const [test, setTest] = createSignal("");
  // Remount rule lists after import so they pick up the new store.
  const [rev, setRev] = createSignal(0);

  return (
    <>
      <Header tag={HeaderTags.H3}>Rule Tester</Header>
      <TextBox
        placeholder="Type a message to test rules on"
        value={test()}
        onInput={setTest}
      />
      <div style={{ height: "6px" }} />
      <TextBox
        placeholder="Message with rules applied"
        value={(rev(), applyRules(test(), "allMessages"))}
        readonly
        style={{ opacity: 0.7 }}
      />
      <Divider mt mb />
      <Show when={rev() + 1} keyed>
        <RuleList
          key="stringRules"
          title="Simple Replacements"
          description="Simple find and replace rules. For example, find 'brb' and replace it with 'be right back'"
        />
        <RuleList
          key="regexRules"
          title="Regex Replacements"
          description="More powerful replacements using Regular Expressions. This section is for advanced users. If you don't understand it, just ignore it"
          regex
        />
      </Show>
      <Header tag={HeaderTags.H3}>Import and Export</Header>
      <Text>
        Export your rules as a JSON file or import rules to add them to your
        existing rules.
      </Text>
      <ButtonRow>
        <Button grow onClick={exportRules}>
          Export JSON
        </Button>
        <Button grow onClick={() => importRules(() => setRev(rev() + 1))}>
          Import JSON
        </Button>
      </ButtonRow>
    </>
  );
};
