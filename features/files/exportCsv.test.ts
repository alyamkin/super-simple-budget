/** @jest-environment node */
import { EXAMPLE_BUDGET } from "@/domain/__fixtures__/exampleBudget";
import { emptyBudget, type Budget } from "@/domain/budget";
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { createTranslator } from "@/i18n/translate";
import { budgetCsv } from "./exportCsv";

const EN = createTranslator("en", en);
const FR = createTranslator("fr", fr);

/** Splits off the BOM and the final CRLF, then into lines. */
function lines(csv: string): string[] {
  expect(csv.startsWith("﻿")).toBe(true);
  expect(csv.endsWith("\r\n")).toBe(true);
  expect(csv.replaceAll("\r\n", "")).not.toMatch(/[\r\n]/);
  return csv.slice(1, -2).split("\r\n");
}

describe("budgetCsv", () => {
  it("exports the example in English", () => {
    expect(lines(budgetCsv(EN, EXAMPLE_BUDGET))).toEqual([
      "Section,Item,Amount,Frequency,Monthly,Yearly",
      "Income,My net salary,2150.00,Every 2 weeks,4658.33,55900.00",
      "Income,Partner's net salary,1850.00,Every 2 weeks,4008.33,48100.00",
      "Savings,Emergency fund,150.00,Monthly,150.00,1800.00",
      "Savings,Retirement savings,250.00,Monthly,250.00,3000.00",
      "Savings,Down payment for a home,200.00,Monthly,200.00,2400.00",
      "Home and bills,Rent,2350.00,Monthly,2350.00,28200.00",
      "Home and bills,Renter's insurance,28.00,Monthly,28.00,336.00",
      "Home and bills,Electricity,95.00,Monthly,95.00,1140.00",
      "Home and bills,Internet,70.00,Monthly,70.00,840.00",
      "Home and bills,Phone plans,110.00,Monthly,110.00,1320.00",
      "Home and bills,Streaming and online subscriptions,35.00,Monthly,35.00,420.00",
      "Home and bills,Bank fees,17.00,Monthly,17.00,204.00",
      "Home and bills,Tax preparation,150.00,Yearly,12.50,150.00",
      "Getting around,Car payments,430.00,Monthly,430.00,5160.00",
      "Getting around,Car insurance,175.00,Monthly,175.00,2100.00",
      "Getting around,Fuel or charging,60.00,Weekly,260.00,3120.00",
      "Getting around,Transit,156.00,Monthly,156.00,1872.00",
      "Getting around,Licence plates and registration,120.00,Yearly,10.00,120.00",
      "Everyday living,Groceries,210.00,Weekly,910.00,10920.00",
      "Everyday living,Eating out and takeout,70.00,Weekly,303.33,3640.00",
      "Everyday living,Clothing,150.00,Monthly,150.00,1800.00",
      "Everyday living,Haircuts,60.00,Monthly,60.00,720.00",
      "Everyday living,Dental care,400.00,Yearly,33.33,400.00",
      '"Family, fun and giving","Family, fun and giving (rough total)",450.00,Monthly,450.00,5400.00',
      "Debt payments,Credit card balance,300.00,Monthly,300.00,3600.00",
      "Debt payments,Student loan payments,240.00,Monthly,240.00,2880.00",
      "",
      ",Total income,,,8666.67,104000.00",
      ",Total planned,,,6795.17,81542.00",
      ",Left over,,,1871.50,22458.00",
    ]);
  });

  it("exports the example in French with ; and decimal commas", () => {
    expect(lines(budgetCsv(FR, EXAMPLE_BUDGET))).toEqual([
      "Section;Élément;Montant;Fréquence;Mensuel;Annuel",
      "Revenu;Mon salaire net;2150,00;Aux 2 semaines;4658,33;55900,00",
      "Revenu;Salaire net de mon ou ma partenaire;1850,00;Aux 2 semaines;4008,33;48100,00",
      "Épargne;Fonds d’urgence;150,00;Chaque mois;150,00;1800,00",
      "Épargne;Épargne-retraite;250,00;Chaque mois;250,00;3000,00",
      "Épargne;Mise de fonds pour une maison;200,00;Chaque mois;200,00;2400,00",
      "Maison et factures;Loyer;2350,00;Chaque mois;2350,00;28200,00",
      "Maison et factures;Assurance locataire;28,00;Chaque mois;28,00;336,00",
      "Maison et factures;Électricité;95,00;Chaque mois;95,00;1140,00",
      "Maison et factures;Internet;70,00;Chaque mois;70,00;840,00",
      "Maison et factures;Forfaits de téléphone;110,00;Chaque mois;110,00;1320,00",
      "Maison et factures;Diffusion en continu et abonnements en ligne;35,00;Chaque mois;35,00;420,00",
      "Maison et factures;Frais bancaires;17,00;Chaque mois;17,00;204,00",
      "Maison et factures;Préparation de la déclaration de revenus;150,00;Chaque année;12,50;150,00",
      "Déplacements;Paiements de voiture;430,00;Chaque mois;430,00;5160,00",
      "Déplacements;Assurance auto;175,00;Chaque mois;175,00;2100,00",
      "Déplacements;Essence ou recharge;60,00;Chaque semaine;260,00;3120,00",
      "Déplacements;Transport en commun;156,00;Chaque mois;156,00;1872,00",
      "Déplacements;Plaques et immatriculation;120,00;Chaque année;10,00;120,00",
      "Vie quotidienne;Épicerie;210,00;Chaque semaine;910,00;10920,00",
      "Vie quotidienne;Restaurants et commandes à emporter;70,00;Chaque semaine;303,33;3640,00",
      "Vie quotidienne;Vêtements;150,00;Chaque mois;150,00;1800,00",
      "Vie quotidienne;Coupes de cheveux;60,00;Chaque mois;60,00;720,00",
      "Vie quotidienne;Soins dentaires;400,00;Chaque année;33,33;400,00",
      "Famille, loisirs et dons;Famille, loisirs et dons (total approximatif);450,00;Chaque mois;450,00;5400,00",
      "Paiements de dettes;Solde de carte de crédit;300,00;Chaque mois;300,00;3600,00",
      "Paiements de dettes;Paiements de prêt étudiant;240,00;Chaque mois;240,00;2880,00",
      "",
      ";Revenu total;;;8666,67;104000,00",
      ";Total prévu;;;6795,17;81542,00",
      ";Reste;;;1871,50;22458,00",
    ]);
  });

  it("skips empty and zero amounts and writes a shortfall as a positive amount", () => {
    const budget: Budget = emptyBudget();
    budget.rows.income.push({ kind: "catalog", id: "gigIncome", amount: 100, frequency: "Monthly" });
    budget.rows.home.push(
      { kind: "catalog", id: "rent", amount: 1000.5, frequency: "Monthly" },
      { kind: "catalog", id: "electricity", amount: null, frequency: "Monthly" },
      { kind: "catalog", id: "internet", amount: 0, frequency: "Monthly" },
    );

    expect(lines(budgetCsv(EN, budget))).toEqual([
      "Section,Item,Amount,Frequency,Monthly,Yearly",
      "Income,Side or gig income,100.00,Monthly,100.00,1200.00",
      "Home and bills,Rent,1000.50,Monthly,1000.50,12006.00",
      "",
      ",Total income,,,100.00,1200.00",
      ",Total planned,,,1000.50,12006.00",
      ",Shortfall,,,900.50,10806.00",
    ]);
  });

  it("escapes custom names a spreadsheet would run as formulas", () => {
    const budget: Budget = emptyBudget();
    budget.rows.everyday.push(
      { kind: "custom", id: "c_aaaaaaaaaa", label: '=HYPERLINK("x")', amount: 5, frequency: "Monthly" },
      { kind: "custom", id: "c_bbbbbbbbbb", label: "  ", amount: 1, frequency: "Monthly" },
    );

    const [, formula, unnamed] = lines(budgetCsv(EN, budget));
    expect(formula).toBe(`Everyday living,"'=HYPERLINK(""x"")",5.00,Monthly,5.00,60.00`);
    expect(unnamed).toBe("Everyday living,Your item,1.00,Monthly,1.00,12.00");
  });
});
