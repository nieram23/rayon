import type { Activity, ActivityAnswer, AnswerValue, Chapter } from './chapter';

/** Lit un nombre saisi à la française : « 1 046,64 € », « 18.69 », « 1,5 % ». */
export function parseNumber(raw: AnswerValue | undefined): number | null {
  if (typeof raw !== 'string') return null;
  const s = raw.replace(/[\s €%]/g, '').replace(',', '.');
  if (!/^-?\d+(\.\d+)?$/.test(s)) return null;
  return Number(s);
}

/** Comparaison tolérante des réponses courtes : casse, accents, ponctuation, espaces. */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`.,;:!?()«»"-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace('.', ',');
}

export interface ItemResult {
  ok: boolean;
  label: string;
  /** Réponse non renseignée. */
  empty: boolean;
  expected: string;
  explain: string;
}

export interface CheckResult {
  items: Record<string, ItemResult>;
  correct: number;
  total: number;
}

/** Activité vérifiable automatiquement de façon fiable ? (les productions ouvertes ne le sont pas) */
export function isAutoCheckable(a: Activity): boolean {
  return a.kind !== 'open';
}

export function checkActivity(a: Activity, values: Record<string, AnswerValue>): CheckResult {
  const items: Record<string, ItemResult> = {};
  const add = (key: string, label: string, ok: boolean, empty: boolean, expected: string, explain: string) => {
    items[key] = { ok, label, empty, expected, explain };
  };

  switch (a.kind) {
    case 'fields':
      for (const f0 of a.fields) {
        const col = a.layout === 'columns' && a.columns && f0.id.includes('.') ? a.columns[Number(f0.id.split('.')[1])] : undefined;
        const f = col ? ({ ...f0, label: `${f0.label} — ${col}` } as typeof f0) : f0;
        const v = values[f.id];
        if (f.kind === 'given' || f.kind === 'written') continue;
        if (f.kind === 'number') {
          const n = parseNumber(v);
          add(f.id, f.label, n !== null && Math.abs(n - f.answer) <= (f.tolerance ?? 0.001), n === null, `${formatNumber(f.answer)}${f.unit ? ' ' + f.unit : ''}`, f.explain);
        } else if (f.kind === 'text') {
          const got = normalize(typeof v === 'string' ? v : '');
          add(f.id, f.label, !!got && f.accept.some((x) => normalize(x) === got), !got, f.accept[0], f.explain);
        } else if (f.kind === 'choice') {
          add(f.id, f.label, v === f.answer, !v, f.options.find((o) => o.value === f.answer)?.label ?? f.answer, f.explain);
        } else {
          const got = Array.isArray(v) ? [...v].sort() : [];
          const exp = [...f.answers].sort();
          add(
            f.id,
            f.label,
            got.length === exp.length && got.every((x, i) => x === exp[i]),
            got.length === 0,
            f.options.filter((o) => f.answers.includes(o.value)).map((o) => o.label).join(' + '),
            f.explain,
          );
        }
      }
      break;
    case 'classify':
      for (const it of a.items) {
        const v = values[it.id];
        add(it.id, it.text, v === it.answer, !v, (() => { const c = a.categories.find((x) => x.id === it.answer); return c ? `${c.group ? c.group + ' — ' : ''}${c.label}` : ''; })(), it.explain);
      }
      break;
    case 'circuit':
      for (const c of a.circuits) {
        const t = values[`${c.id}.type`];
        add(`${c.id}.type`, `Circuit ${c.id} — type de canal`, t === c.typeAnswer, !t, c.typeOptions.find((o) => o.value === c.typeAnswer)?.label ?? '', c.explain);
        for (const s of c.slots) {
          if (s.fixed || !s.answer) continue;
          const v = values[`${c.id}.${s.id}`];
          add(`${c.id}.${s.id}`, `Circuit ${c.id} — maillon ${s.id}`, v === s.answer, !v, c.slotOptions.find((o) => o.value === s.answer)?.label ?? '', c.explain);
        }
      }
      break;
    case 'grid':
      const cols = a.groups.flatMap((g) => g.columns.map((c) => `${g.label} ${c}`));
      for (const r of a.rows)
        r.cells.forEach((cell, i) => {
          if (typeof cell !== 'object') return;
          const key = `${r.id}.${i}`;
          const n = parseNumber(values[key]);
          add(key, `${r.label} · ${cols[i]}`, n !== null && Math.abs(n - cell.answer) <= (cell.tolerance ?? 0.0001), n === null, formatNumber(cell.answer), cell.explain);
        });
      break;
    case 'planning': {
      const SYM = { commande: 'date de commande', prevue: 'date prévisionnelle', effective: 'livraison effective', relance: 'relance' };
      const placed = new Set(Array.isArray(values.__marks) ? (values.__marks as string[]) : []);
      const expectedKeys = new Set<string>();
      for (const r of a.rows)
        for (const e of r.expected) {
          const k = `${r.id}|${e.day}|${e.symbol}`;
          expectedKeys.add(k);
          const day = a.days.find((d) => d.id === e.day);
          add(k, `Commande ${r.label} — ${SYM[e.symbol]}`, placed.has(k), placed.size === 0, `${SYM[e.symbol]} le ${day?.num ?? e.day}`, e.explain);
        }
      const extras = [...placed].filter((k) => !expectedKeys.has(k));
      add('__extras', 'Repères en trop', placed.size > 0 && extras.length === 0, placed.size === 0, 'aucun repère en trop', extras.length ? `${extras.length} repère(s) posé(s) sans raison : relis les documents.` : 'Aucun repère inutile.');
      break;
    }
    case 'open':
      break;
  }
  const list = Object.values(items);
  return { items, correct: list.filter((x) => x.ok).length, total: list.length };
}

/** Nombre de réponses rédigées (autocorrigées) d'une activité. */
export function writtenCount(a: Activity): number {
  return a.kind === 'fields' ? a.fields.filter((f) => f.kind === 'written').length : 0;
}

/** Une activité est « accomplie » quand elle a été vérifiée au moins une fois, ou enregistrée (production ouverte). */
export function isDone(a: Activity, ans?: ActivityAnswer): boolean {
  if (!ans) return false;
  return a.kind === 'open' ? !!ans.submitted : ans.attempts > 0;
}

export function allActivities(ch: Chapter): Activity[] {
  return ch.steps.flatMap((s) => s.activities);
}
