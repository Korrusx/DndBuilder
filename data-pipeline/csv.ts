// Чтение и запись CSV (RFC 4180): поля в кавычках, переносы строк и кавычки внутри полей.
// Файлы пишутся в UTF-8 с BOM, чтобы Excel правильно показывал кириллицу.

const BOM = '﻿';

export function parseCsv(text: string): string[][] {
  if (text.startsWith(BOM)) text = text.slice(1);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      quoted = true;
    } else if (ch === ',') {
      row.push(field);
      field = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += ch;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 1 || r[0] !== '');
}

function escapeField(value: string): string {
  return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function stringifyCsv(rows: string[][]): string {
  return BOM + rows.map((r) => r.map(escapeField).join(',')).join('\n') + '\n';
}
