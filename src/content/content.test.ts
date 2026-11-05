import { describe, expect, it } from 'vitest';
import { ALL_OUTCOMES, META_COMPETENCES, PARTS, UNITS, getUnit, outcomesOfMeta } from './index';
import { distribution, statusOf, summarize } from '../domain/progress';
import { CHAPTERS } from './chapters';

/** Intitulés exacts du sommaire (vérification de non-régression). */
const TITLES: Record<string, string> = {
  d01: 'Participer à l’approvisionnement et préparer les commandes',
  d02: 'Réceptionner et contrôler les marchandises',
  d03: 'Gérer les stocks',
  d04: 'Agencer la surface de vente en respectant les règles d’hygiène et de sécurité',
  d05: 'Fixer le prix de vente',
  d06: 'Participer aux opérations d’inventaire',
  d07: 'Gérer les retours et les échanges des clients',
  s1: 'Assurer les opérations préalables à la vente',
  d08: 'Implanter les produits',
  d09: 'Mettre en scène l’offre',
  d10: 'Valoriser l’offre sur les sites marchands et les réseaux sociaux',
  d11: 'Préparer l’action commerciale',
  d12: 'Mener l’action commerciale et évaluer les résultats',
  d13: 'Développer sa clientèle grâce aux canaux digitaux',
  s2: 'Rendre l’unité commerciale attractive et développer la clientèle',
};

describe('programme', () => {
  it('contient 3 parties, 13 dossiers et 2 scénarios', () => {
    expect(PARTS).toHaveLength(3);
    expect(UNITS.filter((u) => u.kind === 'dossier')).toHaveLength(13);
    expect(UNITS.filter((u) => u.kind === 'scenario')).toHaveLength(2);
    expect(META_COMPETENCES).toHaveLength(3);
  });

  it('respecte les intitulés exacts et l’ordre du sommaire', () => {
    expect(UNITS.map((u) => u.id)).toEqual(Object.keys(TITLES));
    for (const [id, title] of Object.entries(TITLES)) expect(getUnit(id)?.title).toBe(title);
  });

  it('répartit les unités dans les bonnes parties', () => {
    const byPart = (p: string) => UNITS.filter((u) => u.partId === p).map((u) => u.id);
    expect(byPart('p1')).toEqual(['d01', 'd02', 'd03', 'd04', 'd05', 'd06', 'd07', 's1']);
    expect(byPart('p2')).toEqual(['d08', 'd09', 'd10']);
    expect(byPart('p3')).toEqual(['d11', 'd12', 'd13', 's2']);
  });

  it('associe les méta-compétences de la grille', () => {
    expect(getUnit('d04')!.metaCompetenceIds).toEqual(['mc2', 'mc1']);
    expect(getUnit('s2')!.metaCompetenceIds).toEqual(['mc2', 'mc3']);
    for (const id of ['d01', 'd02', 'd03', 'd05', 'd06', 'd07', 's1']) expect(getUnit(id)!.metaCompetenceIds).toEqual(['mc1']);
    for (const id of ['d08', 'd09', 'd10']) expect(getUnit(id)!.metaCompetenceIds).toEqual(['mc2']);
    for (const id of ['d11', 'd12', 'd13']) expect(getUnit(id)!.metaCompetenceIds).toEqual(['mc3']);
  });

  it('compte les résultats attendus par unité', () => {
    const counts = Object.fromEntries(UNITS.map((u) => [u.id, u.outcomes.length]));
    expect(counts).toEqual({ d01: 1, d02: 2, d03: 2, d04: 3, d05: 1, d06: 1, d07: 1, s1: 3, d08: 3, d09: 1, d10: 2, d11: 2, d12: 2, d13: 1, s2: 3 });
  });

  it('a des identifiants uniques et stables', () => {
    const ids = ALL_OUTCOMES.map((r) => r.outcome.id);
    expect(new Set(ids).size).toBe(ids.length);
    const skills = UNITS.flatMap((u) => u.skills.map((s) => s.id));
    expect(new Set(skills).size).toBe(skills.length);
  });

  it('distingue les critères ajoutés du dossier 5 de la grille du manuel', () => {
    const d5 = getUnit('d05')!;
    expect(d5.outcomes.every((o) => o.source === 'manuel')).toBe(true);
    expect(d5.plannedCriteria.length).toBeGreaterThan(0);
    expect(d5.plannedCriteria.every((o) => o.source === 'ajout-pedagogique')).toBe(true);
    expect(ALL_OUTCOMES.some((r) => r.outcome.source === 'ajout-pedagogique')).toBe(false);
  });

  it('relie les résultats des scénarios à des résultats existants', () => {
    for (const u of UNITS.filter((x) => x.kind === 'scenario'))
      for (const o of u.outcomes) expect(ALL_OUTCOMES.some((r) => r.outcome.id === o.echoesOutcomeId)).toBe(true);
  });

  it('n’ouvre que les dossiers dont le chapitre existe', () => {
    for (const u of UNITS) expect(u.availability === 'disponible').toBe(!!CHAPTERS[u.id]);
  });

  it('chaque méta-compétence reçoit au moins un résultat', () => {
    for (const m of META_COMPETENCES) expect(outcomesOfMeta(m.id).length).toBeGreaterThan(0);
  });
});

describe('indicateurs', () => {
  it('ne confond pas terminé et maîtrisé', () => {
    const p = { unitId: 'd01', activitiesDone: 6, activitiesTotal: 6, successRate: 30 };
    expect(statusOf(p)).toBe('termine');
    expect(distribution([null]).ne).toBe(1);
  });
  it('résume une progression vide', () => {
    const s = summarize(UNITS, []);
    expect(s).toMatchObject({ started: 0, finished: 0, overall: 0 });
  });
});
