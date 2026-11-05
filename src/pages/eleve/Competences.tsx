import { Link, useSearchParams } from 'react-router-dom';
import { Info, SearchX } from 'lucide-react';
import { META_COMPETENCES, PARTS, UNITS, getUnit, outcomesOfMeta, unitLabel, unitsOfMeta } from '../../content';
import { distribution } from '../../domain/progress';
import type { MetaCompetenceId, PartId } from '../../domain/types';
import { Button, DataModeTag, EmptyState, FilterGroup, MasteryChip, MasteryLegend, MasteryStack, UnitTag } from '../../components/ui';
import { PART_THEME, cx } from '../../lib/theme';
import { useStudentView } from '../../state/useStudentView';

type PartFilter = 'toutes' | PartId;
const MC_COLOR: Record<MetaCompetenceId, PartId> = { mc1: 'p1', mc2: 'p2', mc3: 'p3' };

export function Competences() {
  const v = useStudentView();
  const [params, setParams] = useSearchParams();
  const partie = (['toutes', 'p1', 'p2', 'p3'].includes(params.get('partie') ?? '') ? params.get('partie') : 'toutes') as PartFilter;
  const dossier = getUnit(params.get('dossier') ?? '')?.id ?? 'tous';
  const mcFocus = params.get('mc') as MetaCompetenceId | null;

  const update = (patch: Record<string, string | null>) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, val]) => (val === null ? next.delete(k) : next.set(k, val)));
    setParams(next, { replace: true });
  };

  const unitOptions = UNITS.filter((u) => partie === 'toutes' || u.partId === partie);

  const blocks = META_COMPETENCES.filter((m) => !mcFocus || m.id === mcFocus)
    .map((m) => {
      const refs = outcomesOfMeta(m.id).filter(
        (r) => (partie === 'toutes' || r.unit.partId === partie) && (dossier === 'tous' || r.unit.id === dossier),
      );
      return { meta: m, refs };
    })
    .filter((b) => b.refs.length > 0);

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Mes compétences</p>
        <h1 className="text-[2rem] font-extrabold sm:text-[2.4rem]">Suivi de la maîtrise</h1>
        <p className="max-w-2xl text-ink-2">
          Trois méta-compétences, déclinées en résultats attendus. Chaque résultat reçoit un niveau de 1 à 4, ou reste « Non évalué » tant qu’aucune
          évaluation n’a eu lieu.
        </p>
      </header>

      <MasteryLegend />

      <div className="flex gap-3 rounded-2xl border border-line bg-tag-soft p-4 text-[0.9rem]">
        <Info className="mt-0.5 size-5 shrink-0" aria-hidden />
        <p>
          Seul ton professeur valide un niveau de maîtrise. La plateforme pourra proposer un niveau <em>indicatif</em>, mais un score de quiz ne suffit
          jamais à prouver une compétence professionnelle.
        </p>
      </div>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
        <FilterGroup<PartFilter>
          label="Filtrer par partie"
          value={partie}
          onChange={(x) => update({ partie: x === 'toutes' ? null : x, dossier: null })}
          options={[
            { value: 'toutes', label: 'Toutes les parties' },
            ...PARTS.map((p) => ({ value: p.id as PartFilter, label: `Partie ${p.number}`, dot: PART_THEME[p.id].bg })),
          ]}
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="f-dossier" className="text-[0.9rem] font-bold">
              Dossier
            </label>
            <select
              id="f-dossier"
              value={dossier}
              onChange={(e) => update({ dossier: e.target.value === 'tous' ? null : e.target.value })}
              className="min-h-10 max-w-[min(100%,26rem)] rounded-full border border-line-2 bg-white px-4 text-[0.9rem] font-bold"
            >
              <option value="tous">Tous les dossiers</option>
              {unitOptions.map((u) => (
                <option key={u.id} value={u.id}>
                  {unitLabel(u)} — {u.title}
                </option>
              ))}
            </select>
            {mcFocus && (
              <Button variant="ghost" className="min-h-10 px-3 text-[0.85rem]" onClick={() => update({ mc: null })}>
                Afficher les 3 méta-compétences
              </Button>
            )}
          </div>
          <DataModeTag mode={v.mode} />
        </div>
      </div>

      {blocks.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="Aucun résultat attendu pour ce filtre"
          action={
            <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Réinitialiser
            </Button>
          }
        />
      ) : (
        blocks.map(({ meta, refs }) => {
          const color = MC_COLOR[meta.id];
          const t = PART_THEME[color];
          const d = distribution(refs.map((r) => v.levelOf(r.outcome.id)));
          const contributors = unitsOfMeta(meta.id).filter((u) => (partie === 'toutes' || u.partId === partie) && (dossier === 'tous' || u.id === dossier));
          return (
            <section key={meta.id} aria-labelledby={`mc-${meta.id}`} className="card overflow-hidden">
              <div className={cx('flex flex-col gap-4 p-5 sm:p-6', t.bgSoft)}>
                <div className="flex items-start gap-3">
                  <span className={cx('mt-1 size-3.5 shrink-0 rounded-full', t.bg)} aria-hidden />
                  <div className="flex-1">
                    <p className="eyebrow">Méta-compétence</p>
                    <h2 id={`mc-${meta.id}`} className="text-[1.35rem] font-bold">
                      {meta.label}
                    </h2>
                  </div>
                </div>
                <MasteryStack counts={d} label={`Répartition des niveaux — ${meta.label}`} />
                <p className="text-[0.85rem] text-ink-2">
                  {d.total} résultat{d.total > 1 ? 's' : ''} attendu{d.total > 1 ? 's' : ''} · {d.total - d.ne} évalué{d.total - d.ne > 1 ? 's' : ''} ·{' '}
                  {d.l1 + d.l2} à retravailler
                </p>
                <div>
                  <p className="mb-2 text-[0.8rem] font-bold text-ink-3">Dossiers qui y contribuent</p>
                  <ul className="flex flex-wrap gap-1.5">
                    {contributors.map((u) => (
                      <li key={u.id}>
                        <Link to={`/dossiers/${u.id}`} title={u.title} className="inline-block transition-transform hover:-translate-y-0.5">
                          <UnitTag unit={u} />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <ul className="divide-y divide-line">
                {refs.map(({ outcome, unit }) => {
                  const a = v.assessmentOf(outcome.id);
                  return (
                    <li key={outcome.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
                      <Link to={`/dossiers/${unit.id}`} className="shrink-0" aria-label={`${unitLabel(unit)} : ${unit.title}`}>
                        <UnitTag unit={unit} />
                      </Link>
                      <p className="flex-1 text-[0.97rem]">
                        {outcome.text}
                        {outcome.metaCompetenceIds.length > 1 && (
                          <span className="mt-1 block text-[0.78rem] text-ink-3">Contribue aussi à une autre méta-compétence</span>
                        )}
                      </p>
                      <MasteryChip value={a?.level ?? null} origin={a?.origin} />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })
      )}
    </div>
  );
}
