import { describe, expect, it } from 'vitest';
import type { Activity, AnswerValue } from '../../domain/chapter';
import { checkActivity, parseNumber } from '../../domain/check';
import { CHAPTERS } from './index';
import { getUnit } from '../index';
import { CADENCIER_APP2, CADENCIER_M4, D01 } from './d01';
import { computeCadencier } from './cadencier';
import { DATES, PLANNING_DAYS } from './d02';
import { ACCESS, DECHETS, JOURS_KO, ECART_MAX, PAUL_MAX, SITUATIONS, ZONE_PAIRS, ZONE_PRODUCTS, ZONE_TOTAL, bestTool, zonePart } from './d04';
import { CHAUSSURES, PARFUMS, PSY_BOUQUET, PSY_SEL, SEL_PSY, STYLOS, VITRINE, psycho } from './d05';
import { ACC_TOT, FRAIS, SNACK_TOT, TROUSSES_TOT, TROTT_PROMO } from './d06';
import { DEMANDES, RETOURS_APP2, daysBetween } from './d07';
import { BARIL_CAP, LESSIVES, LESSIVE_LIN, MAILLOTS, MUR_CALC } from './d08';
import { ABC, BON, CADENCIER as S1_CAD, PSY_SAC, REAPPRO, RECEPTION } from './s1';
import { COFFRETS_CHOIX, NB_SEGMENTS, VEILLE } from './d11';
import { BF, JOUETS, PERF_TOT, SOIREE, SUPPORTS, INVITES } from './d12';
import { VALIDES_LENT, VALIDES_RAPIDE } from './d13';
import { CASQUE, CHOCOLATS, EVENT_STOCK, GLACES, LEG_SORTED, LINGE, SPORT_SORTED, cumpRow, HYGIENE } from './d03';
import { evaluate } from '../../components/chapter/Calculator';

/** Construit les bonnes réponses d'une activité à partir de sa définition. */
function perfect(a: Activity): Record<string, AnswerValue> {
  const v: Record<string, AnswerValue> = {};
  if (a.kind === 'fields')
    for (const f of a.fields) {
      if (f.kind === 'number') v[f.id] = String(f.answer).replace('.', ',');
      if (f.kind === 'choice') v[f.id] = f.answer;
      if (f.kind === 'text') v[f.id] = f.accept[0];
      if (f.kind === 'multi') v[f.id] = [...f.answers];
    }
  if (a.kind === 'classify') for (const it of a.items) v[it.id] = it.answer;
  if (a.kind === 'circuit')
    for (const c of a.circuits) {
      v[`${c.id}.type`] = c.typeAnswer;
      for (const s of c.slots) if (s.answer) v[`${c.id}.${s.id}`] = s.answer;
    }
  if (a.kind === 'planning') v.__marks = a.rows.flatMap((r) => r.expected.map((e) => `${r.id}|${e.day}|${e.symbol}`));
  if (a.kind === 'grid') for (const r of a.rows) r.cells.forEach((c, i) => typeof c === 'object' && (v[`${r.id}.${i}`] = String(c.answer)));
  return v;
}

describe('chapitres', () => {
  for (const ch of Object.values(CHAPTERS)) {
    const acts = ch.steps.flatMap((s) => s.activities);
    it(`${ch.unitId} : les bonnes réponses obtiennent tous les points`, () => {
      for (const a of acts) {
        if (a.kind === 'open') continue;
        const r = checkActivity(a, perfect(a));
        expect(r.correct, a.id).toBe(r.total);
        const onlyWritten = a.kind === 'fields' && a.fields.every((f) => f.kind === 'written' || f.kind === 'given');
        if (!onlyWritten) expect(r.total, a.id).toBeGreaterThan(0);
        if (a.kind === 'fields') for (const f of a.fields) if (f.kind === 'written') expect(f.model.length, f.id).toBeGreaterThan(20);
      }
    });
    it(`${ch.unitId} : une copie vide n’obtient aucun point`, () => {
      for (const a of acts) if (a.kind !== 'open') expect(checkActivity(a, {}).correct, a.id).toBe(0);
    });
    it(`${ch.unitId} : outcomeIds connus`, () => {
      const u = getUnit(ch.unitId)!;
      const known = new Set([...u.outcomes, ...u.plannedCriteria].map((o) => o.id));
      for (const a of acts) for (const o of a.outcomeIds) expect(known.has(o), `${a.id} → ${o}`).toBe(true);
    });
    it(`${ch.unitId} : identifiants uniques, trois aides par activité`, () => {
      const ids = acts.map((a) => a.id);
      expect(new Set(ids).size).toBe(ids.length);
      for (const a of acts) expect(a.helps).toHaveLength(3);
      const docs = ch.steps.flatMap((s) => s.documents.map((d) => d.id));
      expect(new Set(docs).size).toBe(docs.length);
    });
  }

  it('application 2 : les livraisons du document correspondent aux commandes calculées', () => {
    const doc = D01.steps.find((s) => s.id === 'application-2')!.documents.find((d) => d.id === 'd01-a2-doc2')!;
    const table = doc.blocks.find((b) => b.type === 'table');
    if (!table || table.type !== 'table') throw new Error('table manquante');
    CADENCIER_APP2.forEach((inp, i) => {
      expect(table.rows[i].slice(1).map(Number)).toEqual(computeCadencier(inp).map((w) => w.l));
    });
  });

  it('mission 4 : le bon de livraison S46 correspond aux commandes S45', () => {
    for (const inp of CADENCIER_M4) expect(computeCadencier(inp)[1].l).toBe(inp.firstOrder);
  });

  it('les ventes à déduire ont bien le stock suivant donné', () => {
    for (const inp of [...CADENCIER_M4, ...CADENCIER_APP2])
      for (const b of inp.blanks.filter((x) => x.endsWith('.V'))) {
        const w = Number(b.split('.')[0]);
        const nextGiven = !inp.blanks.includes(`${w + 1}.S`);
        const docGiven = inp.id.startsWith('gm-'); // ventes reportées du document 3
        expect(nextGiven || docGiven, `${inp.id} ${b}`).toBe(true);
      }
  });

  it('d02 : structure et données cohérentes', () => {
    const d02 = CHAPTERS.d02;
    expect(d02.steps.map((s) => s.kind)).toEqual(['ouverture', 'mission', 'mission', 'mission', 'mission', 'mission', 'mission', 'synthese', 'application', 'application', 'application', 'bilan']);
    expect(PLANNING_DAYS).toHaveLength(23);
    expect(PLANNING_DAYS[9]).toMatchObject({ id: 's30', dow: 'M', num: 30 });
    expect(PLANNING_DAYS[10]).toMatchObject({ id: 'o1', dow: 'J', num: 1 });
    // dates : jours restants depuis le 8/10 cohérents avec la décision
    const days = (d: string) => {
      const [j, m] = d.split('/').map(Number);
      return Math.round((Date.UTC(2026, m - 1, j) - Date.UTC(2026, 9, 8)) / 86400000);
    };
    for (const p of DATES) {
      const n = days((p.dlc ?? p.ddm)!);
      const expected = p.dlc ? (n < 0 ? 'retrait' : n <= 3 ? 'don' : n <= 6 ? 'reduit' : 'garder') : n <= 21 ? 'don' : n < 61 ? 'reduit' : 'garder';
      expect(p.answer, p.name).toBe(expected);
    }
  });

  it('d03 : calculs de référence', () => {
    expect(EVENT_STOCK.map((x) => x.commande)).toEqual([8, 0, 4, 9]);
    expect(cumpRow(HYGIENE[0])).toMatchObject({ montant: 58.26, qIn: 8, montantIn: 77.52, total: 135.78, cump: 9.7 });
    expect(CHOCOLATS.map((c) => c.sf)).toEqual([12, 10, 5, 8]);
    expect(CHOCOLATS.map((c) => c.duree)).toEqual([4.09, 22.5, 8, 4.13]);
    expect(LEG_SORTED.slice(0, 4).map((l) => l.name)).toEqual(['Tomates', 'Pommes de terre', 'Carottes', 'Courgettes']);
    expect(LEG_SORTED[3].cumCa).toBeGreaterThan(78);
    expect(LEG_SORTED[3].cumCa).toBeLessThan(82);
    expect(GLACES.map((g) => g.cartons)).toEqual([4, 0, 7, 2, 6]);
    expect(LINGE.map((x) => x.verdict)).toEqual(['rupture', 'surstock', 'ok', 'surstock', 'ok', 'rupture']);
    expect(SPORT_SORTED[1].cumRef).toBeLessThan(21);
    expect(SPORT_SORTED[1].cumVal).toBeGreaterThan(77);
    expect(CASQUE.steps.map((s) => s.q)).toEqual([5, 9, 5, 0, 7, 6, 4, 7, 5]);
    expect(CASQUE.steps[1].cump).toBe(123.78);
    expect(CASQUE.final.cump).toBe(124.43);
    expect(CASQUE.cumpFin).toBe(124.05);
    expect(CASQUE.duree).toBe(10.71);
  });

  it('d04 : calculs et règles de référence', () => {
    expect(ZONE_TOTAL).toBe(52000);
    expect(ZONE_PAIRS.map((z) => z.part)).toEqual([50, 30.77, 19.23]);
    expect(ZONE_PAIRS[1].part).toBeGreaterThanOrEqual(25);
    expect(ZONE_PAIRS[1].part).toBeLessThanOrEqual(35);
    expect(ZONE_PAIRS[2].part).toBeGreaterThanOrEqual(15);
    expect(ZONE_PAIRS[2].part).toBeLessThanOrEqual(25);
    expect(zonePart(21500)).toBe(41.35);
    expect(ZONE_PRODUCTS.map((p) => p.zone).sort()).toEqual([1, 2, 3, 3, 4, 5, 6]);
    for (const s of SITUATIONS) expect(bestTool(s), s.id).toBe(s.answer);
    expect(PAUL_MAX).toBe(12);
    expect(ACCESS.map((a) => a.conforme)).toEqual([false, true, false, true, false]);
    expect(JOURS_KO.map((j) => j.jour)).toEqual([16, 21]);
    expect(ECART_MAX).toBe(4);
    expect(new Set(DECHETS.map((d) => d.answer))).toEqual(new Set(['vert', 'bleu', 'noir', 'decheterie', 'reprise']));
  });

  it('d04 : structure ouverture, 5 missions, synthèse, 3 applications, bilan', () => {
    expect(CHAPTERS.d04.steps.map((s) => s.kind)).toEqual(['ouverture', 'mission', 'mission', 'mission', 'mission', 'mission', 'synthese', 'application', 'application', 'application', 'bilan']);
  });

  it('d05 : calculs de référence', () => {
    expect(PARFUMS.map((p) => p.cr)).toEqual([13.64, 16.05, 15.4, 17.88]);
    expect(PARFUMS.map((p) => p.pvttc)).toEqual([24, 28, 27, 31]);
    // Exemple du manuel : 18 € → A = 2 %, B = 78 %, acheteurs = 20 %.
    const ex = psycho({ prices: [16, 18], tropCher: [0, 1, 49], qualite: [11, 11, 28] }, 0).rows;
    expect([ex[1].A, ex[1].B, ex[1].acheteurs]).toEqual([2, 78, 20]);
    expect(PSY_SEL.best.price).toBe(24);
    expect(PSY_SEL.best.acheteurs).toBe(52);
    expect(PSY_SEL.rows.filter((r) => r.acheteurs === 52)).toHaveLength(1);
    for (const r of PSY_SEL.rows) expect(Math.abs(r.acheteurs - (100 - (r.A + r.B)))).toBeLessThan(0.11);
    for (const r of PSY_BOUQUET.rows) expect(Math.abs(r.acheteurs - (100 - (r.A + r.B)))).toBeLessThan(0.21);
    expect(PSY_BOUQUET.best.price).toBe(27);
    expect(SEL_PSY).toEqual({ pvht: 20, marge: 4.6, taux: 29.87 });
    expect(VITRINE.map((v) => v.prix)).toEqual([25, 28, 23, 34]);
    expect(VITRINE.every((v) => v.marge > 0)).toBe(true);
    expect(CHAUSSURES.map((c) => c.tauxMarge)).toEqual([32.3, 25, 58.87, 61.47, 57.52, 56.1]);
    expect(STYLOS[0]).toMatchObject({ penetration: 494, alignement: 534.67, ecremage: 572.25 });
  });

  it('d06 : calculs de référence', () => {
    expect(SNACK_TOT).toMatchObject({ theo: 224, reel: 213, demarque: 17.9, surmarque: 1.39, nette: 16.51, taux: 1.33 });
    expect(FRAIS.map((f) => f.decision)).toEqual(['retirer', 'retirer', 'retirer', 'promo', 'promo', 'garder', 'garder', 'garder']);
    expect(ACC_TOT.vEcart).toBe(-84.9);
    expect(ACC_TOT.taux).toBe(3.42);
    expect(TROUSSES_TOT).toMatchObject({ ecartHT: -52.2, ecartTTC: -78.3, taux: 3.13 });
    expect(TROTT_PROMO).toBe(103.92);
  });

  it('d07 : décisions de retour', () => {
    expect(daysBetween('10/11', '20/03')).toBe(130);
    expect(daysBetween('12/11', '05/12')).toBe(23);
    expect(DEMANDES.map((d) => [d.motifCode, d.montant])).toEqual([
      ['hors-delai', 0],
      ['hygiene', 0],
      ['commercial', 20],
      ['retractation', 59],
      ['conformite', 79],
      ['porte', 0],
      ['retractation', 25.9],
    ]);
    expect(RETOURS_APP2.map((r) => r.montant)).toEqual([0, 59.9, 155, 0, 0]);
    expect(RETOURS_APP2.map((r) => r.raison)).toEqual(['porte', 'ok', 'ok', 'bon', 'delai']);
  });

  it('d08 : indicateurs de linéaire', () => {
    expect(MUR_CALC).toMatchObject({ sol: 6, ld: 30, hauts: 45, bas: 30, enLongueur: 3, enProfondeur: 26, capMeuble: 390, capMur: 1950 });
    expect(MAILLOTS.rows.map((r) => [r.ca, r.mb, r.rendement, r.rentabilite])).toEqual([
      [1386, 1039.5, 231, 173.25],
      [1632, 1320, 272, 220],
    ]);
    expect(MAILLOTS.rows[0].im).toBeLessThan(1);
    expect(MAILLOTS.rows[1].im).toBeGreaterThan(1);
    expect(LESSIVE_LIN).toEqual({ sol: 2.66, ldMeuble: 6.65, ldTotal: 13.3 });
    expect(BARIL_CAP.total).toBe(12);
    expect(LESSIVES.rows[0].im).toBeLessThan(1);
    expect(LESSIVES.rows[1].im).toBeGreaterThan(1);
    // Les parts d'un linéaire complet totalisent 100 %.
    expect(LESSIVES.rows.reduce((n, r) => n + r.caP, 0)).toBeCloseTo(100, 1);
  });

  it('s1 : calculs du scénario', () => {
    expect(REAPPRO.map((p) => p.qte)).toEqual([10, 6, 0, 0, 10, 8, 18, 12, 0, 8]);
    for (const p of REAPPRO) expect(p.stock + p.qte).toBeLessThanOrEqual(p.max);
    expect(BON.lignes).toHaveLength(9);
    expect(RECEPTION.filter((r) => r.anomalie !== 'conforme').map((r) => r.id)).toEqual(['lea', 'tabbi']);
    expect(S1_CAD[0]).toMatchObject({ ventes: 69, moyen: 16, coef: 4.3, duree: 20.9 });
    expect(ABC.total).toBe(1374);
    expect(ABC.rows.filter((r) => r.classe === 'A')).toHaveLength(6);
    expect(PSY_SAC.n).toBe(80);
    expect(PSY_SAC.rows.filter((r) => r.acheteurs === PSY_SAC.best.acheteurs)).toHaveLength(1);
  });

  it('d11 à d13 : calculs de référence', () => {
    expect(VEILLE.map((v) => v.position)).toEqual(['aligne', 'aligne', 'aligne', 'plus-cher']);
    expect(NB_SEGMENTS).toBe(56);
    expect(new Set(COFFRETS_CHOIX.map((c) => c.univers)).size).toBe(4);
    expect(SUPPORTS.ok).toBe(true);
    for (const j of JOUETS) expect(j.mAction).toBeGreaterThan(0);
    expect(JOUETS.filter((j) => j.mois < j.prevu)).toHaveLength(1);
    expect(PERF_TOT.evolution).toBeGreaterThan(0);
    expect(INVITES.map((c) => c.choix)).toEqual([true, false, false, true]);
    expect(SOIREE).toMatchObject({ envoi: 275, publipostage: 359, organisation: 1190, total: 1549, resultat: 451 });
    expect(BF).toMatchObject({ ca: 464, volume: 14 });
    expect(VALIDES_LENT).toBe(4);
    expect(VALIDES_RAPIDE).toBe(11);
  });

  it('d01 : structure ouverture, 4 missions, synthèse, 2 applications, bilan', () => {
    expect(D01.steps.map((s) => s.kind)).toEqual(['ouverture', 'mission', 'mission', 'mission', 'mission', 'synthese', 'application', 'application', 'bilan']);
  });

  it('d01 : les titres de mission commencent par un verbe d’action', () => {
    const verbs = ['Identifier', 'Établir', 'Préparer', 'Choisir', 'Compléter'];
    for (const s of D01.steps.filter((x) => x.kind === 'mission' || x.kind === 'application'))
      expect(verbs.some((v) => s.title.startsWith(v)), s.title).toBe(true);
  });

  it('d01 : le guidage diminue au fil des missions', () => {
    const order = { guidé: 0, accompagné: 1, autonome: 2 } as const;
    const g = D01.steps.filter((s) => s.kind === 'mission').map((s) => order[s.guidance!]);
    expect([...g].sort()).toEqual(g);
  });

  it('cadenciers : aucun stock négatif, aucune vente supérieure au disponible', () => {
    for (const inp of [...CADENCIER_M4, ...CADENCIER_APP2]) {
      const w = computeCadencier(inp);
      for (const x of w) {
        expect(x.s, inp.id).toBeGreaterThanOrEqual(0);
        expect(x.s + x.l, inp.id).toBeGreaterThanOrEqual(x.v);
        expect(x.c % inp.colisage, inp.id).toBe(0);
      }
    }
  });

  it('cadencier : exemple de l’aide détaillée de la mission 4', () => {
    const w = computeCadencier(CADENCIER_M4[0]);
    expect(w.map((x) => [x.s, x.c, x.l])).toEqual([
      [0, 16, 20],
      [12, 16, 16],
      [8, 8, 16],
      [6, 16, 8],
    ]);
    expect(computeCadencier(CADENCIER_M4[1])[3].c).toBe(40);
  });

  it('calculs commerciaux vérifiés', () => {
    expect(Math.round((29.9 / 1.6) * 100) / 100).toBe(18.69);
    expect(Math.ceil((40 * 1.1 + 6 * 1.5) / 4) * 4).toBe(56);
    expect(58800 * 0.015).toBe(882);
    expect(Math.round((2784 / 185) * 100) / 100).toBe(15.05);
  });

  it('saisie et calculatrice à la française', () => {
    expect(parseNumber('1 046,64 €')).toBe(1046.64);
    expect(parseNumber('1,5 %')).toBe(1.5);
    expect(parseNumber('abc')).toBeNull();
    expect(evaluate('29,90 ÷ 1,6')).toBeCloseTo(18.6875);
    expect(evaluate('(8 + 20) ÷ 2 − 8')).toBe(6);
    expect(evaluate('58800 × 1,5%')).toBe(882);
    expect(evaluate('2+')).toBeNull();
  });
});
