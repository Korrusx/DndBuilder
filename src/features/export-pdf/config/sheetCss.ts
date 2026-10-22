export const SHEET_CSS = `
@page { size: A4; margin: 0; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 210mm; background: #fff; }
body { font-family: 'SheetText', 'Helvetica Neue', Arial, sans-serif; font-size: 7.6pt; line-height: 1.25; color: #111;
  -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.page { width: 210mm; height: 297mm; padding: 8mm 8mm 6mm; display: flex; flex-direction: column; gap: 2mm;
  overflow: hidden; page-break-after: always; break-after: page; }
.page:last-child { page-break-after: auto; break-after: auto; }
h2, h3, .abname, .lbl, .namebox .v { font-family: 'SheetHead', 'SheetHeadCyr', Georgia, serif; }
.d { color: #1B2A4A; }
.muted { color: #888; font-size: 6.5pt; }
.box { border: 0.3mm solid #111; border-radius: 1.6mm; padding: 1.2mm 1.8mm; }
.box h3 { color: #7B2D26; font-size: 8.6pt; font-weight: 700; letter-spacing: 0.02em; border-bottom: 0.25mm solid #7B2D26;
  margin-bottom: 1mm; padding-bottom: 0.3mm; }
.lbl { color: #7B2D26; font-size: 6.4pt; letter-spacing: 0.03em; }
.hint { color: #666; font-size: 6pt; margin-top: 0.8mm; }
.c { text-align: center; }
.ln { border-bottom: 0.2mm solid #999; height: 4.6mm; }
.ln.short { width: 60%; height: 4mm; }
.ln.inline { flex: 1; height: 3.6mm; }
span.o { display: inline-block; width: 2.6mm; height: 2.6mm; border: 0.25mm solid #111; border-radius: 50%; vertical-align: -0.4mm; flex: none; }
span.o.on { background: #1B2A4A; border-color: #1B2A4A; }
span.o.x { border-radius: 0.5mm; transform: rotate(45deg) scale(0.85); }
span.o.have { border-color: #1B2A4A; border-width: 0.35mm; }
span.o.off { border-style: dotted; border-color: #bbb; }

.hdr { display: flex; gap: 3mm; align-items: flex-end; border-bottom: 0.5mm solid #7B2D26; padding-bottom: 1.5mm; }
.namebox { width: 62mm; }
.namebox .field .v { font-size: 15pt; font-weight: 700; min-height: 7mm; }
.fields { flex: 1; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1mm 3mm; }
.field .v { border-bottom: 0.25mm solid #111; min-height: 4.4mm; font-size: 8.4pt; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.body { flex: 1; display: flex; gap: 2.5mm; min-height: 0; }
.col { display: flex; flex-direction: column; gap: 1.6mm; min-height: 0; }
.left { width: 62mm; }
.right { flex: 1; min-width: 0; }
.grow { flex: 1; min-height: 0; overflow: hidden; }
.pair { display: flex; gap: 1.6mm; }
.pair > * { flex: 1; }

.ab { padding: 1mm 1.6mm 1.2mm; }
.abh { display: flex; align-items: center; gap: 1.5mm; border-bottom: 0.25mm solid #7B2D26; padding-bottom: 0.6mm; margin-bottom: 0.6mm; }
.abname { flex: 1; color: #7B2D26; font-size: 9pt; font-weight: 700; }
.abname .muted { font-family: 'SheetText', sans-serif; font-weight: 400; }
.abmod { font-size: 13pt; font-weight: 600; min-width: 9mm; text-align: center; }
.absc { border: 0.25mm solid #111; border-radius: 3mm; min-width: 8mm; text-align: center; font-size: 8pt; padding: 0 1mm; }
.row { display: flex; align-items: center; gap: 1mm; min-height: 3.8mm; }
.row .num { min-width: 6mm; text-align: right; font-weight: 600; }
.row.save { font-weight: 600; }
.legend { font-size: 6.2pt; color: #666; }

.stats { display: flex; gap: 1.6mm; }
.stat { flex: 1; text-align: center; padding: 1mm 0.8mm; }
.stat .sv { font-size: 12pt; font-weight: 600; min-height: 5.4mm; white-space: nowrap; overflow: hidden; }
.pair .stat .sv { font-size: 11pt; }

.hp { display: flex; gap: 1.6mm; }
.hpgrid { display: flex; gap: 1.6mm; }
.hpcell { flex: 1; text-align: center; }
.hpcell.blank .big { border-bottom: 0.25mm solid #999; }
.big { font-size: 15pt; font-weight: 600; min-height: 7mm; }
.hd { width: 30mm; }
.ds { width: 30mm; }
.ds .row { justify-content: space-between; min-height: 5mm; }

.tbl { width: 100%; border-collapse: collapse; }
.tbl th { color: #7B2D26; font-weight: 400; font-size: 6.4pt; text-align: left; border-bottom: 0.25mm solid #7B2D26; padding: 0.3mm 0.8mm; }
.tbl td { border-bottom: 0.2mm solid #bbb; padding: 0.5mm 0.8mm; height: 4.4mm; }
.tbl th.c, .tbl td.c { text-align: center; }
.sp td { height: 4.2mm; font-size: 7.2pt; }
.sp.dense td { height: 3.5mm; padding: 0.2mm 0.8mm; font-size: 6.6pt; }

.cols2 { column-count: 2; column-gap: 4mm; }
.res { display: flex; justify-content: space-between; align-items: center; gap: 1mm; break-inside: avoid; min-height: 3.8mm; }
.res .marks { display: flex; gap: 0.6mm; flex-wrap: wrap; justify-content: flex-end; }
.pool { white-space: nowrap; }
.flist { list-style: none; column-gap: 4mm; }
.flist li { break-inside: avoid; padding: 0.15mm 0; }
.prof { margin-bottom: 0.5mm; }

.hdr2 { display: flex; align-items: baseline; justify-content: space-between; border-bottom: 0.5mm solid #7B2D26; padding-bottom: 1mm; }
.hdr2 h2 { color: #7B2D26; font-size: 14pt; }
.n2 { font-size: 11pt; font-weight: 600; }
.slots { display: grid; grid-template-columns: repeat(9, 1fr); gap: 1.2mm; }
.slot { text-align: center; padding: 0.8mm; }
.slot .marks { display: flex; justify-content: center; gap: 0.8mm; margin-top: 0.6mm; min-height: 3mm; }
.spells { flex: 1 1 auto; }
.bottom { display: flex; gap: 1.6mm; height: 92mm; }
.bottom > .col { flex: 1; }
.items .item, .box .item { display: flex; align-items: center; gap: 1.2mm; min-height: 4.4mm; border-bottom: 0.2mm solid #ddd; }
.coins { display: flex; gap: 1.2mm; }
.coin { flex: 1; text-align: center; border: 0.25mm solid #111; border-radius: 1.2mm; padding: 0.6mm 0; }
.coin .sv { font-size: 9pt; font-weight: 600; }
.notes { white-space: pre-wrap; }
footer { color: #888; font-size: 6pt; text-align: center; }
`;
