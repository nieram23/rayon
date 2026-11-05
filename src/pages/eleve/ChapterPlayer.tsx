import { PaperButton } from '../../components/PaperButton';
import { useEffect, useMemo, type ReactNode } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ArrowRight, BookMarked, Building2, CheckCircle2, Circle, CircleDot, FileText, Info, NotebookPen, Sigma, Sparkles, Target, Wrench } from 'lucide-react';
import { getChapter } from '../../content/chapters';
import { getUnit, unitLabel } from '../../content';
import type { Chapter, ChapterStep } from '../../domain/chapter';
import { allActivities, isAutoCheckable, isDone } from '../../domain/check';
import { ActivityCard } from '../../components/chapter/ActivityCard';
import { Calculator } from '../../components/chapter/Calculator';
import { DocumentView } from '../../components/chapter/DocumentView';
import { Photo } from '../../components/chapter/Photo';
import { photoUrl } from '../../content/images';
import { MasteryChip, Pill, ProgressBar, UnitTag } from '../../components/ui';
import { markVisited, readChapter, saveSelfAssessment } from '../../services/chapterStore';
import { useApp } from '../../state/AppContext';
import { useStudentView } from '../../state/useStudentView';
import { PART_THEME, cx } from '../../lib/theme';
import { NotFound } from '../NotFound';

const KIND_LABEL: Record<ChapterStep['kind'], string> = {
  ouverture: 'Ouverture',
  mission: 'Mission',
  synthese: 'Synthèse',
  application: 'Application',
  bilan: 'Bilan',
};

export function stepLabel(s: ChapterStep) {
  return s.number ? `${KIND_LABEL[s.kind]} ${s.number}` : KIND_LABEL[s.kind];
}

function stepStatus(s: ChapterStep, rec: ReturnType<typeof readChapter>): 'fait' | 'en-cours' | 'a-faire' {
  if (s.activities.length === 0) return rec.visited.includes(s.id) ? 'fait' : 'a-faire';
  const done = s.activities.filter((a) => isDone(a, rec.answers[a.id])).length;
  return done === s.activities.length ? 'fait' : done > 0 || s.activities.some((a) => rec.answers[a.id]) ? 'en-cours' : 'a-faire';
}

export function ChapterPlayer() {
  const { id = '', stepId = '' } = useParams();
  const unit = getUnit(id);
  const chapter = getChapter(id);
  // Le contexte change après chaque réponse : les données sont relues à chaque rendu.
  const { mode } = useApp();
  const rec = readChapter(id);

  const step = chapter?.steps.find((s) => s.id === stepId);
  useEffect(() => {
    if (chapter && step) markVisited(chapter.unitId, step.id, `${stepLabel(step)} · ${step.title}`);
  }, [chapter, step]);

  if (!unit || !chapter) return <NotFound />;
  if (!step) return <Navigate to={`/dossiers/${id}/${chapter.steps[0].id}`} replace />;

  const idx = chapter.steps.indexOf(step);
  const prev = chapter.steps[idx - 1];
  const next = chapter.steps[idx + 1];
  const acts = allActivities(chapter);
  const done = acts.filter((a) => isDone(a, rec.answers[a.id])).length;
  const t = PART_THEME[unit.partId];

  return (
    <div className="flex flex-col gap-6">
      {/* En-tête du dossier */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Link to={`/dossiers/${id}`} className="inline-flex w-fit items-center gap-2 text-[0.9rem] font-bold text-ink-2 hover:text-ink">
            <ArrowLeft className="size-4" aria-hidden /> Fiche du dossier
          </Link>
          <PaperButton unitId={unit.id} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <UnitTag unit={unit} />
          <p className="font-display text-[1.05rem] font-bold">{unit.title}</p>
          <span className="ml-auto text-[0.85rem] text-ink-3">
            {done}/{acts.length} activités
          </span>
        </div>
        <ProgressBar value={done / acts.length} partId={unit.partId} label="Progression dans le dossier" />
        {mode === 'demo' && (
          <p className="rounded-lg bg-tag-soft px-3 py-2 text-[0.85rem]">
            Mode démonstration actif : tes réponses ici sont bien enregistrées, mais le tableau de bord affiche des données simulées. Repasse en « Mes données » dans ton profil pour voir ta vraie progression.
          </p>
        )}
      </div>

      {/* Étapes */}
      <nav aria-label="Étapes du dossier" className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <ol className="flex min-w-max gap-2">
          {chapter.steps.map((s) => {
            const st = stepStatus(s, rec);
            const cur = s.id === step.id;
            const Icon = st === 'fait' ? CheckCircle2 : st === 'en-cours' ? CircleDot : Circle;
            return (
              <li key={s.id}>
                <Link
                  to={`/dossiers/${id}/${s.id}`}
                  aria-current={cur ? 'step' : undefined}
                  className={cx(
                    'flex min-h-11 items-center gap-2 rounded-full border px-3.5 text-[0.85rem] font-bold whitespace-nowrap',
                    cur ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-card hover:border-ink',
                  )}
                >
                  <Icon className={cx('size-4', !cur && st === 'fait' && t.text)} aria-hidden />
                  {stepLabel(s)}
                </Link>
              </li>
            );
          })}
        </ol>
      </nav>

      <StepView chapter={chapter} step={step} />

      {/* Navigation entre étapes */}
      <nav aria-label="Étape précédente et suivante" className="grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-2 [&>*]:min-w-0">
        {prev ? (
          <Link to={`/dossiers/${id}/${prev.id}`} className="flex min-h-14 items-center gap-3 rounded-2xl border border-line-2 bg-card px-4 hover:border-ink">
            <ArrowLeft className="size-5 shrink-0" aria-hidden />
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-bold text-ink-3">{stepLabel(prev)}</span>
              <span className="block truncate font-bold">{prev.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {next && (
          <Link to={`/dossiers/${id}/${next.id}`} className="flex min-h-14 items-center justify-end gap-3 rounded-2xl bg-ink px-4 text-right text-paper hover:bg-ink-2">
            <span className="min-w-0">
              <span className="block text-[0.78rem] font-bold text-paper/60">Étape suivante · {stepLabel(next)}</span>
              <span className="block truncate font-bold">{next.title}</span>
            </span>
            <ArrowRight className="size-5 shrink-0" aria-hidden />
          </Link>
        )}
      </nav>
      {(step.kind === 'mission' || step.kind === 'application' || step.kind === 'synthese') && <Calculator />}
    </div>
  );
}

/* ================================ Vues d'étape ================================ */

function ManagerBubble({ step }: { step: ChapterStep }) {
  if (!step.message) return null;
  const m = step.message;
  const portrait = `portrait-${m.from
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(' ')[0]}-cut`;
  const src = photoUrl(portrait);
  return (
    <div className="flex gap-3 sm:gap-4">
      {src ? (
        <div className="size-16 shrink-0 overflow-hidden rounded-full bg-p3-soft sm:size-20" aria-hidden>
          <img src={src} alt="" className="h-full w-full object-cover object-top" />
        </div>
      ) : (
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-p3 font-display text-lg font-extrabold text-white sm:size-14" aria-hidden>
          {m.from
            .split(' ')
            .map((x) => x[0])
            .join('')}
        </div>
      )}
      <div className="relative flex-1 rounded-2xl rounded-tl-sm border border-line bg-card p-4 shadow-[var(--shadow-card)]">
        <p className="text-[0.85rem]">
          <strong>{m.from}</strong> <span className="text-ink-3">· {m.role}</span>
        </p>
        {m.text.map((p, i) => (
          <p key={i} className="mt-2 leading-relaxed">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}

function StepView({ chapter, step }: { chapter: Chapter; step: ChapterStep }) {
  const rec = readChapter(chapter.unitId);
  const heading = (
    <header className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-lg bg-p2 px-3 py-1 font-display text-[0.95rem] font-extrabold text-white">{stepLabel(step)}</span>
        {step.guidance && (
          <Pill className="bg-white border border-line text-ink-2">
            Guidage : {step.guidance}
          </Pill>
        )}
      </div>
      <h1 className="text-[1.75rem] font-extrabold sm:text-[2.2rem]">{step.title}</h1>
    </header>
  );

  if (step.kind === 'synthese') return <SynthesisView step={step} heading={heading} unitId={chapter.unitId} />;
  if (step.kind === 'bilan') return <BilanView chapter={chapter} step={step} heading={heading} />;

  // Les grands tableaux (cadencier) ont besoin de toute la largeur : documents au-dessus.
  const wide = step.activities.some((a) => a.kind === 'grid' || a.kind === 'planning' || (a.kind === 'fields' && a.layout === 'columns' && (a.columns?.length ?? 0) > 2));
  return (
    <div className="flex flex-col gap-6">
      {heading}
      {step.hero && photoUrl(step.hero.id) && (
        <Photo image={step.hero} className="h-48 overflow-hidden rounded-2xl sm:h-72 [&_img]:rounded-2xl" />
      )}
      {step.kind === 'ouverture' && (
        <div className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
          <div className="card p-5">
            <p className="flex items-center gap-2 text-[0.8rem] font-bold tracking-wide text-ink-3 uppercase">
              <Building2 className="size-4" aria-hidden /> Ton entreprise d’accueil
            </p>
            <p className="mt-1 font-display text-[1.4rem] font-extrabold">{chapter.company.name}</p>
            <p className="text-ink-2">{chapter.company.tagline}</p>
            <dl className="mt-3 grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
              {chapter.company.facts.map(([k, v]) => (
                <div key={k} className="contents">
                  <dt className="text-[0.85rem] font-bold text-ink-3">{k}</dt>
                  <dd className="mb-1 text-[0.95rem] sm:mb-0">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="card flex flex-col gap-3 p-5">
            <p className="flex items-center gap-2 text-[0.8rem] font-bold tracking-wide text-ink-3 uppercase">
              <Target className="size-4" aria-hidden /> Ta mission générale
            </p>
            <p>{chapter.mission}</p>
            <p className="text-[0.85rem] font-bold">Résultat{(getUnit(chapter.unitId)?.outcomes.length ?? 0) > 1 ? 's' : ''} attendu{(getUnit(chapter.unitId)?.outcomes.length ?? 0) > 1 ? 's' : ''}</p>
            <ul className="flex flex-col gap-1 text-[0.95rem] text-ink-2">
              {getUnit(chapter.unitId)?.outcomes.map((o) => (
                <li key={o.id}>{o.text}</li>
              ))}
            </ul>
            <p className="mt-auto flex gap-2 text-[0.8rem] text-ink-3">
              <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden /> {chapter.fictionNotice}
            </p>
          </div>
        </div>
      )}
      <ManagerBubble step={step} />

      <div className={cx('grid grid-cols-1 gap-6 [&>*]:min-w-0', step.documents.length > 0 && !wide && 'xl:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]')}>
        {step.documents.length > 0 && (
          <section
            aria-labelledby={`${step.id}-docs`}
            className={cx('flex flex-col gap-3', wide ? 'lg:grid lg:grid-cols-2 lg:items-start' : 'xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto xl:pr-2')}
          >
            <h2 id={`${step.id}-docs`} className="flex items-center gap-2 text-[1.2rem] font-bold lg:col-span-2">
              <FileText className="size-5 text-p1" aria-hidden /> Documents ressources
            </h2>
            {step.documents.map((d) => (
              <DocumentView key={d.id} doc={d} />
            ))}
          </section>
        )}
        <section aria-labelledby={`${step.id}-annexes`} className="flex min-w-0 flex-col gap-4">
          <h2 id={`${step.id}-annexes`} className="flex items-center gap-2 text-[1.2rem] font-bold">
            <NotebookPen className="size-5 text-p3" aria-hidden /> {step.kind === 'application' ? 'À toi de jouer' : 'Annexes à compléter'}
          </h2>
          {step.activities.map((a) => (
            <ActivityCard key={a.id} unitId={chapter.unitId} activity={a} initial={rec.answers[a.id]} />
          ))}
          {step.selfAssessment && <SelfAssessment unitId={chapter.unitId} criteria={step.selfAssessment} />}
        </section>
      </div>
    </div>
  );
}

function SynthesisView({ step, heading, unitId }: { step: ChapterStep; heading: ReactNode; unitId: string }) {
  const rec = readChapter(unitId);
  const ICON = { notions: BookMarked, methodes: Wrench, formules: Sigma, erreurs: AlertTriangle, pratiques: Sparkles, 'mots-cles': Target } as const;
  return (
    <div className="flex flex-col gap-6">
      {heading}
      {step.activities.map((a) => (
        <ActivityCard key={a.id} unitId={unitId} activity={a} initial={rec.answers[a.id]} />
      ))}
      <h2 className="mt-2 text-[1.4rem] font-bold">Fiche de révision</h2>
      <p className="max-w-2xl text-ink-2">Elle reste disponible à tout moment depuis la page « Fiches ».</p>
      <div className="grid gap-4 md:grid-cols-2">
        {step.synthesis?.map((s) => {
          const Icon = ICON[s.kind];
          return (
            <section key={s.title} className={cx('card p-5', s.kind === 'formules' && 'bg-ink text-paper', s.kind === 'mots-cles' && 'md:col-span-2')}>
              <h2 className="mb-3 flex items-center gap-2 text-[1.15rem] font-bold">
                <Icon className={cx('size-5', s.kind === 'erreurs' ? 'text-m2' : s.kind === 'formules' ? 'text-tag' : 'text-p1')} aria-hidden /> {s.title}
              </h2>
              {s.kind === 'mots-cles' ? (
                <ul className="flex flex-wrap gap-2">
                  {s.items.map((x) => (
                    <li key={x} className="rounded-full bg-tag-soft px-3 py-1 font-bold">
                      {x}
                    </li>
                  ))}
                </ul>
              ) : (
                <ul className="flex flex-col gap-2">
                  {s.items.map((x) => (
                    <li key={x} className={cx('flex gap-2', s.kind === 'formules' && 'font-display font-bold')}>
                      <span className={cx('mt-2.5 size-1.5 shrink-0 rounded-full', s.kind === 'formules' ? 'bg-tag' : 'bg-ink-3')} aria-hidden />
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}

function SelfAssessment({ unitId, criteria }: { unitId: string; criteria: string[] }) {
  const { bumpData } = useApp();
  const rec = readChapter(unitId);
  const LV = ['Pas encore', 'Avec de l’aide', 'Oui', 'Oui, et je sais l’expliquer'];
  return (
    <section className="card p-5" aria-labelledby={`sa-${criteria[0]}`}>
      <h3 id={`sa-${criteria[0]}`} className="text-[1.1rem] font-bold">
        Mon autoévaluation
      </h3>
      <p className="mb-3 text-[0.85rem] text-ink-3">Ton avis sur toi-même. Ce n’est pas une note : seul ton professeur valide un niveau de maîtrise.</p>
      <ul className="flex flex-col gap-3">
        {criteria.map((c) => (
          <li key={c} className="flex flex-col gap-2">
            <p className="font-bold">{c}</p>
            <div role="radiogroup" aria-label={c} className="flex flex-wrap gap-1.5">
              {LV.map((l, i) => {
                const on = rec.selfAssessment[c] === i + 1;
                return (
                  <button
                    key={l}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => {
                      saveSelfAssessment(unitId, c, i + 1);
                      bumpData();
                    }}
                    className={cx('min-h-10 rounded-lg border-2 px-3 text-[0.85rem] font-bold', on ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-white hover:border-ink')}
                  >
                    {l}
                  </button>
                );
              })}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function BilanView({ chapter, step, heading }: { chapter: Chapter; step: ChapterStep; heading: ReactNode }) {
  const v = useStudentView();
  const unit = getUnit(chapter.unitId)!;
  const rec = readChapter(chapter.unitId);
  const rows = useMemo(
    () =>
      chapter.steps
        .filter((s) => s.activities.length)
        .map((s) => {
          const auto = s.activities.filter(isAutoCheckable);
          const correct = auto.reduce((n, a) => n + (rec.answers[a.id]?.correct ?? 0), 0);
          const total = auto.reduce((n, a) => n + (rec.answers[a.id]?.total ?? 0), 0);
          const done = s.activities.filter((a) => isDone(a, rec.answers[a.id])).length;
          return { s, done, total: s.activities.length, score: total ? Math.round((correct / total) * 100) : null };
        }),
    [chapter, rec],
  );
  const productions = chapter.steps.flatMap((s) => s.activities.filter((a) => a.kind === 'open').map((a) => ({ s, a, ans: rec.answers[a.id] })));
  const difficulties = chapter.steps.flatMap((s) =>
    s.activities
      .filter((a) => {
        const ans = rec.answers[a.id];
        return ans && (ans.helpsUsed >= 3 || ans.attempts >= 3 || (ans.total && (ans.correct ?? 0) / ans.total < 0.5));
      })
      .map((a) => ({ s, a, ans: rec.answers[a.id]! })),
  );
  const syn = chapter.steps.find((s) => s.kind === 'synthese')?.synthesis?.find((x) => x.kind === 'mots-cles');

  return (
    <div className="flex flex-col gap-6">
      {heading}
      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-5" aria-labelledby="b-missions">
          <h2 id="b-missions" className="mb-3 text-[1.15rem] font-bold">
            Missions réalisées
          </h2>
          <ul className="flex flex-col gap-3">
            {rows.map(({ s, done, total, score }) => (
              <li key={s.id}>
                <Link to={`/dossiers/${chapter.unitId}/${s.id}`} className="flex items-center gap-3 hover:underline">
                  {done === total ? <CheckCircle2 className="size-5 shrink-0 text-p1" aria-hidden /> : <Circle className="size-5 shrink-0 text-ink-3" aria-hidden />}
                  <span className="min-w-0 flex-1">
                    <span className="block text-[0.78rem] font-bold text-ink-3">{stepLabel(s)}</span>
                    <span className="block font-bold leading-snug">{s.title}</span>
                  </span>
                  <span className="shrink-0 text-right text-[0.82rem]">
                    {done}/{total}
                    <span className="block text-ink-3">{score === null ? '—' : `réussite ${score} %`}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <div className="flex flex-col gap-4">
          <section className="card p-5" aria-labelledby="b-prod">
            <h2 id="b-prod" className="mb-3 text-[1.15rem] font-bold">
              Productions rédigées
            </h2>
            <ul className="flex flex-col gap-2">
              {productions.map(({ s, a, ans }) => (
                <li key={a.id} className="flex items-center justify-between gap-2 text-[0.92rem]">
                  <span>
                    {stepLabel(s)} · {a.title}
                  </span>
                  <Pill className={ans?.submitted ? 'bg-p1-soft text-p1-dark' : 'bg-ink/6 text-ink-3'}>{ans?.submitted ? 'Enregistrée' : 'Non rendue'}</Pill>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-[0.8rem] text-ink-3">Elles seront transmises à ton professeur lorsque la connexion de classe sera disponible.</p>
          </section>
          <section className="card p-5" aria-labelledby="b-diff">
            <h2 id="b-diff" className="mb-3 text-[1.15rem] font-bold">
              Difficultés rencontrées
            </h2>
            {difficulties.length === 0 ? (
              <p className="text-[0.92rem] text-ink-2">Aucune difficulté repérée pour l’instant (aides détaillées, tentatives répétées ou score inférieur à 50 %).</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {difficulties.map(({ s, a, ans }) => (
                  <li key={a.id} className="flex gap-2 text-[0.92rem]">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-m2" aria-hidden />
                    <span>
                      <Link to={`/dossiers/${chapter.unitId}/${s.id}`} className="font-bold hover:underline">
                        {a.title}
                      </Link>{' '}
                      · {ans.attempts} tentative{ans.attempts > 1 ? 's' : ''}, {ans.helpsUsed} aide{ans.helpsUsed > 1 ? 's' : ''}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      <section className="card p-5" aria-labelledby="b-comp">
        <h2 id="b-comp" className="mb-3 text-[1.15rem] font-bold">
          Compétences et résultat attendu
        </h2>
        <ul className="mb-4 flex flex-col gap-1.5">
          {unit.skills.map((s) => (
            <li key={s.id} className="flex gap-2">
              <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-p1" aria-hidden />
              {s.text}
            </li>
          ))}
        </ul>
        {unit.outcomes.map((o) => {
          const a = v.assessmentOf(o.id);
          return (
            <div key={o.id} className="flex flex-col gap-2 rounded-xl bg-ink/4 p-4 sm:flex-row sm:items-center sm:justify-between">
              <p>{o.text}</p>
              <MasteryChip value={a?.level ?? null} origin={a?.origin} />
            </div>
          );
        })}
        <p className="mt-3 text-[0.82rem] text-ink-3">
          Ton état de maîtrise sera fixé par ton professeur à partir de tes productions. Ton score de réussite ({unitLabel(unit)}) n’en est qu’un indice.
        </p>
        {syn && (
          <div className="mt-4">
            <p className="mb-2 text-[0.85rem] font-bold">Notions travaillées</p>
            <ul className="flex flex-wrap gap-1.5">
              {syn.items.map((x) => (
                <li key={x} className="rounded-full bg-tag-soft px-3 py-1 text-[0.85rem] font-bold">
                  {x}
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>
      {step.selfAssessment && <SelfAssessment unitId={chapter.unitId} criteria={step.selfAssessment} />}
    </div>
  );
}
