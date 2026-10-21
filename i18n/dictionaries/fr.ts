import type { Dictionary } from "./en";

/**
 * French dictionary. Copy comes from `T.fr` in `docs/reference/artifact.html`;
 * keep its non-breaking spaces (U+00A0) before `:` `;` `?` `!` `%`.
 */
export const fr: Dictionary = {
  app: {
    name: "Budget super simple",
    subtitle: "Choisissez ce que vous payez, ignorez le reste",
  },
  language: {
    switchLabel: "English",
    switchAria: "Show in English",
  },
  frequency: {
    Daily: "Chaque jour",
    Weekly: "Chaque semaine",
    Every2Weeks: "Aux 2 semaines",
    TwiceMonthly: "Deux fois par mois",
    Monthly: "Chaque mois",
    Quarterly: "Aux 3 mois",
    Every6Months: "Aux 6 mois",
    Annually: "Chaque année",
  },
  footer: {
    about: "À propos de cet outil",
    privacy:
      "Votre budget ne quitte jamais votre appareil. Aucun compte n’est requis et rien n’est envoyé à un serveur.",
    advice:
      "Cet outil fournit de l’information générale et non des conseils financiers.",
    credit: "Les fourchettes de dépenses sont adaptées du",
    creditLink:
      "Planificateur budgétaire de l’Agence de la consommation en matière financière du Canada",
    creditUrl:
      "https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/planificateur-budgetaire",
    notAffiliated:
      "Budget super simple est un projet indépendant. Il n’est ni affilié à l’Agence de la consommation en matière financière du Canada ni au gouvernement du Canada, et n’est pas approuvé par ceux-ci.",
    newTab: "(s’ouvre dans un nouvel onglet)",
  },
  meta: {
    title: "Budget super simple — planificateur budgétaire mensuel gratuit",
    description:
      "Planifiez votre budget mensuel : choisissez ce que vous payez, entrez vos montants et comparez avec les fourchettes canadiennes habituelles. Gratuit et privé.",
  },
};
