/** @jest-environment node */
import { csvCell, toCsv } from "./csv";

describe("csvCell", () => {
  it("leaves plain text alone", () => {
    expect(csvCell("Groceries", ",")).toBe("Groceries");
    expect(csvCell("", ",")).toBe("");
  });

  it.each(["=SUM(A1)", "+1", "-1", "@cmd", "\tx", "\rx"])(
    "stops %j from being read as a formula",
    (value) => {
      expect(csvCell(value, ";")).toMatch(/^"?'/);
    },
  );

  it("quotes cells holding the delimiter, a quote or a line break", () => {
    expect(csvCell("Rent, utilities", ",")).toBe('"Rent, utilities"');
    expect(csvCell("Rent, utilities", ";")).toBe("Rent, utilities");
    expect(csvCell("12,50", ";")).toBe("12,50");
    expect(csvCell("a;b", ";")).toBe('"a;b"');
    expect(csvCell('The "big" one', ",")).toBe('"The ""big"" one"');
    expect(csvCell("two\nlines", ",")).toBe('"two\nlines"');
  });

  it("escapes a formula and then quotes it", () => {
    expect(csvCell('=HYPERLINK("x")', ",")).toBe(`"'=HYPERLINK(""x"")"`);
  });
});

describe("toCsv", () => {
  it("starts with a BOM and ends every line with CRLF", () => {
    expect(toCsv([["a", "b"], [], ["c,d", "e"]], ",")).toBe(
      '﻿a,b\r\n\r\n"c,d",e\r\n',
    );
  });
});
