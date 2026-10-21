/**
 * English dictionary. Plain serialisable data: `{var}` placeholders are filled by
 * `t()`, objects with an `other` key are plural forms resolved by `plural()`.
 * Copy comes from `T.en` in `docs/reference/artifact.html`.
 */
export const en = {
  app: {
    name: "Super Simple Budget",
    subtitle: "Tap what you pay for, skip the rest",
  },
  language: {
    switchLabel: "Français",
    switchAria: "Afficher en français",
  },
  footer: {
    about: "About this tool",
    privacy:
      "Your budget never leaves your device. There's no account and nothing is sent to a server.",
    advice: "This tool gives general information, not financial advice.",
    credit: "Spending ranges are adapted from the",
    creditLink: "Budget Planner by the Financial Consumer Agency of Canada",
    creditUrl: "https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/budget-planner",
    notAffiliated:
      "Super Simple Budget is an independent project. It isn't affiliated with or endorsed by the Financial Consumer Agency of Canada or the Government of Canada.",
    newTab: "(opens in a new tab)",
  },
  meta: {
    title: "Super Simple Budget — free monthly budget planner",
    description:
      "Plan your monthly budget in minutes: tap what you pay for, enter rough amounts and compare with usual Canadian ranges. Free and private.",
  },
};

export type Dictionary = typeof en;
