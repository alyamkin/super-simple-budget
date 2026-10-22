/**
 * English dictionary. Plain serialisable data: `{var}` placeholders are filled by
 * `t()`, objects with an `other` key are plural forms resolved by `plural()`.
 * Copy comes from `T.en` in `docs/reference/artifact.html`.
 */
export const en = {
  app: {
    name: "Super Simple Budget",
    subtitle: "Tap what you pay for, skip the rest",
    skipToMain: "Skip to main content",
  },
  language: {
    switchLabel: "Français",
    switchAria: "Afficher en français",
  },
  wizard: {
    progress: "Progress",
    results: "Results",
    stepOf: "Step {n} of {total} · {name}",
    back: "← Back",
    next: "Next: {name} →",
    seePlan: "See my plan →",
    edit: "← Edit",
    documentTitle: "{step} — {app}",
  },
  tally: {
    label: "Running total",
    title: "Your plan",
  },
  results: {
    eyebrow: "Your plan",
  },
  budget: {
    nothingYet: "Nothing added yet",
    count: {
      income: { one: "{n} source of income", other: "{n} sources of income" },
      savings: { one: "{n} savings goal", other: "{n} savings goals" },
      debt: { one: "{n} debt", other: "{n} debts" },
      other: {
        one: "You pay for {n} thing here",
        other: "You pay for {n} things here",
      },
    },
    emptyHint:
      "Tap the items below that apply to you. Skip anything you don't pay for.",
    anythingElse: "Anything else?",
    tapWhat: "Tap what applies",
    add: "Add {label}",
    showMore: "Show {n} more",
    showFewer: "Show fewer",
    somethingElse: "+ Something else",
    nameItem: "Name this item",
    itemName: "Item name",
    yourItem: "Your item",
    amount: "{label} amount",
    frequency: "{label} frequency",
    tip: "Tip for {label}",
    remove: "Remove {label}",
    ofIncome: "{p} of income",
    searchLabel: "Search all items",
    searchPlaceholder: "Search all items, e.g. gym, daycare, parking",
    searchResults: { one: "{n} result", other: "{n} results" },
    noMatch: "No match. Use “Something else” to add your own.",
  },
  toasts: {
    addedTo: "Added to {bucket}",
  },
  per: {
    month: "/mo",
    year: "/yr",
  },
  frequency: {
    Daily: "Daily",
    Weekly: "Weekly",
    Every2Weeks: "Every 2 weeks",
    TwiceMonthly: "Twice a month",
    Monthly: "Monthly",
    Quarterly: "Every 3 months",
    Every6Months: "Every 6 months",
    Annually: "Yearly",
  },
  buckets: {
    income: {
      title: "Income",
      question: "What money comes in?",
      lede: "Tap each source you receive, then enter the amount the way it arrives. We'll convert everything to monthly.",
    },
    savings: {
      title: "Savings",
      question: "What do you want to set aside?",
      lede: "Pay yourself first. Deciding what to save before you plan spending makes it far more likely to happen. Canadians usually save 5% or more of their income.",
    },
    home: {
      title: "Home and bills",
      question: "What do you pay for at home?",
      lede: "Rent or mortgage, utilities, phone and internet, insurance and bank fees.",
    },
    around: {
      title: "Getting around",
      question: "How do you get around?",
      lede: "Car costs, transit and rides.",
    },
    everyday: {
      title: "Everyday living",
      question: "What do you spend on day to day?",
      lede: "Food, health, clothes and personal care.",
    },
    family: {
      title: "Family, fun and giving",
      question: "What else do you spend on?",
      lede: "Kids, school, hobbies, travel, pets and gifts.",
    },
    debt: {
      title: "Debt payments",
      question: "Which debts are you paying off?",
      lede: "Enter only the regular payments toward balances you carry from month to month. Purchases you put on a card already belong in their own category, so don't count them twice.",
    },
  },
  categories: {
    debt: "Debt payments",
    housing: "Home",
    communications: "Phone, internet and TV",
    food: "Food and dining",
    insurance: "Personal insurance",
    transportation: "Getting around",
    childcare: "Children",
    education: "School and learning",
    recreation: "Leisure and fun",
    personalCare: "Self-care",
    clothing: "Clothes and accessories",
    medical: "Health care",
    pets: "Pet care",
    fees: "Banking and other fees",
    giftsDonations: "Giving",
    savings: "Savings",
  },
  fundTypes: {
    RRSP: "RRSP",
    RESP: "RESP",
    TFSA: "TFSA",
    FHSA: "FHSA",
  },
  items: {
    myNetIncome: {
      label: "My net salary",
      help: "What actually lands in your account after taxes and other deductions.",
      tip: "",
    },
    spouseNetIncome: {
      label: "Partner's net salary",
      help: "",
      tip: "",
    },
    employmentInsurance: {
      label: "EI benefits",
      help: "Temporary payments while you're between jobs or retraining.",
      tip: "",
    },
    rentalIncome: {
      label: "Rent from a property I own",
      help: "Money tenants pay you for space in a property you own.",
      tip: "",
    },
    federalPension: {
      label: "Government pensions (OAS, CPP, GIS)",
      help: "Government retirement payments such as OAS, CPP or the GIS.",
      tip: "",
    },
    employerPension: {
      label: "Workplace pension",
      help: "Retirement payments from a workplace pension plan.",
      tip: "",
    },
    personalRetirement: {
      label: "Withdrawals from my retirement savings",
      help: "Money you draw from your own retirement savings, like an RRSP or RRIF.",
      tip: "",
    },
    studentLoanIncome: {
      label: "Student funding",
      help: "Money for school from RESP withdrawals, scholarships, grants or student loans.",
      tip: "",
    },
    childSupportIncome: {
      label: "Child support I receive",
      help: "Payments you receive from a former partner to help cover your children's costs.",
      tip: "",
    },
    childBenefits: {
      label: "Canada Child Benefit and other child benefits",
      help: "Tax-free monthly government payments that help families with children under 18.",
      tip: "",
    },
    disabilityBenefit: {
      label: "Disability benefits",
      help: "Payments for people who paid into the CPP and can't work regularly because of a disability.",
      tip: "",
    },
    socialAssistance: {
      label: "Social assistance",
      help: "Financial support for people with low income who need help covering basic costs.",
      tip: "",
    },
    selfEmploymentIncome: {
      label: "Self-employment income",
      help: "What you earn from your own business or contract work, after business costs and the tax you set aside.",
      tip: "",
    },
    gigIncome: {
      label: "Side or gig income",
      help: "Earnings from rideshare, delivery, freelance or other side work.",
      tip: "",
    },
    spousalSupportIncome: {
      label: "Spousal support received",
      help: "Payments you receive from a former spouse or partner for your own support.",
      tip: "",
    },
    investmentIncome: {
      label: "Investment income",
      help: "Interest, dividends or other regular income from your investments.",
      tip: "",
    },
    emergencyFund: {
      label: "Emergency fund",
      help: "A cushion for surprise costs. A good target is 3 to 6 months of living expenses.",
      tip: "Set up a small automatic transfer, then raise it bit by bit.",
    },
    retirement: {
      label: "Retirement savings",
      help: "",
      tip: "",
    },
    education: {
      label: "Children's education",
      help: "",
      tip: "Government grants can add to what you put into an RESP.",
    },
    homePurchase: {
      label: "Down payment for a home",
      help: "",
      tip: "First-time buyers may be able to put RRSP savings toward a home.",
    },
    homeRenovation: {
      label: "Home improvements",
      help: "",
      tip: "",
    },
    carPurchase: {
      label: "Next car",
      help: "",
      tip: "Look past the monthly payment and add up what the car will cost you overall.",
    },
    incomeTax: {
      label: "Tax owing at filing time",
      help: "",
      tip: "If you usually owe tax when you file, set money aside for it through the year.",
    },
    tfsa: {
      label: "TFSA",
      help: "Tax-Free Savings Account. What it earns, and what you take out, isn't taxed.",
      tip: "Unused TFSA room carries forward to later years.",
    },
    fhsa: {
      label: "First home (FHSA)",
      help: "First Home Savings Account. Contributions lower your taxable income, and qualifying withdrawals to buy a first home aren't taxed.",
      tip: "",
    },
    creditCard: {
      label: "Credit card balance",
      help: "What you pay toward a balance you carry from month to month. Don't count purchases you've already listed elsewhere.",
      tip: "",
    },
    lineOfCredit: {
      label: "Line of credit balance",
      help: "What you pay toward the balance on your line of credit. Avoid counting the same spending twice.",
      tip: "",
    },
    personalLoan: {
      label: "Personal loan or store financing",
      help: "Regular payments on a personal loan, including store financing and buy now, pay later plans. Avoid counting the same spending twice.",
      tip: "",
    },
    studentLoan: {
      label: "Student loan payments",
      help: "Regular payments on student loans or a student line of credit.",
      tip: "",
    },
    overdraft: {
      label: "Overdraft",
      help: "Payments to bring your account back above zero, plus overdraft fees and interest.",
      tip: "",
    },
    paydayLoan: {
      label: "Payday loans",
      help: "Payments on short-term, high-cost loans.",
      tip: "Payday loans are one of the most expensive ways to borrow. A non-profit credit counsellor can help you find other options.",
    },
    craDebt: {
      label: "Money owed to the CRA",
      help: "Payments on income tax or benefit overpayments you owe the Canada Revenue Agency.",
      tip: "",
    },
    rent: {
      label: "Rent",
      help: "",
      tip: "",
    },
    mortgage: {
      label: "Mortgage",
      help: "",
      tip: "",
    },
    heloc: {
      label: "Home equity line of credit",
      help: "What you pay toward the balance on a line of credit secured by your home. Avoid counting the same spending twice.",
      tip: "",
    },
    propertyTax: {
      label: "Property tax",
      help: "",
      tip: "",
    },
    condoFee: {
      label: "Condo fees",
      help: "",
      tip: "",
    },
    tenantInsurance: {
      label: "Renter's insurance",
      help: "",
      tip: "Compare quotes from a few insurers before you renew.",
    },
    homeInsurance: {
      label: "Home insurance",
      help: "",
      tip: "",
    },
    furniture: {
      label: "Furniture and appliances",
      help: "",
      tip: "",
    },
    outdoorEquipment: {
      label: "Yard and snow care",
      help: "Upkeep outside your home, like snow clearing, lawn care or gardening.",
      tip: "",
    },
    homeSecurity: {
      label: "Alarm monitoring",
      help: "",
      tip: "",
    },
    electricity: {
      label: "Electricity",
      help: "",
      tip: "",
    },
    waterSewage: {
      label: "Water bill",
      help: "",
      tip: "",
    },
    heating: {
      label: "Heating and equipment rental",
      help: "Your heating bill, plus rental fees for equipment like a furnace or water heater.",
      tip: "",
    },
    homeMaintenance: {
      label: "Home repairs and maintenance",
      help: "Fixing and looking after your home, like plumbing, painting or replacing a water heater.",
      tip: "",
    },
    telephone: {
      label: "Phone plans",
      help: "",
      tip: "",
    },
    cable: {
      label: "TV service",
      help: "",
      tip: "",
    },
    internet: {
      label: "Internet",
      help: "",
      tip: "",
    },
    combined: {
      label: "Bundled services",
      help: "Bundles from one provider that cover phone, internet, TV or other services for one price.",
      tip: "",
    },
    subscriptions: {
      label: "Streaming and online subscriptions",
      help: "Streaming services and other online subscriptions.",
      tip: "",
    },
    groceries: {
      label: "Groceries",
      help: "Your grocery bill, including any meal kit deliveries.",
      tip: "Plan your meals, and shop after eating so you're less tempted by extras.",
    },
    restaurants: {
      label: "Eating out and takeout",
      help: "Meals out and takeout, plus small buys like coffee, tea and snacks.",
      tip: "A daily coffee or tea can add up to more than $900 a year.",
    },
    life: {
      label: "Life insurance",
      help: "",
      tip: "",
    },
    medical: {
      label: "Health and dental insurance",
      help: "",
      tip: "",
    },
    disability: {
      label: "Disability and accident insurance",
      help: "",
      tip: "",
    },
    carPayments: {
      label: "Car payments",
      help: "",
      tip: "",
    },
    carInsurance: {
      label: "Car insurance",
      help: "",
      tip: "Compare quotes from a few insurers before you renew.",
    },
    gas: {
      label: "Fuel or charging",
      help: "",
      tip: "",
    },
    maintenance: {
      label: "Car upkeep",
      help: "Routine care like seasonal tune-ups, tire swaps and oil changes.",
      tip: "",
    },
    carRegistration: {
      label: "Licence plates and registration",
      help: "",
      tip: "",
    },
    parking: {
      label: "Parking",
      help: "",
      tip: "",
    },
    transitPass: {
      label: "Transit",
      help: "",
      tip: "",
    },
    rideServices: {
      label: "Taxis and ride-hailing",
      help: "Taxis, ride-hailing and similar services.",
      tip: "",
    },
    tolls: {
      label: "Tolls",
      help: "Highway and bridge tolls.",
      tip: "",
    },
    carShare: {
      label: "Car sharing and rentals",
      help: "Car-share memberships, trips and short-term rentals.",
      tip: "",
    },
    bike: {
      label: "Bike and scooter costs",
      help: "Buying, repairing or renting a bike or e-scooter, including bike share.",
      tip: "",
    },
    daycare: {
      label: "Daycare and childcare",
      help: "",
      tip: "",
    },
    babysitting: {
      label: "Babysitters",
      help: "",
      tip: "",
    },
    childSupport: {
      label: "Child support I pay",
      help: "Payments you make to help cover your children's costs after a separation or divorce.",
      tip: "",
    },
    childrensAllowance: {
      label: "Pocket money for kids",
      help: "Spending money you give your children for small purchases or saving.",
      tip: "",
    },
    summerCamps: {
      label: "Summer and holiday camps",
      help: "Day camps and overnight camps during school breaks.",
      tip: "Ask about early-bird rates and sibling discounts.",
    },
    schoolLunches: {
      label: "School lunches and snacks",
      help: "Lunch programs, cafeteria money and snacks for school.",
      tip: "",
    },
    tuition: {
      label: "Tuition",
      help: "",
      tip: "",
    },
    schoolSupplies: {
      label: "Books and school supplies",
      help: "",
      tip: "",
    },
    schoolTrips: {
      label: "School outings",
      help: "",
      tip: "",
    },
    travel: {
      label: "Trips and vacations",
      help: "Flights, places to stay and other costs of being away on a trip.",
      tip: "Have a trip in mind? Start setting money aside for it now.",
    },
    memberships: {
      label: "Gym and club fees",
      help: "Fees for a gym, pool, sports centre or similar facility.",
      tip: "Walking, running and home workouts cost nothing.",
    },
    childrenToys: {
      label: "Kids’ toys and activities",
      help: "",
      tip: "Many cities run free activities for kids and families.",
    },
    tickets: {
      label: "Concerts, shows and games",
      help: "Concerts, shows, sports games and other events.",
      tip: "",
    },
    sportsGear: {
      label: "Sports and hobby gear",
      help: "Equipment and costs for activities like skiing, camping, hockey or tennis.",
      tip: "",
    },
    entertainmentEquipment: {
      label: "Electronics",
      help: "Computers, TVs, sound systems, game consoles and similar electronics.",
      tip: "Buying used or refurbished can save you a lot.",
    },
    alcohol: {
      label: "Alcohol",
      help: "",
      tip: "",
    },
    smoking: {
      label: "Tobacco and vaping",
      help: "Cigarettes, vaping products and related supplies.",
      tip: "",
    },
    hairdresser: {
      label: "Haircuts",
      help: "",
      tip: "",
    },
    cosmetics: {
      label: "Makeup and skin care",
      help: "",
      tip: "",
    },
    spa: {
      label: "Spa and beauty treatments",
      help: "",
      tip: "",
    },
    clothes: {
      label: "Clothing",
      help: "",
      tip: "",
    },
    childrenClothes: {
      label: "Kids’ clothing",
      help: "",
      tip: "",
    },
    accessories: {
      label: "Shoes, bags and accessories",
      help: "",
      tip: "",
    },
    doctor: {
      label: "Medical costs",
      help: "",
      tip: "",
    },
    dentist: {
      label: "Dental care",
      help: "",
      tip: "",
    },
    specialists: {
      label: "Therapists and specialists",
      help: "Practitioners such as physiotherapists, chiropractors, psychologists or optometrists.",
      tip: "",
    },
    prescriptions: {
      label: "Prescriptions",
      help: "Medicines you pay for that a plan doesn't cover.",
      tip: "",
    },
    eyewear: {
      label: "Glasses and contact lenses",
      help: "Frames, lenses and contacts not covered by a plan.",
      tip: "",
    },
    petFood: {
      label: "Pet food and supplies",
      help: "",
      tip: "",
    },
    veterinarian: {
      label: "Vet bills",
      help: "",
      tip: "Pet insurance may help with large vet bills.",
    },
    bankFees: {
      label: "Bank fees",
      help: "Monthly account fees, transaction charges, brokerage fees and similar costs.",
      tip: "Many banks and credit unions offer low-fee or free accounts.",
    },
    creditCardFees: {
      label: "Card fees",
      help: "Annual fees, balance protection and other recurring charges on your card.",
      tip: "Check that your card's features are worth what you pay for it.",
    },
    professionalDues: {
      label: "Union and professional dues",
      help: "Work-related membership fees, like union dues or professional association fees.",
      tip: "",
    },
    taxPrep: {
      label: "Tax preparation",
      help: "Fees to have your tax return prepared.",
      tip: "Free tax clinics can help if your income is modest and your taxes are simple.",
    },
    legalFees: {
      label: "Legal and professional fees",
      help: "Lawyers, notaries, accountants and similar services.",
      tip: "",
    },
    gifts: {
      label: "Gifts",
      help: "Presents for holidays, birthdays, weddings and other occasions.",
      tip: "Try a gift exchange or a homemade gift.",
    },
    donations: {
      label: "Charitable giving",
      help: "Money you give to charities and other causes.",
      tip: "",
    },
  },
  rule: {
    level: {
      green: "On track",
      yellow: "A bit off",
      red: "Needs attention",
    },
    savings: {
      zero: "You're not setting anything aside yet. The usual target is at least {edge} of income.",
      green: "You meet the usual target of at least {edge} of income.",
      under: "A little under the usual target of at least {edge} of income.",
    },
    zero: "You haven't planned anything here. Most households spend something, up to about {edge} of income.",
    green: "Within the usual range of up to {edge} of income.",
    yellow: "A bit above the usual range of up to {edge} of income.",
    red: "Well above the usual range of up to {edge} of income.",
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
