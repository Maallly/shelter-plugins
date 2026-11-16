const {
  plugin: { store },
  util: { log },
} = shelter;

export type Scope = "myMessages" | "othersMessages" | "allMessages";
export type Rule = { name: string; find: string; replace: string; onlyIfIncludes: string; scope: Scope };
export type RuleKey = "stringRules" | "regexRules";

export const KEYS: RuleKey[] = ["stringRules", "regexRules"];
export const emptyRule = (): Rule => ({ name: "", find: "", replace: "", onlyIfIncludes: "", scope: "myMessages" });
export const rulesOf = (key: RuleKey): Rule[] => (store[key] ?? []).map((r: Partial<Rule>) => ({ ...emptyRule(), ...r }));

export function stringToRegex(str: string) {
  const match = str.match(/^(\/)?(.+?)(?:\/([gimsuyv]*))?$/);
  return match
    ? new RegExp(match[2], match[3] ? [...new Set(match[3])].join("") : "g")
    : new RegExp(str);
}

const inScope = (rule: Rule, scope: Scope) =>
  rule.scope === "allMessages" || scope === "allMessages" || rule.scope === scope;

export function applyRules(content: string, scope: Scope): string {
  if (!content) return content;

  for (const rule of rulesOf("stringRules")) {
    if (!rule.find || !inScope(rule, scope)) continue;
    if (rule.onlyIfIncludes && !content.includes(rule.onlyIfIncludes)) continue;
    content = ` ${content} `.replaceAll(rule.find, rule.replace.replaceAll("\\n", "\n")).replace(/^\s|\s$/g, "");
  }

  for (const rule of rulesOf("regexRules")) {
    if (!rule.find || !inScope(rule, scope)) continue;
    if (rule.onlyIfIncludes && !content.includes(rule.onlyIfIncludes)) continue;
    try {
      content = content.replace(stringToRegex(rule.find), rule.replace.replaceAll("\\n", "\n"));
    } catch {
      log(`TextReplace: invalid regex ${rule.find}`, "error");
    }
  }

  return content.trim();
}
