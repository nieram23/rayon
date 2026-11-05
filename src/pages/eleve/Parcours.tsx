import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import { PARTS, unitsOfPart } from '../../content';
import { progressRatio } from '../../domain/progress';
import { AvailabilityBadge, DataModeTag, MasteryStack, ProgressBar, StatusBadge, UnitTag } from '../../components/ui';
import { distribution } from '../../domain/progress';
import { PART_THEME, cx, pct } from '../../lib/theme';
import { useStudentView } from '../../state/useStudentView';

/** Mon parcours : les 15 étapes dans l'ordre, avec les trois indicateurs séparés. */
export function Parcours() {
  const v = useStudentView();
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-3">
        <p className="eyebrow">Mon parcours</p>
        <h1 className="text-[2rem] font-extrabold sm:text-[2.4rem]">15 étapes, du stock au client</h1>
        <div className="flex flex-wrap items-center gap-3">
          <p className="max-w-2xl text-ink-2">
            Pour chaque étape : la <strong>progression</strong> (activités faites), la <strong>réussite</strong> (qualité des réponses) et la{' '}
            <strong>maîtrise</strong> (niveaux validés). Trois mesures différentes.
          </p>
          <DataModeTag mode={v.mode} />
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-[0.8rem] font-bold text-ink-3">Progression totale</p>
          <p className="font-display text-[1.8rem] font-bold">{pct(v.summary.overall)}</p>
          <ProgressBar value={v.summary.overall} label="Progression totale" className="mt-2" />
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-[0.8rem] font-bold text-ink-3">Étapes terminées</p>
          <p className="font-display text-[1.8rem] font-bold">{v.summary.finished} / 15</p>
        </div>
        <div className="rounded-2xl border border-line bg-card p-4">
          <p className="text-[0.8rem] font-bold text-ink-3">Résultats évalués</p>
          <p className="font-display text-[1.8rem] font-bold">{v.evaluated.length}</p>
          <p className="text-[0.8rem] text-ink-3">dont {v.toRework.length} à retravailler</p>
        </div>
      </div>

      {PARTS.map((part) => {
        const t = PART_THEME[part.id];
        return (
          <section key={part.id} aria-labelledby={`pp-${part.id}`}>
            <div className="mb-3 flex items-center gap-3">
              <span className={cx('h-8 w-1.5 rounded-full', t.bg)} aria-hidden />
              <h2 id={`pp-${part.id}`} className="text-[1.2rem] font-bold">
                Partie {part.number} — {part.title}
              </h2>
            </div>
            <ol className="relative flex flex-col gap-3 sm:pl-6">
              <span className="absolute top-2 bottom-2 left-[0.7rem] hidden w-0.5 bg-line-2 sm:block" aria-hidden />
              {unitsOfPart(part.id).map((u) => {
                const p = v.progressOf(u);
                const status = v.statusOf(u);
                const d = distribution(u.outcomes.map((o) => v.levelOf(o.id)));
                return (
                  <li key={u.id} className="relative">
                    <span
                      className={cx(
                        'absolute top-6 -left-6 hidden size-5 -translate-x-[3px] place-items-center rounded-full border-2 sm:grid',
                        status === 'termine' ? 'border-ink bg-ink text-paper' : status === 'en-cours' ? cx('border-ink', t.bg) : 'border-line-2 bg-paper',
                      )}
                      aria-hidden
                    >
                      {status === 'termine' && <Check className="size-3" />}
                    </span>
                    <Link
                      to={`/dossiers/${u.id}`}
                      className={cx(
                        'card card-lift grid gap-4 p-4 sm:grid-cols-[1fr_9rem_9rem_10rem] sm:items-center sm:p-5',
                        u.kind === 'scenario' && 'border-2 border-ink bg-tag-soft',
                      )}
                    >
                      <div className="min-w-0">
                        <div className="mb-1 flex flex-wrap items-center gap-2">
                          <UnitTag unit={u} />
                          <AvailabilityBadge value={v.availabilityOf(u)} demo={v.mode === 'demo' && v.availabilityOf(u) === 'disponible'} />
                        </div>
                        <p className="leading-snug font-bold">{u.title}</p>
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-bold text-ink-3">Progression</p>
                        <p className="text-[0.95rem] font-bold">{p ? `${p.activitiesDone}/${p.activitiesTotal}` : '—'}</p>
                        <ProgressBar value={progressRatio(p)} partId={u.partId} label={`Progression ${u.title}`} className="mt-1" />
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-bold text-ink-3">Réussite</p>
                        <p className="text-[0.95rem] font-bold">{p?.successRate != null ? `${p.successRate} %` : '—'}</p>
                      </div>
                      <div>
                        <p className="mb-1 text-[0.75rem] font-bold text-ink-3">Maîtrise</p>
                        <MasteryStack counts={d} label={`Maîtrise ${u.title}`} />
                        <p className="mt-1 text-[0.75rem] text-ink-3">
                          {d.total - d.ne}/{d.total} évalué{d.total - d.ne > 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="sm:hidden">
                        <StatusBadge status={status} />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
