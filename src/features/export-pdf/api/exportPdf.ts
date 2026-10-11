// Экспорт листа в PDF: HTML → PDF (expo-print) → файл с именем персонажа → «Поделиться» (expo-sharing).

import { File, Paths } from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

import type { Character } from '@/entities/character/model/types';
import { content } from '@/shared/content/content';
import { PDF_FONT_CSS } from '../config/fonts.generated';
import { characterSheetHtml } from '../model/sheetHtml';

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
  // В Expo Go «Поделиться» может читать только папки приложения, а печать кладёт файл в чужую папку
  // (Not allowed to read file under given url). Поэтому берём содержимое PDF и сами пишем файл в кэш приложения.
  const { base64 } = await Print.printToFileAsync({ html, ...A4, base64: true, margins: { left: 0, right: 0, top: 0, bottom: 0 } });
  if (!base64) throw new Error('Печать не вернула содержимое PDF.');
  const target = new File(Paths.cache, pdfFileName(c.name));
  if (target.exists) target.delete();
  target.create();
  target.write(base64, { encoding: 'base64' });

  if (!(await Sharing.isAvailableAsync())) throw new Error('На этом устройстве нельзя поделиться файлом.');
  await Sharing.shareAsync(target.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: c.name || 'Лист персонажа' });
}
