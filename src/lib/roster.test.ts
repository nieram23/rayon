import { describe, expect, it } from 'vitest';
import * as XLSX from 'xlsx';
import { buildRoster, credentialsWorkbook, detectColumns, readRosterFile } from './roster';

const csvFile = (text: string, name = 'liste.csv', encoding: 'utf8' | 'latin1' = 'utf8') =>
  new File([encoding === 'utf8' ? new TextEncoder().encode(text) : Uint8Array.from([...text].map((c) => c.charCodeAt(0)))], name, { type: 'text/csv' });

describe('import de liste', () => {
  it('lit un CSV « Nom;Prénom;Classe » et forme initiale.nom', async () => {
    const rows = await readRosterFile(csvFile('Nom;Prénom;Classe\nMARTIN;Léa;1MCVA\nPetit;Noah;1MCVA\nMartin;Lucas;1MCVB\n'));
    const cols = detectColumns(rows);
    expect(cols).toMatchObject({ headerRow: 0, last: 0, first: 1, cls: 2, combined: false });
    const r = buildRoster(rows, cols, '', new Set());
    expect(r.map((x) => x.username)).toEqual(['l.martin', 'n.petit', 'l.martin2']);
    expect(r[0]).toMatchObject({ firstName: 'Léa', lastName: 'Martin', classLabel: '1MCVA' });
    expect(r.every((x) => /^[a-z2-9]{6}$/.test(x.password))).toBe(true);
  });

  it('lit un export « Élève » au format NOM Prénom, encodé en Windows-1252', async () => {
    const rows = await readRosterFile(csvFile('Élève;Classe\nDUPONT Inès;1MCV\nLE GALL Anne Sophie;1MCV\n', 'export.csv', 'latin1'));
    const cols = detectColumns(rows);
    expect(cols.combined).toBe(true);
    const r = buildRoster(rows, cols, '', new Set(['i.dupont']));
    expect(r.map((x) => x.username)).toEqual(['i.dupont2', 'a.le-gall']);
    expect(r[1]).toMatchObject({ firstName: 'Anne Sophie', lastName: 'Le Gall', classLabel: '1MCV' });
  });

  it('lit un fichier Excel et applique la classe par défaut', async () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ['Prénom', 'Nom'],
      ['Jade', 'Moreau'],
      ['Élodie', 'Bernard-Roux'],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Feuil1');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
    const rows = await readRosterFile(new File([buf], 'classe.xlsx'));
    const r = buildRoster(rows, detectColumns(rows), 'Tle MCV A', new Set());
    expect(r.map((x) => [x.username, x.classLabel])).toEqual([
      ['j.moreau', 'Tle MCV A'],
      ['e.bernard-roux', 'Tle MCV A'],
    ]);
  });

  it('sans en-tête : colonne A = nom, colonne B = prénom', async () => {
    const rows = await readRosterFile(csvFile('Martin,Léa\nPetit,Noah\n'));
    const cols = detectColumns(rows);
    expect(cols.headerRow).toBe(-1);
    expect(buildRoster(rows, cols, 'X', new Set()).map((x) => x.username)).toEqual(['l.martin', 'n.petit']);
  });

  it('exporte les identifiants en Excel', async () => {
    const blob = await credentialsWorkbook([{ classLabel: '1MCVA', firstName: 'Léa', lastName: 'Martin', displayName: 'Léa Martin', username: 'l.martin', password: 'k7m4tp' }]);
    const wb = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
    const rows = XLSX.utils.sheet_to_json<string[]>(wb.Sheets.Identifiants, { header: 1 });
    expect(rows[0]).toEqual(['Classe', 'Nom', 'Prénom', 'Identifiant', 'Mot de passe']);
    expect(rows[1]).toEqual(['1MCVA', 'Martin', 'Léa', 'l.martin', 'k7m4tp']);
  });
});
