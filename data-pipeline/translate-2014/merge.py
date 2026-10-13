# Запись перевода: python3 merge.py file.json [...] — {ключ: русский текст}, статус draft.
import csv, glob, json, sys
tr = {}
for p in sys.argv[1:]:
    tr.update(json.load(open(p, encoding='utf-8-sig')))
used = set()
for f in sorted(glob.glob('data-pipeline/translations-2014/*.csv')):
    rows = list(csv.reader(open(f, encoding='utf-8-sig')))
    head = rows[0]
    k, ru, st = head.index('key'), head.index('ru'), head.index('status')
    changed = 0
    for r in rows[1:]:
        if r[k] in tr and not r[ru].strip():
            r[ru] = tr[r[k]]; r[st] = 'draft'; used.add(r[k]); changed += 1
    if changed:
        with open(f, 'w', encoding='utf-8-sig', newline='') as out:
            csv.writer(out, lineterminator='\n').writerows(rows)
    print(f, changed)
missing = set(tr) - used
if missing: print('НЕ ЗАПИСАНО (нет ключа или уже переведено):', sorted(missing)[:20], len(missing))

# Одинаковый английский текст — один перевод: заполняем пустые строки по уже переведённым.
files = sorted(glob.glob('data-pipeline/translations-2014/*.csv'))
tables = {f: list(csv.reader(open(f, encoding='utf-8-sig'))) for f in files}
by_en = {}
for rows in tables.values():
    h = rows[0]; e, ru = h.index('en'), h.index('ru')
    for r in rows[1:]:
        if r[ru].strip(): by_en.setdefault(r[e], r[ru])
for f, rows in tables.items():
    h = rows[0]; e, ru, st = h.index('en'), h.index('ru'), h.index('status')
    n = 0
    for r in rows[1:]:
        if not r[ru].strip() and r[e] in by_en:
            r[ru] = by_en[r[e]]; r[st] = 'draft'; n += 1
    if n:
        with open(f, 'w', encoding='utf-8-sig', newline='') as out:
            csv.writer(out, lineterminator='\n').writerows(rows)
        print('по совпадению текста:', f, n)
