import { toBcp47, type Locale } from "./config";
import type { Dictionary } from "./dictionaries/en";

export type TemplateVars = Record<string, string | number>;

/** Plural forms keyed by CLDR category; `other` is the required fallback. */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string;
};

/** Dotted paths to plain string leaves, e.g. `"footer.about"`. */
export type MessageKey<T = Dictionary> = {
  [K in keyof T & string]: T[K] extends string
    ? K
    : T[K] extends PluralForms
      ? never
      : `${K}.${MessageKey<T[K]>}`;
}[keyof T & string];

/** Dotted paths to plural-form leaves. */
export type PluralKey<T = Dictionary> = {
  [K in keyof T & string]: T[K] extends string
    ? never
    : T[K] extends PluralForms
      ? K
      : `${K}.${PluralKey<T[K]>}`;
}[keyof T & string];

/** Replaces `{name}` placeholders; unknown placeholders are left as-is. */
export function interpolate(template: string, vars?: TemplateVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}

// Bounded: at most one entry per locale.
const pluralRulesCache = new Map<Locale, Intl.PluralRules>();

function pluralRules(locale: Locale): Intl.PluralRules {
  let rules = pluralRulesCache.get(locale);
  if (!rules) {
    rules = new Intl.PluralRules(toBcp47(locale));
    pluralRulesCache.set(locale, rules);
  }
  return rules;
}

/** Picks the plural form for `count` and fills `{n}` plus any other vars. */
export function plural(
  locale: Locale,
  forms: PluralForms,
  count: number,
  vars?: TemplateVars,
): string {
  const template = forms[pluralRules(locale).select(count)] ?? forms.other;
  return interpolate(template, { n: count, ...vars });
}

function lookup(dictionary: Dictionary, key: string): unknown {
  let node: unknown = dictionary;
  for (const part of key.split(".")) {
    node = (node as Record<string, unknown> | undefined)?.[part];
  }
  return node;
}

export type Translator = {
  locale: Locale;
  t: (key: MessageKey, vars?: TemplateVars) => string;
  plural: (key: PluralKey, count: number, vars?: TemplateVars) => string;
};

/** Binds `t`/`plural` to one locale's dictionary. Missing keys return the key. */
export function createTranslator(
  locale: Locale,
  dictionary: Dictionary,
): Translator {
  return {
    locale,
    t: (key, vars) => {
      const value = lookup(dictionary, key);
      return typeof value === "string" ? interpolate(value, vars) : key;
    },
    plural: (key, count, vars) => {
      const value = lookup(dictionary, key);
      return value && typeof value === "object"
        ? plural(locale, value as PluralForms, count, vars)
        : key;
    },
  };
}
