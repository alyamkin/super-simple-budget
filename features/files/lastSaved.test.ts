/** @jest-environment node */
import { en } from "@/i18n/dictionaries/en";
import { fr } from "@/i18n/dictionaries/fr";
import { createTranslator } from "@/i18n/translate";
import { lastSavedText, localDay } from "./lastSaved";

const { t } = createTranslator("en", en);
const at = (day: number, hour: number) => new Date(2026, 9, day, hour).getTime();
const today = localDay(at(22, 9));

describe("lastSavedText", () => {
  it("says when nothing was saved yet", () => {
    expect(lastSavedText(t, null, today)).toBe("Not saved to a file yet");
  });

  it("counts calendar days, not 24-hour periods", () => {
    expect(lastSavedText(t, at(22, 0), today)).toBe("Last saved to a file: today");
    expect(lastSavedText(t, at(21, 23), today)).toBe(
      "Last saved to a file: yesterday",
    );
    expect(lastSavedText(t, at(19, 12), today)).toBe(
      "Last saved to a file: 3 days ago",
    );
  });

  it("treats a save dated in the future as today", () => {
    expect(lastSavedText(t, at(25, 9), today)).toBe("Last saved to a file: today");
  });

  it("is translated", () => {
    expect(lastSavedText(createTranslator("fr", fr).t, at(20, 9), today)).toBe(
      "Dernier enregistrement dans un fichier : il y a 2 jours",
    );
  });
});
