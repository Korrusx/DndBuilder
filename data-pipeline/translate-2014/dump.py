# Выгрузка непереведённых строк 2014: python3 dump.py <regex по ключу> [макс. символов]
import csv, glob, json, re, sys
pat = re.compile(sys.argv[1])
rows = []
for f in sorted(glob.glob('data-pipeline/translations-2014/*.csv')):
    for r in csv.DictReader(open(f, encoding='utf-8-sig')):
        if not r['ru'].strip() and pat.search(r['key']):
            rows.append((r['key'], r['en']))
print(json.dumps(dict(rows), ensure_ascii=False, indent=0))
print(len(rows), sum(len(e) for _, e in rows), file=sys.stderr)
