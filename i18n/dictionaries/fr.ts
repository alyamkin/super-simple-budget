import type { Dictionary } from "./en";

/**
 * French dictionary. Copy comes from `T.fr` in `docs/reference/artifact.html`;
 * keep its non-breaking spaces (U+00A0) before `:` `;` `?` `!` `%`.
 */
export const fr: Dictionary = {
  app: {
    name: "Budget super simple",
    subtitle: "Choisissez ce que vous payez, ignorez le reste",
    skipToMain: "Passer au contenu principal",
  },
  language: {
    switchLabel: "English",
    switchAria: "Show in English",
  },
  theme: {
    dark: "Thème sombre",
  },
  wizard: {
    progress: "Progression",
    results: "Résultats",
    stepOf: "Étape {n} de {total} · {name}",
    back: "← Retour",
    next: "Suivant : {name} →",
    seePlan: "Voir mon plan →",
    edit: "← Modifier",
    documentTitle: "{step} — {app}",
  },
  tally: {
    label: "Total courant",
    title: "Votre plan",
    showAmounts: "Afficher les montants",
    view: { month: "Mensuel", year: "Annuel" },
    switchTo: {
      month: "Afficher les montants mensuels",
      year: "Afficher les montants annuels",
    },
    income: "Revenu",
    rough: "approx.",
    leftOver: "Reste",
    shortfall: "Manque",
    planned: "Prévu",
    left: "Reste",
    short: "Manque",
    announce: {
      leftOver: "Reste {amount} par mois",
      shortfall: "Manque {amount} par mois",
    },
  },
  results: {
    eyebrow: "Votre plan",
    headline: {
      noIncome: "Ajoutez votre revenu pour voir votre plan",
      leftOver: "Il vous reste {amount} chaque mois",
      shortfall: "Il vous manque {amount} chaque mois",
    },
    lede: "Sur les {income} que vous recevez chaque mois, vous prévoyez de dépenser {spending} et d’épargner {savings}, soit {share} de votre revenu.",
    outside: {
      one: "{n} catégorie est hors de la fourchette habituelle au Canada.",
      other: "{n} catégories sont hors de la fourchette habituelle au Canada.",
    },
    allWithin:
      "Toutes les catégories détaillées se situent dans la fourchette habituelle au Canada.",
    needIncome: "Votre plan a besoin d’un revenu pour établir une comparaison.",
    loading: "Chargement de votre plan…",
    flow: {
      title: "Où va votre revenu",
      income: "Revenu {amount}{per}",
      savings: "Épargne",
      spending: "Dépenses",
      leftOver: "Reste",
      shortfall: "Manque",
      incomeMark: "Revenu",
    },
    donut: {
      title: "Où va votre argent",
      planned: "Prévu{per}",
      nothingPlanned: "Rien n’est encore prévu",
      category: "Catégorie",
      share: "Part du plan",
      amount: "Montant",
    },
    top: {
      title: "Vos plus grosses dépenses",
      count: { one: "{n} élément sur {m}", other: "{n} éléments sur {m}" },
      share:
        "Ces {n} postes représentent {p} de vos dépenses. C’est habituellement là qu’il est le plus facile d’économiser.",
      largest:
        "Vos dépenses les plus importantes, de la plus élevée à la plus basse.",
      roughTotal: "{name} (total approximatif)",
    },
    compare: {
      title: "Comparaison de votre plan",
      explain:
        "Chaque catégorie en pourcentage de votre revenu, comparée à la fourchette habituelle au Canada. Le trait noir indique la limite de cette fourchette.",
      count: {
        red: { one: "{n} à revoir", other: "{n} à revoir" },
        yellow: { one: "{n} à surveiller", other: "{n} à surveiller" },
        green: { one: "{n} sur la bonne voie", other: "{n} sur la bonne voie" },
      },
      addIncome:
        "Ajoutez votre revenu pour comparer votre plan à la fourchette habituelle.",
      notCompared:
        "Aucune comparaison n’est possible pour les étapes où vous avez donné un total approximatif : {buckets}.",
    },
    next: {
      title: "Prochaines étapes",
      addIncome: {
        title: "Ajoutez votre revenu",
        body: "Revenez à la première étape pour que nous puissions comparer votre plan à ce que vous recevez.",
        action: "Aller au revenu",
      },
      closeGap: {
        title: "Comblez un manque de {amount} par mois",
        startWith:
          "Commencez par la catégorie « {category} », qui dépasse la fourchette habituelle.",
        startLargest:
          "Commencez par votre poste de dépenses le plus important et cherchez un changement possible dès ce mois-ci.",
      },
      surplus: {
        title: "Donnez un rôle à votre surplus de {amount}",
        body: "Le jour de la paie, transférez-le vers votre épargne ou vers des remboursements de dettes supplémentaires, avant qu’il soit dépensé.",
      },
      emergencyFund: {
        title: "Créez un fonds d’urgence",
        body: "Visez de 3 à 6 mois de dépenses. Un petit virement automatique est un bon début.",
      },
      itemize: {
        title: "Détaillez vos totaux approximatifs dès que possible",
        body: "Vous avez fait une estimation pour {buckets}. En détaillant ces montants, vous verrez où économiser et nous pourrons les comparer à la fourchette habituelle.",
      },
      name: "« {name} »",
    },
    summary: {
      copy: "Copier le résumé",
      title: "Mon plan budgétaire (mensuel)",
      line: "{name} : {amount}",
      roughLine: "{name} : {amount} (approx.)",
    },
  },
  budget: {
    nothingYet: "Rien n’a encore été ajouté",
    count: {
      income: { one: "{n} source de revenu", other: "{n} sources de revenu" },
      savings: {
        one: "{n} objectif d’épargne",
        other: "{n} objectifs d’épargne",
      },
      debt: { one: "{n} dette", other: "{n} dettes" },
      other: { one: "{n} dépense ajoutée", other: "{n} dépenses ajoutées" },
    },
    emptyHint:
      "Sélectionnez les éléments ci-dessous qui s’appliquent à vous. Ignorez ce que vous ne payez pas.",
    anythingElse: "Autre chose?",
    tapWhat: "Sélectionnez ce qui s’applique",
    add: "Ajouter : {label}",
    showMore: "Afficher {n} de plus",
    showFewer: "Afficher moins",
    somethingElse: "+ Autre chose",
    nameItem: "Nommez cet élément",
    itemName: "Nom de l’élément",
    yourItem: "Votre élément",
    amount: "Montant : {label}",
    frequency: "Fréquence : {label}",
    tip: "Conseil : {label}",
    remove: "Retirer : {label}",
    ofIncome: "{p} du revenu",
    searchLabel: "Chercher parmi tous les éléments",
    searchPlaceholder:
      "Chercher parmi tous les éléments (p. ex. gym, garderie, stationnement)",
    searchResults: { one: "{n} résultat", other: "{n} résultats" },
    noMatch:
      "Aucun résultat. Utilisez « Autre chose » pour ajouter votre propre élément.",
    estimateToggle: "Donner plutôt un total approximatif",
    estimateHint:
      "Vous manquez de temps? Un montant approximatif suffit pour commencer. Vous pourrez détailler plus tard.",
    estimateQuestion: "Environ combien au total?",
    estimateFrequency: "Fréquence du total approximatif",
  },
  toasts: {
    addedTo: "Ajouté à l’étape « {bucket} »",
    copied: "Résumé copié",
    noCopy: "La copie n’est pas disponible ici.",
    backupSaved: "Budget enregistré",
    csvSaved: "Fichier CSV enregistré",
    noDownload: "Les téléchargements ne sont pas disponibles ici.",
    opened: "Budget ouvert",
    notBudgetFile: "Ce fichier n’est pas un fichier de Budget super simple.",
    newerVersion:
      "Ce fichier a été créé par une version plus récente de Budget super simple.",
    tooLarge:
      "Ce fichier est trop volumineux pour être un fichier de Budget super simple.",
    cleared: "Nouveau budget vierge",
  },
  files: {
    menu: "Fichier",
    menuUnsaved: "Fichier, modifications non enregistrées",
    explain:
      "Votre budget est conservé dans ce navigateur seulement. Rien n’est envoyé ailleurs. Enregistrez-le dans un fichier pour le protéger ou le transférer sur un autre appareil.",
    save: "Enregistrer le budget",
    saveHint: "Fichier .json que vous pourrez rouvrir plus tard",
    open: "Ouvrir un budget",
    openHint: "Reprendre à partir d’un fichier .json enregistré",
    exportCsv: "Exporter vers un tableur",
    exportCsvHint: "Fichier .csv pour Excel ou Numbers, en consultation seulement",
    clear: "Effacer le budget",
    lastSaved: "Dernier enregistrement dans un fichier : {when}",
    notSaved: "Pas encore enregistré dans un fichier",
    today: "aujourd’hui",
    yesterday: "hier",
    daysAgo: "il y a {n} jours",
    fileBase: "mon-budget",
    csv: {
      section: "Section",
      item: "Élément",
      amount: "Montant",
      frequency: "Fréquence",
      monthly: "Mensuel",
      yearly: "Annuel",
      totalIncome: "Revenu total",
      totalPlanned: "Total prévu",
    },
  },
  notices: {
    unsavedTitle: "Modifications non enregistrées dans un fichier",
    unsavedBody:
      "Votre budget est conservé dans ce navigateur, mais vos dernières modifications ne sont pas encore enregistrées dans un fichier.",
    later: "Plus tard",
    confirm: {
      clearTitle: "Effacer votre budget?",
      openTitle: "Remplacer votre budget actuel?",
      body: "Les modifications faites depuis le dernier enregistrement de votre budget seront perdues. Enregistrez d’abord votre budget pour les conserver.",
      saved: "Budget enregistré. Vous pouvez continuer sans risque.",
      saveFirst: "Enregistrer d’abord le budget",
      continue: "Continuer sans enregistrer",
      cancel: "Annuler",
      clear: "Effacer mon budget",
      open: "Choisir un fichier à ouvrir",
    },
  },
  per: {
    month: "/mois",
    year: "/an",
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
  buckets: {
    income: {
      title: "Revenu",
      question: "Quel argent recevez-vous?",
      lede: "Sélectionnez chaque source de revenu que vous recevez, puis inscrivez le montant selon la fréquence à laquelle il arrive. Nous convertirons tout en montants mensuels.",
    },
    savings: {
      title: "Épargne",
      question: "Combien voulez-vous mettre de côté?",
      lede: "Payez-vous en premier. Si vous décidez combien épargner avant de planifier vos dépenses, vous aurez beaucoup plus de chances d’y arriver. Au Canada, les gens épargnent habituellement 5 % ou plus de leur revenu.",
    },
    home: {
      title: "Maison et factures",
      question: "Que payez-vous pour la maison?",
      lede: "Loyer ou hypothèque, services publics, téléphone et Internet, assurances et frais bancaires.",
    },
    around: {
      title: "Déplacements",
      question: "Comment vous déplacez-vous?",
      lede: "Frais de voiture, transport en commun et trajets.",
    },
    everyday: {
      title: "Vie quotidienne",
      question: "Que dépensez-vous au quotidien?",
      lede: "Alimentation, santé, vêtements et soins personnels.",
    },
    family: {
      title: "Famille, loisirs et dons",
      question: "Quelles sont vos autres dépenses?",
      lede: "Enfants, études, loisirs, voyages, animaux et cadeaux.",
    },
    debt: {
      title: "Paiements de dettes",
      question: "Quelles dettes remboursez-vous?",
      lede: "Inscrivez seulement les paiements réguliers sur les soldes que vous reportez d’un mois à l’autre. Les achats portés à votre carte font déjà partie de leur propre catégorie : ne les comptez pas deux fois.",
    },
  },
  categories: {
    debt: "Paiements de dettes",
    housing: "Logement",
    communications: "Téléphone, Internet et télé",
    food: "Alimentation",
    insurance: "Assurances personnelles",
    transportation: "Déplacements",
    childcare: "Enfants",
    education: "Études et formation",
    recreation: "Loisirs",
    personalCare: "Soins personnels",
    clothing: "Vêtements et accessoires",
    medical: "Santé",
    pets: "Animaux de compagnie",
    fees: "Frais bancaires et autres frais",
    giftsDonations: "Dons et cadeaux",
    savings: "Épargne",
  },
  fundTypes: {
    RRSP: "REER",
    RESP: "REEE",
    TFSA: "CELI",
    FHSA: "CELIAPP",
  },
  items: {
    myNetIncome: {
      label: "Mon salaire net",
      help: "Ce qui arrive réellement dans votre compte après les impôts et les autres retenues.",
      tip: "",
    },
    spouseNetIncome: {
      label: "Salaire net de mon ou ma partenaire",
      help: "",
      tip: "",
    },
    employmentInsurance: {
      label: "Prestations d’assurance-emploi",
      help: "Prestations temporaires versées pendant que vous êtes entre deux emplois ou en formation.",
      tip: "",
    },
    rentalIncome: {
      label: "Loyers perçus d’une propriété",
      help: "Ce que des locataires vous paient pour un espace dans une propriété qui vous appartient.",
      tip: "",
    },
    federalPension: {
      label: "Pensions gouvernementales (SV, RPC, SRG)",
      help: "Prestations de retraite du gouvernement, comme la Sécurité de la vieillesse (SV), le Régime de pensions du Canada (RPC) ou le Supplément de revenu garanti (SRG).",
      tip: "",
    },
    employerPension: {
      label: "Régime de retraite au travail",
      help: "Prestations versées par le régime de retraite d’un employeur.",
      tip: "",
    },
    personalRetirement: {
      label: "Retraits de mon épargne-retraite",
      help: "Ce que vous retirez de votre propre épargne-retraite, comme un REER ou un FERR.",
      tip: "",
    },
    studentLoanIncome: {
      label: "Aide financière aux études",
      help: "Argent pour les études provenant de retraits d’un REEE, de bourses, de subventions ou de prêts étudiants.",
      tip: "",
    },
    childSupportIncome: {
      label: "Pension alimentaire pour enfants reçue",
      help: "Montants qu’un ancien conjoint ou une ancienne conjointe vous verse pour aider à couvrir les dépenses de vos enfants.",
      tip: "",
    },
    childBenefits: {
      label: "Allocation canadienne pour enfants et autres allocations",
      help: "Versements mensuels non imposables du gouvernement qui aident les familles ayant des enfants de moins de 18 ans.",
      tip: "",
    },
    disabilityBenefit: {
      label: "Prestations d’invalidité",
      help: "Prestations pour les personnes qui ont cotisé au RPC et qui ne peuvent pas travailler régulièrement en raison d’une invalidité.",
      tip: "",
    },
    socialAssistance: {
      label: "Aide sociale",
      help: "Soutien financier pour les personnes à faible revenu qui ont besoin d’aide pour couvrir leurs besoins essentiels.",
      tip: "",
    },
    selfEmploymentIncome: {
      label: "Revenu de travail autonome",
      help: "Ce que vous gagnez grâce à votre entreprise ou à vos contrats, après les dépenses d’entreprise et l’impôt que vous mettez de côté.",
      tip: "",
    },
    gigIncome: {
      label: "Revenu d’appoint ou à la pige",
      help: "Gains tirés du transport de passagers, de la livraison, du travail à la pige ou d’un autre travail d’appoint.",
      tip: "",
    },
    spousalSupportIncome: {
      label: "Pension alimentaire pour conjoint reçue",
      help: "Montants qu’un ancien conjoint ou une ancienne conjointe vous verse pour votre propre soutien.",
      tip: "",
    },
    investmentIncome: {
      label: "Revenu de placements",
      help: "Intérêts, dividendes ou autres revenus réguliers tirés de vos placements.",
      tip: "",
    },
    emergencyFund: {
      label: "Fonds d’urgence",
      help: "Un coussin pour les dépenses imprévues. Visez de 3 à 6 mois de frais de subsistance.",
      tip: "Mettez en place un petit virement automatique, puis augmentez-le peu à peu.",
    },
    retirement: {
      label: "Épargne-retraite",
      help: "",
      tip: "",
    },
    education: {
      label: "Études des enfants",
      help: "",
      tip: "Des subventions gouvernementales peuvent s’ajouter à ce que vous versez dans un REEE.",
    },
    homePurchase: {
      label: "Mise de fonds pour une maison",
      help: "",
      tip: "Si vous achetez une première maison, vous pourriez utiliser votre épargne REER pour cet achat.",
    },
    homeRenovation: {
      label: "Améliorations à la maison",
      help: "",
      tip: "",
    },
    carPurchase: {
      label: "Prochaine voiture",
      help: "",
      tip: "Regardez au-delà du paiement mensuel et calculez ce que la voiture vous coûtera au total.",
    },
    incomeTax: {
      label: "Impôt à payer lors de la déclaration",
      help: "",
      tip: "Si vous devez habituellement de l’impôt au moment de produire votre déclaration, mettez de l’argent de côté tout au long de l’année.",
    },
    tfsa: {
      label: "CELI",
      help: "Compte d’épargne libre d’impôt. Les revenus qu’il génère et les retraits ne sont pas imposés.",
      tip: "Les droits de cotisation inutilisés à votre CELI sont reportés aux années suivantes.",
    },
    fhsa: {
      label: "Première maison (CELIAPP)",
      help: "Compte d’épargne libre d’impôt pour l’achat d’une première propriété. Les cotisations réduisent votre revenu imposable, et les retraits admissibles pour acheter une première maison ne sont pas imposés.",
      tip: "",
    },
    creditCard: {
      label: "Solde de carte de crédit",
      help: "Ce que vous payez sur le solde que vous reportez d’un mois à l’autre. Ne comptez pas les achats déjà inscrits ailleurs.",
      tip: "",
    },
    lineOfCredit: {
      label: "Solde de marge de crédit",
      help: "Ce que vous payez sur le solde de votre marge de crédit. Évitez de compter deux fois les mêmes dépenses.",
      tip: "",
    },
    personalLoan: {
      label: "Prêt personnel ou financement en magasin",
      help: "Paiements réguliers sur un prêt personnel, y compris le financement en magasin et les plans « achetez maintenant, payez plus tard ». Évitez de compter deux fois les mêmes dépenses.",
      tip: "",
    },
    studentLoan: {
      label: "Paiements de prêt étudiant",
      help: "Paiements réguliers sur des prêts étudiants ou une marge de crédit étudiante.",
      tip: "",
    },
    overdraft: {
      label: "Découvert",
      help: "Paiements pour ramener votre compte au-dessus de zéro, plus les frais et les intérêts de découvert.",
      tip: "",
    },
    paydayLoan: {
      label: "Prêts sur salaire",
      help: "Paiements sur des prêts à court terme et à coût élevé.",
      tip: "Les prêts sur salaire sont l’une des façons les plus coûteuses d’emprunter. Un conseiller en crédit d’un organisme sans but lucratif peut vous aider à trouver d’autres solutions.",
    },
    craDebt: {
      label: "Sommes dues à l’ARC",
      help: "Paiements sur l’impôt ou les trop-payés de prestations que vous devez à l’Agence du revenu du Canada.",
      tip: "",
    },
    rent: {
      label: "Loyer",
      help: "",
      tip: "",
    },
    mortgage: {
      label: "Hypothèque",
      help: "",
      tip: "",
    },
    heloc: {
      label: "Marge de crédit hypothécaire",
      help: "Ce que vous payez sur le solde d’une marge de crédit garantie par votre maison. Évitez de compter deux fois les mêmes dépenses.",
      tip: "",
    },
    propertyTax: {
      label: "Taxes foncières",
      help: "",
      tip: "",
    },
    condoFee: {
      label: "Frais de copropriété",
      help: "",
      tip: "",
    },
    tenantInsurance: {
      label: "Assurance locataire",
      help: "",
      tip: "Comparez les soumissions de quelques assureurs avant de renouveler.",
    },
    homeInsurance: {
      label: "Assurance habitation",
      help: "",
      tip: "",
    },
    furniture: {
      label: "Meubles et électroménagers",
      help: "",
      tip: "",
    },
    outdoorEquipment: {
      label: "Entretien du terrain et déneigement",
      help: "Entretien à l’extérieur de la maison, comme le déneigement, l’entretien de la pelouse ou le jardinage.",
      tip: "",
    },
    homeSecurity: {
      label: "Télésurveillance",
      help: "",
      tip: "",
    },
    electricity: {
      label: "Électricité",
      help: "",
      tip: "",
    },
    waterSewage: {
      label: "Facture d’eau",
      help: "",
      tip: "",
    },
    heating: {
      label: "Chauffage et location d’équipement",
      help: "Votre facture de chauffage, plus la location d’équipement comme une fournaise ou un chauffe-eau.",
      tip: "",
    },
    homeMaintenance: {
      label: "Réparations et entretien de la maison",
      help: "Réparer et entretenir votre maison, par exemple la plomberie, la peinture ou le remplacement d’un chauffe-eau.",
      tip: "",
    },
    telephone: {
      label: "Forfaits de téléphone",
      help: "",
      tip: "",
    },
    cable: {
      label: "Service de télé",
      help: "",
      tip: "",
    },
    internet: {
      label: "Internet",
      help: "",
      tip: "",
    },
    combined: {
      label: "Services groupés",
      help: "Offres d’un même fournisseur qui regroupent le téléphone, Internet, la télé ou d’autres services pour un seul prix.",
      tip: "",
    },
    subscriptions: {
      label: "Diffusion en continu et abonnements en ligne",
      help: "Services de diffusion en continu et autres abonnements en ligne.",
      tip: "",
    },
    groceries: {
      label: "Épicerie",
      help: "Votre facture d’épicerie, y compris les livraisons de prêts-à-cuisiner.",
      tip: "Planifiez vos repas et faites l’épicerie après avoir mangé : vous aurez moins envie d’extras.",
    },
    restaurants: {
      label: "Restaurants et commandes à emporter",
      help: "Repas au restaurant et mets à emporter, plus les petits achats comme le café, le thé et les collations.",
      tip: "Un café ou un thé par jour peut coûter plus de 900 $ par année.",
    },
    life: {
      label: "Assurance vie",
      help: "",
      tip: "",
    },
    medical: {
      label: "Assurance maladie et dentaire",
      help: "",
      tip: "",
    },
    disability: {
      label: "Assurance invalidité ou accident",
      help: "",
      tip: "",
    },
    carPayments: {
      label: "Paiements de voiture",
      help: "",
      tip: "",
    },
    carInsurance: {
      label: "Assurance auto",
      help: "",
      tip: "Comparez les soumissions de quelques assureurs avant de renouveler.",
    },
    gas: {
      label: "Essence ou recharge",
      help: "",
      tip: "",
    },
    maintenance: {
      label: "Entretien de la voiture",
      help: "Entretien courant comme les mises au point saisonnières, le changement des pneus et la vidange d’huile.",
      tip: "",
    },
    carRegistration: {
      label: "Plaques et immatriculation",
      help: "",
      tip: "",
    },
    parking: {
      label: "Stationnement",
      help: "",
      tip: "",
    },
    transitPass: {
      label: "Transport en commun",
      help: "",
      tip: "",
    },
    rideServices: {
      label: "Taxis et transport par application",
      help: "Taxis, services de transport par application et services semblables.",
      tip: "",
    },
    tolls: {
      label: "Péages",
      help: "Péages d’autoroutes et de ponts.",
      tip: "",
    },
    carShare: {
      label: "Autopartage et location",
      help: "Abonnements d’autopartage, trajets et locations de courte durée.",
      tip: "",
    },
    bike: {
      label: "Vélo et trottinette",
      help: "Achat, réparation ou location d’un vélo ou d’une trottinette électrique, y compris le vélopartage.",
      tip: "",
    },
    daycare: {
      label: "Garderie et services de garde",
      help: "",
      tip: "",
    },
    babysitting: {
      label: "Gardiennage",
      help: "",
      tip: "",
    },
    childSupport: {
      label: "Pension alimentaire pour enfants versée",
      help: "Montants que vous versez pour aider à couvrir les dépenses de vos enfants après une séparation ou un divorce.",
      tip: "",
    },
    childrensAllowance: {
      label: "Argent de poche des enfants",
      help: "Argent que vous donnez à vos enfants pour leurs petits achats ou pour épargner.",
      tip: "",
    },
    summerCamps: {
      label: "Camps d’été et de congés",
      help: "Camps de jour et camps de vacances pendant les congés scolaires.",
      tip: "Informez-vous sur les tarifs hâtifs et les rabais pour les frères et sœurs.",
    },
    schoolLunches: {
      label: "Dîners et collations à l’école",
      help: "Programmes de repas, argent pour la cafétéria et collations pour l’école.",
      tip: "",
    },
    tuition: {
      label: "Droits de scolarité",
      help: "",
      tip: "",
    },
    schoolSupplies: {
      label: "Manuels et fournitures scolaires",
      help: "",
      tip: "",
    },
    schoolTrips: {
      label: "Sorties scolaires",
      help: "",
      tip: "",
    },
    travel: {
      label: "Voyages et vacances",
      help: "Vols, hébergement et autres frais liés à un séjour à l’extérieur.",
      tip: "Vous prévoyez un voyage? Commencez dès maintenant à mettre de l’argent de côté.",
    },
    memberships: {
      label: "Gym et clubs",
      help: "Frais pour un centre de conditionnement physique, une piscine, un centre sportif ou un lieu semblable.",
      tip: "La marche, la course et l’entraînement à la maison ne coûtent rien.",
    },
    childrenToys: {
      label: "Jouets et activités des enfants",
      help: "",
      tip: "Beaucoup de villes offrent des activités gratuites pour les enfants et les familles.",
    },
    tickets: {
      label: "Concerts, spectacles et matchs",
      help: "Concerts, spectacles, matchs sportifs et autres événements.",
      tip: "",
    },
    sportsGear: {
      label: "Équipement de sport et de loisirs",
      help: "Équipement et frais pour des activités comme le ski, le camping, le hockey ou le tennis.",
      tip: "",
    },
    entertainmentEquipment: {
      label: "Appareils électroniques",
      help: "Ordinateurs, téléviseurs, chaînes audio, consoles de jeux et autres appareils électroniques semblables.",
      tip: "Acheter des appareils usagés ou remis à neuf peut vous faire économiser beaucoup.",
    },
    alcohol: {
      label: "Alcool",
      help: "",
      tip: "",
    },
    smoking: {
      label: "Produits du tabac et de vapotage",
      help: "Cigarettes, produits de vapotage et fournitures connexes.",
      tip: "",
    },
    hairdresser: {
      label: "Coupes de cheveux",
      help: "",
      tip: "",
    },
    cosmetics: {
      label: "Maquillage et soins de la peau",
      help: "",
      tip: "",
    },
    spa: {
      label: "Spa et soins de beauté",
      help: "",
      tip: "",
    },
    clothes: {
      label: "Vêtements",
      help: "",
      tip: "",
    },
    childrenClothes: {
      label: "Vêtements des enfants",
      help: "",
      tip: "",
    },
    accessories: {
      label: "Chaussures, sacs et accessoires",
      help: "",
      tip: "",
    },
    doctor: {
      label: "Frais médicaux",
      help: "",
      tip: "",
    },
    dentist: {
      label: "Soins dentaires",
      help: "",
      tip: "",
    },
    specialists: {
      label: "Thérapeutes et spécialistes",
      help: "Professionnels comme les physiothérapeutes, les chiropraticiens, les psychologues ou les optométristes.",
      tip: "",
    },
    prescriptions: {
      label: "Médicaments d’ordonnance",
      help: "Médicaments que vous payez et qu’aucun régime ne couvre.",
      tip: "",
    },
    eyewear: {
      label: "Lunettes et lentilles cornéennes",
      help: "Montures, verres et lentilles qu’aucun régime ne couvre.",
      tip: "",
    },
    petFood: {
      label: "Nourriture et fournitures pour animaux",
      help: "",
      tip: "",
    },
    veterinarian: {
      label: "Frais de vétérinaire",
      help: "",
      tip: "Une assurance pour animaux peut aider à payer les grosses factures de vétérinaire.",
    },
    bankFees: {
      label: "Frais bancaires",
      help: "Frais mensuels de compte, frais de transaction, frais de courtage et autres frais semblables.",
      tip: "Beaucoup de banques et de coopératives de crédit offrent des comptes à frais modiques ou sans frais.",
    },
    creditCardFees: {
      label: "Frais de carte",
      help: "Frais annuels, assurance solde et autres frais récurrents liés à votre carte.",
      tip: "Vérifiez que les avantages de votre carte valent ce qu’elle vous coûte.",
    },
    professionalDues: {
      label: "Cotisations syndicales et professionnelles",
      help: "Cotisations liées au travail, comme les cotisations syndicales ou celles d’un ordre ou d’une association professionnelle.",
      tip: "",
    },
    taxPrep: {
      label: "Préparation de la déclaration de revenus",
      help: "Frais pour faire préparer votre déclaration de revenus.",
      tip: "Des comptoirs d’impôts gratuits peuvent vous aider si votre revenu est modeste et que votre situation fiscale est simple.",
    },
    legalFees: {
      label: "Frais juridiques et professionnels",
      help: "Avocats, notaires, comptables et services semblables.",
      tip: "",
    },
    gifts: {
      label: "Cadeaux",
      help: "Cadeaux pour les fêtes, les anniversaires, les mariages et d’autres occasions.",
      tip: "Essayez un échange de cadeaux ou un cadeau fait maison.",
    },
    donations: {
      label: "Dons de bienfaisance",
      help: "Argent que vous donnez à des organismes de bienfaisance et à d’autres causes.",
      tip: "",
    },
  },
  rule: {
    level: {
      green: "Sur la bonne voie",
      yellow: "À surveiller",
      red: "À revoir",
    },
    savings: {
      zero: "Vous ne mettez rien de côté pour l’instant. La cible habituelle est d’au moins {edge} du revenu.",
      green: "Vous atteignez la cible habituelle d’au moins {edge} du revenu.",
      under: "Un peu sous la cible habituelle d’au moins {edge} du revenu.",
    },
    zero: "Vous n’avez rien prévu ici. La plupart des ménages y consacrent un montant, jusqu’à environ {edge} du revenu.",
    green: "Dans la fourchette habituelle, soit jusqu’à {edge} du revenu.",
    yellow: "Un peu au-dessus de la fourchette habituelle, qui va jusqu’à {edge} du revenu.",
    red: "Nettement au-dessus de la fourchette habituelle, qui va jusqu’à {edge} du revenu.",
  },
  footer: {
    about: "À propos de cet outil",
    privacy:
      "Votre budget reste sur votre appareil, sans compte et sans envoi à un serveur.",
    advice: "Information générale, et non des conseils financiers.",
    credit: "Fourchettes de dépenses adaptées du",
    creditLink: "Planificateur budgétaire de l’ACFC",
    creditUrl:
      "https://itools-ioutils.fcac-acfc.gc.ca/BP-PB/planificateur-budgetaire",
    notAffiliated:
      "Ni affilié à l’ACFC ou au gouvernement du Canada, ni approuvé par eux.",
    newTab: "(s’ouvre dans un nouvel onglet)",
  },
  meta: {
    title: "Budget super simple — planificateur budgétaire mensuel gratuit",
    description:
      "Planifiez votre budget mensuel : choisissez ce que vous payez, entrez vos montants et comparez avec les fourchettes canadiennes habituelles. Gratuit et privé.",
  },
};
