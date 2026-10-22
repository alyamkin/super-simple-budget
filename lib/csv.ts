/** Cells that spreadsheets would read as a formula start with one of these. */
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * One CSV cell: text that a spreadsheet would run as a formula
 * gets a leading `'`, and a cell holding the delimiter, a quote or a line
 * break is quoted.
 */
export function csvCell(value: string, delimiter: string): string {
  const text = FORMULA_START.test(value) ? `'${value}` : value;
  return text.includes(delimiter) || /["\n\r]/.test(text)
    ? `"${text.replaceAll('"', '""')}"`
    : text;
}

/** A whole CSV file: UTF-8 BOM (so Excel reads accents), CRLF line ends. */
export function toCsv(
  rows: readonly (readonly string[])[],
  delimiter: string,
): string {
  const lines = rows.map((row) =>
    row.map((cell) => csvCell(cell, delimiter)).join(delimiter),
  );
  return `﻿${lines.join("\r\n")}\r\n`;
}
