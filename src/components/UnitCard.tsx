import { Link } from 'react-router-dom';
import { ArrowUpRight, Layers } from 'lucide-react';
import { getMeta, partsCovered, unitLabel } from '../content';
import { progressRatio } from '../domain/progress';
import type { LearningUnit } from '../domain/types';
import { PART_THEME, cx } from '../lib/theme';
import { useStudentView } from '../state/useStudentView';
import { AvailabilityBadge, ProgressBar, StatusBadge, UnitTag } from './ui';

/** Carte de dossier : numéro, intitulé exact, description, compétences, partie, statuts. */
export function UnitCard({ unit, compact = false }: { unit: LearningUnit; compact?: boolean }) {
  const v = useStudentView();
  const p = v.progressOf(unit);
  const status = v.statusOf(unit);
  const availability = v.availabilityOf(unit);
  const t = PART_THEME[unit.partId];
  const scenario = unit.kind === 'scenario';
  const ratio = progressRatio(p);

  return (
    <article
      className={cx(
        'card card-lift group relative flex h-full flex-col overflow-hidden',
        scenario && 'border-2 border-ink bg-tag-soft',
      )}
    >
      {/* liseré de couleur de partie, façon bande de linéaire */}
      {!scenario && <div className={cx('h-1.5 w-full', t.bar)} aria-hidden />}
      {scenario && (
        <div className="flex h-1.5 w-full" aria-hidden>
          {partsCovered(unit).map((pid) => (
            <div key={pid} className={cx('flex-1', PART_THEME[pid].bar)} />
          ))}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <UnitTag unit={unit} />
            <span className={cx('text-[0.8rem] font-bold', 'text-ink-3')}>
              {scenario ? (
                <span className="inline-flex items-center gap-1">
                  <Layers className="size-3.5" aria-hidden /> Transversal · {partsCovered(unit).map((p) => `P${p.slice(1)}`).join(' + ')}
                </span>
              ) : (
                `Partie ${unit.partId.slice(1)} · ${t.name}`
              )}
            </span>
          </div>
        </div>
        <h3 className={cx('text-[1.15rem] leading-snug font-bold', !compact && 'min-h-[2.6em]')}>
          <Link to={`/dossiers/${unit.id}`} className="after:absolute after:inset-0 focus-visible:outline-none">
            {unit.title}
          </Link>
        </h3>
        {!compact && <p className={cx('text-[0.93rem] leading-snug', 'text-ink-2')}>{unit.summary}</p>}
        {!compact && (
          <ul className="flex flex-wrap gap-1.5" aria-label="Méta-compétences">
            {unit.metaCompetenceIds.map((m) => (
              <li
                key={m}
                className={cx(
                  'rounded-md px-2 py-0.5 text-[0.75rem] font-bold',
                  scenario ? 'bg-white/70 text-ink-2' : 'bg-ink/5 text-ink-2',
                )}
              >
                {getMeta(m).short}
              </li>
            ))}
            <li className={cx('rounded-md px-2 py-0.5 text-[0.75rem]', 'text-ink-3')}>
              {unit.skills.length} compétence{unit.skills.length > 1 ? 's' : ''} pro.
            </li>
          </ul>
        )}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          {status !== 'non-commence' && <ProgressBar value={ratio} partId={unit.partId} label={`Progression ${unitLabel(unit)}`} />}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1.5">
              <AvailabilityBadge value={availability} demo={v.mode === 'demo' && availability === 'disponible'} />
              {status !== 'non-commence' && <StatusBadge status={status} />}
            </div>
            <ArrowUpRight
              className={cx('size-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5', 'text-ink-3')}
              aria-hidden
            />
          </div>
        </div>
      </div>
    </article>
  );
}
