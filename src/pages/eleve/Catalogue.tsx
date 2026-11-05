import { useSearchParams } from 'react-router-dom';
import { SearchX } from 'lucide-react';
import { PARTS, SOURCE_NOTICE, UNITS } from '../../content';
import type { LearningUnit, PartId } from '../../domain/types';
import { UnitCard } from '../../components/UnitCard';
import { Button, DataModeTag, EmptyState, FilterGroup } from '../../components/ui';
import { PART_THEME, cx } from '../../lib/theme';
import { useStudentView } from '../../state/useStudentView';

type PartFilter = 'toutes' | PartId;
type StateFilter = 'tous' | 'disponibles' | 'en-cours' | 'termines';

const PART_VALUES: PartFilter[] = ['toutes', 'p1', 'p2', 'p3'];
const STATE_VALUES: StateFilter[] = ['tous', 'disponibles', 'en-cours', 'termines'];

export function Catalogue() {
  const [params, setParams] = useSearchParams();
  const v = useStudentView();
  const partie = (PART_VALUES.includes(params.get('partie') as PartFilter) ? params.get('partie') : 'toutes') as PartFilter;
  const etat = (STATE_VALUES.includes(params.get('etat') as StateFilter) ? params.get('etat') : 'tous') as StateFilter;

  const set = (key: string, value: string, def: string) => {
    const next = new URLSearchParams(params);
    if (value === def) next.delete(key);
    else next.set(key, value);
    setParams(next, { replace: true });
  };

  const matchState = (u: LearningUnit, s: StateFilter) =>
    s === 'tous' ||
    (s === 'disponibles' && v.availabilityOf(u) === 'disponible') ||
    (s === 'en-cours' && v.statusOf(u) === 'en-cours') ||
    (s === 'termines' && v.statusOf(u) === 'termine');
  const matchPart = (u: LearningUnit, p: PartFilter) => p === 'toutes' || u.partId === p;

  const results = UNITS.filter((u) => matchPart(u, partie) && matchState(u, etat));
  const groups = PARTS.map((p) => ({ part: p, units: results.filter((u) => u.partId === p.id) })).filter((g) => g.units.length);

  const emptyMessage: Record<StateFilter, string> = {
    tous: 'Aucun dossier ne correspond.',
    disponibles:
      v.mode === 'local'
        ? 'Aucun dossier n’est encore ouvert. Les dossiers seront ouverts un par un, après validation par ton professeur.'
        : 'Aucun dossier disponible dans cette partie.',
    'en-cours': 'Tu n’as aucun dossier en cours dans cette sélection.',
    termines: 'Aucun dossier terminé dans cette sélection pour l’instant.',
  };

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Catalogue</p>
        <h1 className="text-[2rem] font-extrabold sm:text-[2.4rem]">13 dossiers, 2 scénarios</h1>
        <p className="max-w-2xl text-ink-2">
          Chaque dossier te place dans une entreprise pour travailler un bloc de compétences. Les scénarios transversaux, en jaune, enchaînent les
          tâches de plusieurs dossiers dans une même situation.
        </p>
      </header>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-card p-3 sm:p-4">
        <FilterGroup<PartFilter>
          label="Filtrer par partie"
          value={partie}
          onChange={(x) => set('partie', x, 'toutes')}
          options={[
            { value: 'toutes', label: 'Toutes les parties', count: UNITS.filter((u) => matchState(u, etat)).length },
            ...PARTS.map((p) => ({
              value: p.id as PartFilter,
              label: `Partie ${p.number}`,
              dot: PART_THEME[p.id].bg,
              count: UNITS.filter((u) => matchPart(u, p.id) && matchState(u, etat)).length,
            })),
          ]}
        />
        <div className="h-px bg-line" />
        <div className="flex flex-wrap items-center justify-between gap-2">
          <FilterGroup<StateFilter>
            label="Filtrer par état"
            value={etat}
            onChange={(x) => set('etat', x, 'tous')}
            options={[
              { value: 'tous', label: 'Tous les états' },
              { value: 'disponibles', label: 'Disponibles', count: UNITS.filter((u) => matchPart(u, partie) && matchState(u, 'disponibles')).length },
              { value: 'en-cours', label: 'En cours', count: UNITS.filter((u) => matchPart(u, partie) && matchState(u, 'en-cours')).length },
              { value: 'termines', label: 'Terminés', count: UNITS.filter((u) => matchPart(u, partie) && matchState(u, 'termines')).length },
            ]}
          />
          <DataModeTag mode={v.mode} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {results.length} résultat{results.length > 1 ? 's' : ''}
      </p>

      {groups.length === 0 ? (
        <EmptyState
          icon={<SearchX className="size-6" />}
          title="Aucun résultat"
          action={
            <Button variant="secondary" onClick={() => setParams(new URLSearchParams(), { replace: true })}>
              Réinitialiser les filtres
            </Button>
          }
        >
          {emptyMessage[etat]}
        </EmptyState>
      ) : (
        groups.map(({ part, units }) => (
          <section key={part.id} aria-labelledby={`g-${part.id}`} className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <span className={cx('grid size-10 shrink-0 place-items-center rounded-xl font-display text-xl font-extrabold text-white', PART_THEME[part.id].bg)}>
                {part.number}
              </span>
              <div>
                <h2 id={`g-${part.id}`} className="text-[1.25rem] font-bold">
                  {part.title}
                </h2>
                <p className="text-[0.88rem] text-ink-3">{part.tagline}</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {units.map((u) => (
                <UnitCard key={u.id} unit={u} />
              ))}
            </div>
          </section>
        ))
      )}

      <p className="border-t border-line pt-4 text-[0.82rem] text-ink-3">{SOURCE_NOTICE}</p>
    </div>
  );
}
