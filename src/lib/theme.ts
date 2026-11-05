import type { MasteryValue, PartId } from '../domain/types';

/** Classes Tailwind statiques par partie (Tailwind doit voir les noms complets). */
export const PART_THEME: Record<
  PartId,
  { bg: string; bgSoft: string; text: string; textDark: string; border: string; ring: string; tag: string; bar: string; name: string }
> = {
  p1: {
    bg: 'bg-p1',
    bgSoft: 'bg-p1-soft',
    text: 'text-p1',
    textDark: 'text-p1-dark',
    border: 'border-p1',
    ring: 'ring-p1',
    tag: 'bg-p1 text-white',
    bar: 'bg-p1',
    name: 'Réserve',
  },
  p2: {
    bg: 'bg-p2',
    bgSoft: 'bg-p2-soft',
    text: 'text-p2',
    textDark: 'text-p2-dark',
    border: 'border-p2',
    ring: 'ring-p2',
    tag: 'bg-p2 text-white',
    bar: 'bg-p2',
    name: 'Vitrine',
  },
  p3: {
    bg: 'bg-p3',
    bgSoft: 'bg-p3-soft',
    text: 'text-p3',
    textDark: 'text-p3-dark',
    border: 'border-p3',
    ring: 'ring-p3',
    tag: 'bg-p3 text-white',
    bar: 'bg-p3',
    name: 'Clientèle',
  },
};

export const MASTERY_THEME: Record<'NE' | '1' | '2' | '3' | '4', { bg: string; text: string; soft: string }> = {
  NE: { bg: 'bg-m0', text: 'text-ink-3', soft: 'bg-white border border-dashed border-line-2' },
  '1': { bg: 'bg-m1', text: 'text-m1', soft: 'bg-m1/10' },
  '2': { bg: 'bg-m2', text: 'text-[#9a6210]', soft: 'bg-m2/15' },
  '3': { bg: 'bg-m3', text: 'text-[#4b7d2c]', soft: 'bg-m3/15' },
  '4': { bg: 'bg-m4', text: 'text-m4', soft: 'bg-m4/12' },
};

export function masteryCode(v: MasteryValue): 'NE' | '1' | '2' | '3' | '4' {
  return v === null ? 'NE' : (String(v) as '1');
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}

export function formatDate(iso?: string): string {
  if (!iso) return '—';
  try {
    return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(new Date(iso));
  } catch {
    return iso.slice(0, 10);
  }
}

export function pct(r: number): string {
  return `${Math.round(r * 100)} %`;
}
