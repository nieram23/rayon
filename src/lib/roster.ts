/**
 * Import d'une liste d'élèves depuis un fichier CSV ou tableur (Excel, LibreOffice).
 * Repère automatiquement les colonnes Prénom, Nom et Classe ; l'administrateur peut corriger.
 */
import { generatePassword, parseStudentLine, suggestUsername, uniqueUsername } from './accounts';

export interface RosterColumns {
  /** Ligne d'en-tête (-1 s'il n'y en a pas). */
  headerRow: number;
  first: number;
  last: number;
  cls: number;
  /** Prénom et nom dans la même colonne (« MARTIN Léa »), indiquée par `last`. */
  combined: boolean;
}

export interface RosterEntry {
  firstName: string;
  lastName: string;
  classLabel: string;
  username: string;
  password: string;
}

const norm = (v: unknown) =>
  String(v ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();

/** Lit un fichier en tableau de lignes (cellules texte). */
export async function readRosterFile(file: File): Promise<string[][]> {
  const XLSX = await import('xlsx');
  const buf = new Uint8Array(await file.arrayBuffer());
  const isText = /\.(csv|txt|tsv)$/i.test(file.name) || file.type.startsWith('text/');
  let wb;
  if (isText) {
    // Les exports de vie scolaire sont souvent en Windows-1252 : on essaie UTF-8 d'abord.
    let text: string;
    try {
      text = new TextDecoder('utf-8', { fatal: true }).decode(buf);
    } catch {
      text = new TextDecoder('windows-1252').decode(buf);
    }
    wb = XLSX.read(text.replace(/^﻿/, ''), { type: 'string', raw: true });
  } else {
    wb = XLSX.read(buf, { type: 'array' });
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '', raw: false, blankrows: false });
  return rows.map((r) => r.map((c) => String(c ?? '').trim())).filter((r) => r.some((c) => c));
}

/** Devine les colonnes à partir des en-têtes ; à défaut, Nom puis Prénom. */
export function detectColumns(rows: string[][]): RosterColumns {
  for (let i = 0; i < Math.min(rows.length, 10); i++) {
    const cells = rows[i].map(norm);
    const first = cells.findIndex((c) => /^(prenom|prenoms|first ?name|given name)/.test(c));
    const last = cells.findIndex((c, j) => j !== first && /^(nom|nom de famille|last ?name|surname|family name)\b/.test(c) && !/prenom/.test(c));
    const cls = cells.findIndex((c) => /^(classe|division|groupe|class)\b/.test(c));
    const combinedCol = cells.findIndex((c) => /^(eleve|eleves|nom ?(et|\/)? ?prenom|nom prenom|nom - prenom|identite)/.test(c));
    if (first >= 0 && last >= 0) return { headerRow: i, first, last, cls, combined: false };
    if (combinedCol >= 0) return { headerRow: i, first: -1, last: combinedCol, cls, combined: true };
    if (last >= 0 && first < 0) return { headerRow: i, first: -1, last, cls, combined: true };
  }
  const width = Math.max(...rows.map((r) => r.length), 0);
  if (width >= 2) return { headerRow: -1, first: 1, last: 0, cls: width >= 3 ? 2 : -1, combined: false };
  return { headerRow: -1, first: -1, last: 0, cls: -1, combined: true };
}

/** Libellés des colonnes pour les menus de correspondance. */
export function columnLabels(rows: string[][], headerRow: number): string[] {
  const width = Math.max(...rows.map((r) => r.length), 0);
  return Array.from({ length: width }, (_, i) => {
    const letter = String.fromCharCode(65 + (i % 26));
    const h = headerRow >= 0 ? rows[headerRow][i] : '';
    return h ? `${letter} · ${h}` : `Colonne ${letter}`;
  });
}

const title = (s: string) =>
  s
    .toLowerCase()
    .replace(/(^|[\s-])\p{L}/gu, (m) => m.toUpperCase());

/** Construit la liste des comptes à créer (identifiants uniques, mots de passe de 6 caractères). */
export function buildRoster(rows: string[][], cols: RosterColumns, defaultClass: string, taken: Set<string>): RosterEntry[] {
  const used = new Set(taken);
  const out: RosterEntry[] = [];
  rows.forEach((r, i) => {
    if (i <= cols.headerRow) return;
    let firstName = '';
    let lastName = '';
    if (cols.combined) {
      const p = parseStudentLine(r[cols.last] ?? '');
      if (!p) return;
      firstName = p.firstName;
      lastName = p.lastName;
    } else {
      firstName = (r[cols.first] ?? '').trim();
      lastName = (r[cols.last] ?? '').trim();
    }
    if (!firstName && !lastName) return;
    // Nom en capitales dans les exports : présentation soignée sur les fiches.
    if (lastName === lastName.toUpperCase()) lastName = title(lastName);
    if (firstName === firstName.toUpperCase()) firstName = title(firstName);
    const username = uniqueUsername(suggestUsername(firstName, lastName), used);
    used.add(username);
    const classLabel = (cols.cls >= 0 ? (r[cols.cls] ?? '').trim() : '') || defaultClass.trim();
    out.push({ firstName, lastName, classLabel, username, password: generatePassword() });
  });
  return out;
}

/** Fichier Excel des identifiants (une ligne par élève, trié par classe puis nom). */
export async function credentialsWorkbook(list: Array<{ classLabel: string; firstName?: string; lastName?: string; displayName: string; username: string; password: string }>): Promise<Blob> {
  const XLSX = await import('xlsx');
  const sorted = [...list].sort((a, b) => a.classLabel.localeCompare(b.classLabel, 'fr') || (a.lastName ?? a.displayName).localeCompare(b.lastName ?? b.displayName, 'fr'));
  const data = sorted.map((c) => ({
    Classe: c.classLabel,
    Nom: c.lastName ?? '',
    Prénom: c.firstName ?? (c.lastName ? '' : c.displayName),
    Identifiant: c.username,
    'Mot de passe': c.password,
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  ws['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 18 }, { wch: 22 }, { wch: 14 }];
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Identifiants');
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer;
  return new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
