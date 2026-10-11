// Экспорт листа в PDF: HTML → PDF (expo-print) → файл с именем персонажа → «Поделиться» (expo-sharing).

import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import { content } from '@/content';
import type { Character } from '@/rules/character';
import { PDF_FONT_CSS } from './fonts.generated';
import { characterSheetHtml } from './sheetHtml';

/** A4 в пунктах (1/72 дюйма). */
const A4 = { width: 595, height: 842 };

/** Имя файла без символов, запрещённых в именах файлов. */
export function pdfFileName(name: string): string {
  const safe = name.replace(/[\\/:*?"<>|\n\r\t]+/g, ' ').trim().slice(0, 60);
  return `${safe || 'Персонаж'}.pdf`;
}

/** Собирает PDF листа и открывает системное окно «Поделиться» (сохранить, отправить, распечатать). */
export async function exportCharacterPdf(c: Character): Promise<void> {
  const html = characterSheetHtml(c, content, PDF_FONT_CSS);
  const { uri } = await Print.printToFileAsync({ html, ...A4, margins: { left: 0, right: 0, top: 0, bottom: 0 } });

  // У файла от printToFileAsync случайное имя — переименовываем копией в кэш.
  let shareUri = uri;
  try {
    const target = new File(Paths.cache, pdfFileName(c.name));
    if (target.exists) target.delete();
    new File(uri).moveSync(target);
    shareUri = target.uri;
  } catch {
    // Не получилось переименовать — делимся файлом как есть.
  }

  if (!(await Sharing.isAvailableAsync())) throw new Error('На этом устройстве нельзя поделиться файлом.');
  await Sharing.shareAsync(shareUri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: c.name || 'Лист персонажа' });
}
