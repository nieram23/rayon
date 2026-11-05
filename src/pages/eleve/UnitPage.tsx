import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  BookMarked,
  CalendarClock,
  ClipboardList,
  FileText,
  Flag,
  Lightbulb,
  ListChecks,
  Lock,
  NotebookPen,
  Repeat,
  Sparkles,
  Target,
} from 'lucide-react';
import { SOURCE_NOTICE, getMeta, getPart, getUnit, neighbours, partsCovered, scenariosUsing, unitLabel, unitsOfPart } from '../../content';
import { progressRatio } from '../../domain/progress';
import { PartIllustration } from '../../components/illustrations';
import { PaperButton } from '../../components/PaperButton';
import { AvailabilityBadge, ButtonLink, DataModeTag, MasteryChip, Pill, ProgressBar, StatusBadge, UnitTag } from '../../components/ui';
import { PART_THEME, cx, pct } from '../../lib/theme';
import { useStudentView } from '../../state/useStudentView';
import { NotFound } from '../NotFound';
import { getChapter } from '../../content/chapters';
import { readChapter } from '../../services/chapterStore';
import { isDone } from '../../domain/check';
import { stepLabel } from './ChapterPlayer';
import { CheckCircle2, Circle, PlayCircle } from 'lucide-react';

/** Déroulé type d'un futur dossier (section 5 du cahier des charges). */
const STRUCTURE = [
  { icon: Flag, title: 'Ouverture', text: 'Ton entreprise, ton poste, ton responsable et la mission qui t’est confiée.' },
  { icon: ListChecks, title: 'Missions progressives', text: 'Des missions qui commencent par un verbe d’action, avec un guidage qui diminue.' },
  { icon: FileText, title: 'Documents ressources', text: 'Des documents professionnels numérotés : courriels, catalogues, états, plans.' },
  { icon: NotebookPen, title: 'Annexes à compléter', text: 'Ton espace de travail : bon de commande, tableau, plan, courriel…' },
  { icon: Lightbulb, title: 'Aides à la demande', text: 'Un indice, puis un rappel de méthode, puis une aide détaillée.' },
  { icon: BookMarked, title: 'Synthèse', text: 'Notions, méthodes, formules, erreurs fréquentes : ta fiche de révision.' },
  { icon: Repeat, title: 'Application finale', text: 'Une nouvelle situation, dans une autre entreprise, avec moins d’aide.' },
  { icon: Target, title: 'Bilan de compétences', text: 'Ce que tu as produit, tes difficultés et ton état de maîtrise.' },
];

export function UnitPage() {
  const { id = '' } = useParams();
  const unit = getUnit(id);
  const v = useStudentView();
  if (!unit) return <NotFound />;

  const part = getPart(unit.partId);
  const t = PART_THEME[unit.partId];
  const availability = v.availabilityOf(unit);
  const status = v.statusOf(unit);
  const p = v.progressOf(unit);
  const { prev, next } = neighbours(unit);
  const siblings = unitsOfPart(unit.partId);
  const usedBy = scenariosUsing(unit.id);
  const mobilised = (unit.mobilisesUnitIds ?? []).map((x) => getUnit(x)!);
  const scenario = unit.kind === 'scenario';
  const demoOpen = v.mode === 'demo' && availability === 'disponible' && unit.availability !== 'disponible';
  const chapter = getChapter(unit.id);
  const rec = chapter ? readChapter(unit.id) : null;

  return (
    <article className="flex flex-col gap-10">
      <Link to="/dossiers" className="inline-flex w-fit items-center gap-2 text-[0.9rem] font-bold text-ink-2 hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden /> Tous les dossiers
      </Link>

      {/* ---------------- En-tête ---------------- */}
      <header className={cx('animate-rise relative overflow-hidden rounded-[1.75rem] border', scenario ? 'border-2 border-ink bg-tag-soft' : cx(t.bgSoft, 'border-transparent'))}>
        <div className="grid gap-6 p-6 sm:p-9 md:grid-cols-[1fr_auto]">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <UnitTag unit={unit} className="text-[0.95rem]" />
              {scenario ? (
                <Pill className="bg-ink text-paper">Scénario transversal · {partsCovered(unit).map((x) => `Partie ${x.slice(1)}`).join(' et ')}</Pill>
              ) : (
                <Pill className={cx('text-white', t.bg)}>
                  Partie {part.number} · {part.shortTitle}
                </Pill>
              )}
            </div>
            <p className="eyebrow">{unitLabel(unit)}</p>
            <h1 className="max-w-3xl text-[1.9rem] font-extrabold sm:text-[2.5rem]">{unit.title}</h1>
            <p className="max-w-2xl text-[1.05rem] text-ink-2">{unit.summary}</p>
            <div className="mt-1 flex flex-wrap gap-2">
              <AvailabilityBadge value={availability} demo={demoOpen} />
              <StatusBadge status={status} />
              {v.mode === 'demo' && <DataModeTag mode="demo" />}
            </div>
          </div>
          <PartIllustration partId={scenario ? partsCovered(unit)[0] : unit.partId} className="hidden h-44 w-auto self-end md:block" />
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="flex min-w-0 flex-col gap-10">
          {/* ---------------- Présentation ---------------- */}
          <section aria-labelledby="pres">
            <h2 id="pres" className="mb-3 text-[1.4rem] font-bold">
              Présentation
            </h2>
            <p className="text-[1.05rem] leading-relaxed text-ink-2">{unit.overview}</p>
          </section>

          {/* ---------------- Parcours du chapitre ou disponibilité ---------------- */}
          {chapter && rec ? (
            <section aria-labelledby="chap" className="card overflow-hidden">
              <div className="flex flex-col gap-4 bg-ink p-5 text-paper sm:flex-row sm:items-center sm:p-6">
                <div className="flex-1">
                  <h2 id="chap" className="text-[1.25rem] font-bold">
                    {rec.lastStepId ? 'Reprendre le dossier' : 'Le dossier est ouvert'}
                  </h2>
                  <p className="mt-1 text-paper/75">
                    {chapter.company.name} · {chapter.steps.filter((x) => x.kind === 'mission').length} missions, une synthèse, {chapter.steps.filter((x) => x.kind === 'application').length} applications et un bilan.
                  </p>
                </div>
                <ButtonLink to={`/dossiers/${unit.id}/${rec.lastStepId ?? chapter.steps[0].id}`} className="bg-tag text-ink shadow-[0_2px_0_#9a7a1f] hover:bg-[#f5cd6b]">
                  <PlayCircle className="size-5" aria-hidden /> {rec.lastStepId ? 'Reprendre' : 'Commencer'}
                </ButtonLink>
              </div>
              <div className="flex flex-col gap-2 border-b border-line bg-tag-soft/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-[0.92rem] text-ink-2">
                  <strong className="text-ink">Version papier.</strong> Tout le dossier en cahier à imprimer : documents, annexes à compléter, coups de pouce et grille d’évaluation.
                </p>
                <PaperButton unitId={unit.id} className="shrink-0" />
              </div>
              <ol className="divide-y divide-line">
                {chapter.steps.map((st) => {
                  const fait = st.activities.length ? st.activities.every((a) => isDone(a, rec.answers[a.id])) : rec.visited.includes(st.id);
                  return (
                    <li key={st.id}>
                      <Link to={`/dossiers/${unit.id}/${st.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-ink/3">
                        {fait ? <CheckCircle2 className={cx('size-5 shrink-0', t.text)} aria-hidden /> : <Circle className="size-5 shrink-0 text-ink-3" aria-hidden />}
                        <span className="w-28 shrink-0 text-[0.82rem] font-bold text-ink-3">{stepLabel(st)}</span>
                        <span className="font-bold leading-snug">{st.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ol>
              {p && (
                <div className="grid gap-3 border-t border-line p-5 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.8rem] font-bold text-ink-3">Progression</p>
                    <p className="font-display text-lg font-bold">
                      {p.activitiesDone}/{p.activitiesTotal} activités
                    </p>
                    <ProgressBar value={progressRatio(p)} partId={unit.partId} label="Progression" className="mt-1" />
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-bold text-ink-3">Réussite</p>
                    <p className="font-display text-lg font-bold">{p.successRate === null ? 'Non mesurée' : pct(p.successRate / 100)}</p>
                    <p className="text-[0.78rem] text-ink-3">Qualité des réponses vérifiables. Ce n’est pas la maîtrise.</p>
                  </div>
                </div>
              )}
            </section>
          ) : (
          <section aria-labelledby="dispo" className="card hatch flex flex-col gap-4 p-6 sm:flex-row sm:items-center">
            <div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-card shadow-[var(--shadow-card)]">
              {demoOpen ? <Sparkles className="size-6" aria-hidden /> : <Lock className="size-6" aria-hidden />}
            </div>
            <div className="flex-1">
              <h2 id="dispo" className="text-[1.15rem] font-bold">
                {demoOpen ? 'Ouvert en démonstration — contenu en préparation' : 'Prochainement disponible'}
              </h2>
              <p className="mt-1 text-[0.95rem] text-ink-2">
                {demoOpen
                  ? 'Ce dossier est simulé comme ouvert pour tester le suivi. Aucune mission réelle n’existe encore : la progression affichée est fictive.'
                  : 'Les missions de ce dossier sont en cours de conception. Les dossiers seront ouverts un par un, après validation par l’enseignant.'}
              </p>
              {p && (
                <div className="mt-4 grid max-w-lg gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[0.8rem] font-bold text-ink-3">Progression</p>
                    <p className="font-display text-lg font-bold">
                      {p.activitiesDone}/{p.activitiesTotal} activités
                    </p>
                    <ProgressBar value={progressRatio(p)} partId={unit.partId} label="Progression" className="mt-1" />
                  </div>
                  <div>
                    <p className="text-[0.8rem] font-bold text-ink-3">Réussite</p>
                    <p className="font-display text-lg font-bold">{p.successRate === null ? 'Non mesurée' : pct(p.successRate / 100)}</p>
                    <p className="text-[0.78rem] text-ink-3">Qualité des réponses vérifiables. Ce n’est pas la maîtrise.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
          )}

          {/* ---------------- Compétences ---------------- */}
          <section aria-labelledby="comp">
            <h2 id="comp" className="mb-1 text-[1.4rem] font-bold">
              Compétences professionnelles travaillées
            </h2>
            <p className="mb-4 text-[0.9rem] text-ink-3">
              Méta-compétence{unit.metaCompetenceIds.length > 1 ? 's' : ''} : {unit.metaCompetenceIds.map((m) => getMeta(m).label).join(' · ')}
            </p>
            <ol className="flex flex-col gap-2">
              {unit.skills.map((s, i) => (
                <li key={s.id} className="flex gap-3 rounded-xl border border-line bg-card p-4">
                  <span className={cx('grid size-7 shrink-0 place-items-center rounded-lg font-display text-sm font-bold text-white', scenario ? 'bg-ink' : t.bg)}>
                    {i + 1}
                  </span>
                  <span>{s.text}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* ---------------- Résultats attendus ---------------- */}
          <section aria-labelledby="res">
            <h2 id="res" className="mb-1 text-[1.4rem] font-bold">
              Résultats attendus
            </h2>
            <p className="mb-4 text-[0.9rem] text-ink-3">Ce que ton professeur observera pour évaluer ton niveau de maîtrise.</p>
            <ul className="flex flex-col gap-2">
              {unit.outcomes.map((o) => {
                const a = v.assessmentOf(o.id);
                return (
                  <li key={o.id} className="flex flex-col gap-3 rounded-xl border border-line bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p>{o.text}</p>
                      <p className="mt-1 text-[0.78rem] text-ink-3">
                        Grille du manuel
                        {o.echoesOutcomeId && ` · déjà évalué dans le ${unitLabel(getUnit(o.echoesOutcomeId.slice(0, 3))!).toLowerCase()}`}
                      </p>
                    </div>
                    <MasteryChip value={a?.level ?? null} origin={a?.origin} />
                  </li>
                );
              })}
            </ul>
            {unit.plannedCriteria.length > 0 && (
              <div className="mt-4 rounded-xl border-2 border-dashed border-line-2 p-4">
                <p className="text-[0.95rem] font-bold">Critères complémentaires prévus</p>
                <p className="mb-3 text-[0.82rem] text-ink-3">
                  Ajout pédagogique pour les futures activités — ne figure pas dans la grille du manuel.
                </p>
                <ul className="flex flex-col gap-2">
                  {unit.plannedCriteria.map((c) => (
                    <li key={c.id} className="flex gap-2 text-[0.95rem]">
                      <span className="mt-2 size-1.5 shrink-0 rounded-full bg-ink-3" aria-hidden />
                      <span>
                        {c.text}
                        {c.note && <span className="block text-[0.8rem] text-ink-3">{c.note}</span>}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* ---------------- Pistes / mobilisation ---------------- */}
          {scenario ? (
            <section aria-labelledby="mob">
              <h2 id="mob" className="mb-1 text-[1.4rem] font-bold">
                Dossiers remobilisés
              </h2>
              <p className="mb-4 text-[0.9rem] text-ink-3">Déduits des compétences du scénario. À réussir de préférence avant de l’aborder.</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {mobilised.map((m) => (
                  <li key={m.id}>
                    <Link to={`/dossiers/${m.id}`} className="flex items-center gap-3 rounded-xl border border-line bg-card p-3 hover:border-ink">
                      <UnitTag unit={m} />
                      <span className="text-[0.92rem] leading-snug font-bold">{m.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ) : chapter ? null : (
            <section aria-labelledby="pistes">
              <h2 id="pistes" className="mb-1 text-[1.4rem] font-bold">
                Situations envisagées
              </h2>
              <p className="mb-4 text-[0.9rem] text-ink-3">Pistes de travail pour la conception du dossier — liste provisoire, aucune mission n’existe encore.</p>
              <ul className="grid gap-2 sm:grid-cols-2">
                {unit.plannedSituations.map((s) => (
                  <li key={s} className="flex gap-2 rounded-xl bg-ink/4 px-4 py-3 text-[0.93rem]">
                    <ClipboardList className="mt-0.5 size-4 shrink-0 text-ink-3" aria-hidden /> {s}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* ---------------- Déroulé type ---------------- */}
          <section aria-labelledby="deroule">
            <h2 id="deroule" className="mb-1 text-[1.4rem] font-bold">
              Comment se déroulera {scenario ? 'ce scénario' : 'ce dossier'}
            </h2>
            <p className="mb-4 text-[0.9rem] text-ink-3">Structure commune à tous les dossiers de Rayon.</p>
            <ol className="grid gap-3 sm:grid-cols-2">
              {STRUCTURE.map((s, i) => (
                <li key={s.title} className="flex gap-3 rounded-xl border border-line bg-card p-4">
                  <s.icon className={cx('mt-0.5 size-5 shrink-0', scenario ? 'text-ink' : t.text)} aria-hidden />
                  <div>
                    <p className="font-bold">
                      <span className="text-ink-3">{i + 1}.</span> {s.title}
                    </p>
                    <p className="text-[0.9rem] text-ink-2">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        </div>

        {/* ---------------- Place dans le programme ---------------- */}
        <aside aria-labelledby="place" className="flex flex-col gap-4 lg:sticky lg:top-24 lg:h-fit">
          <div className="card p-5">
            <h2 id="place" className="mb-1 text-[1.1rem] font-bold">
              Place dans le programme
            </h2>
            <p className="mb-4 text-[0.85rem] text-ink-3">
              Étape {unit.order} sur 15 · Partie {part.number}
            </p>
            <ol className="flex flex-col">
              {siblings.map((s, idx) => {
                const current = s.id === unit.id;
                return (
                  <li key={s.id} className="relative flex gap-3 pb-3 last:pb-0">
                    {idx < siblings.length - 1 && <span className="absolute top-6 bottom-0 left-[0.85rem] w-px bg-line-2" aria-hidden />}
                    <span
                      className={cx(
                        'relative z-10 grid size-7 shrink-0 place-items-center rounded-full border-2 text-[0.7rem] font-bold',
                        current ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-card text-ink-3',
                      )}
                    >
                      {s.kind === 'scenario' ? 'S' : s.number}
                    </span>
                    {current ? (
                      <span className="text-[0.88rem] leading-snug font-bold" aria-current="page">
                        {s.title}
                      </span>
                    ) : (
                      <Link to={`/dossiers/${s.id}`} className="text-[0.88rem] leading-snug text-ink-2 hover:text-ink hover:underline">
                        {s.title}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
          {usedBy.length > 0 && (
            <div className="rounded-[var(--radius-card)] border-2 border-ink bg-tag-soft p-5">
              <p className="text-[0.95rem] font-bold">Remobilisé dans</p>
              {usedBy.map((s) => (
                <Link key={s.id} to={`/dossiers/${s.id}`} className="mt-2 flex items-center gap-2 text-[0.9rem] hover:underline">
                  <UnitTag unit={s} /> {s.title}
                </Link>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card p-4 text-[0.85rem] text-ink-2">
            <CalendarClock className="size-4 shrink-0" aria-hidden />
            Échéances et consignes de ton professeur : disponibles avec la future connexion de classe.
          </div>
        </aside>
      </div>

      {/* ---------------- Navigation ---------------- */}
      <nav aria-label="Dossier précédent et suivant" className="grid grid-cols-1 gap-3 border-t border-line pt-6 sm:grid-cols-2 [&>*]:min-w-0">
        {prev ? (
          <ButtonLink to={`/dossiers/${prev.id}`} variant="secondary" className="min-w-0 justify-start text-left">
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            <span className="truncate">
              {unitLabel(prev)} · {prev.title}
            </span>
          </ButtonLink>
        ) : (
          <span />
        )}
        {next && (
          <ButtonLink to={`/dossiers/${next.id}`} variant="secondary" className="min-w-0 justify-end text-right">
            <span className="truncate">
              {unitLabel(next)} · {next.title}
            </span>
            <ArrowRight className="size-4 shrink-0" aria-hidden />
          </ButtonLink>
        )}
      </nav>
      <p className="text-[0.8rem] text-ink-3">{SOURCE_NOTICE}</p>
    </article>
  );
}
