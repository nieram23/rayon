import { Link } from 'react-router-dom';
import { ArrowRight, Compass, History, Info, PlayCircle } from 'lucide-react';
import { META_COMPETENCES, PARTS, UNITS, getUnit, outcomesOfMeta, unitLabel, unitsOfPart } from '../../content';
import { distribution, progressRatio } from '../../domain/progress';
import { getChapter } from '../../content/chapters';
import { AisleIllustration, PartIllustration } from '../../components/illustrations';
import { UnitCard } from '../../components/UnitCard';
import { ButtonLink, DataModeTag, EmptyState, MasteryStack, ProgressBar, ProgressRing, SectionHeader, Stat, UnitTag } from '../../components/ui';
import { PART_THEME, cx, formatDate } from '../../lib/theme';
import { useApp } from '../../state/AppContext';
import { useStudentView } from '../../state/useStudentView';

function greeting() {
  const h = new Date().getHours();
  return h < 5 || h >= 18 ? 'Bonsoir' : 'Bonjour';
}

export function Dashboard() {
  const { profile } = useApp();
  const v = useStudentView();
  const last = v.summary.lastVisited ? getUnit(v.summary.lastVisited.unitId) : undefined;
  const lastP = v.summary.lastVisited;
  const firstAvailable = UNITS.find((u) => v.availabilityOf(u) === 'disponible' && v.statusOf(u) !== 'termine');
  const anyAvailable = UNITS.some((u) => v.availabilityOf(u) === 'disponible');
  /** Lien direct vers la dernière étape travaillée quand le chapitre existe. */
  const resumeTo = (unitId: string, stepId?: string) =>
    getChapter(unitId) && stepId && getChapter(unitId)!.steps.some((s) => s.id === stepId) ? `/dossiers/${unitId}/${stepId}` : `/dossiers/${unitId}`;

  // Action la plus utile, dans cet ordre : reprendre > commencer > découvrir.
  const primary =
    last && v.statusOf(last) === 'en-cours'
      ? { to: resumeTo(last.id, lastP?.lastMissionId), label: `Reprendre le ${unitLabel(last).toLowerCase()}`, icon: PlayCircle }
      : firstAvailable
        ? { to: `/dossiers/${firstAvailable.id}`, label: `Commencer le ${unitLabel(firstAvailable).toLowerCase()}`, icon: PlayCircle }
        : { to: '/parcours', label: 'Découvrir mon parcours', icon: Compass };

  // Aperçu : unités en cours, puis les suivantes dans l'ordre du parcours.
  const preview = [
    ...UNITS.filter((u) => v.statusOf(u) === 'en-cours'),
    ...UNITS.filter((u) => v.statusOf(u) === 'non-commence'),
  ].slice(0, 4);

  const totalOutcomes = UNITS.reduce((n, u) => n + u.outcomes.length, 0);

  return (
    <div className="flex flex-col gap-12">
      {/* ---------------- Accueil ---------------- */}
      <section aria-labelledby="accueil" className="animate-rise relative overflow-hidden rounded-[1.75rem] bg-ink text-paper">
        <div className="grid items-center gap-6 p-6 sm:p-10 md:grid-cols-[1.25fr_1fr]">
          <div className="relative z-10">
            <p className="text-[0.85rem] font-bold text-paper/60">
              {profile?.classLabel ? `${profile.classLabel} · ` : ''}Bac Pro MCV option A
            </p>
            <h1 id="accueil" className="mt-2 text-[2.1rem] font-extrabold sm:text-[2.8rem]">
              {greeting()} {profile?.pseudo}.
            </h1>
            <p className="mt-3 max-w-lg text-[1.05rem] text-paper/80">
              {last && v.statusOf(last) === 'en-cours'
                ? `Tu t’es arrêté sur « ${last.title} ». On reprend là où tu en étais ?`
                : anyAvailable
                  ? 'Un dossier t’attend. Chaque dossier te place dans une entreprise, avec une mission, des documents et un responsable.'
                  : 'Les dossiers ouvrent un par un. En attendant, découvre le parcours et les compétences sur lesquelles tu seras évalué.'}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink to={primary.to} className="bg-tag text-ink shadow-[0_2px_0_#9a7a1f] hover:bg-[#f5cd6b]">
                <primary.icon className="size-5" aria-hidden /> {primary.label}
              </ButtonLink>
              <ButtonLink to="/dossiers" variant="ghost" className="text-paper hover:bg-paper/10">
                Voir les 15 dossiers <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            </div>
          </div>
          <AisleIllustration className="relative -mb-10 hidden w-full max-w-md justify-self-end opacity-95 sm:block md:-mb-10" />
        </div>
      </section>

      {/* ---------------- Continuer ---------------- */}
      <section aria-labelledby="continuer">
        <SectionHeader id="continuer" eyebrow="Reprendre mon travail" title="Continuer mon parcours" />
        {last && lastP ? (
          <div className="card flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
            <div className={cx('grid size-14 shrink-0 place-items-center rounded-2xl', PART_THEME[last.partId].bgSoft)}>
              <History className={cx('size-6', PART_THEME[last.partId].textDark)} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <UnitTag unit={last} />
                <span className="text-[0.85rem] text-ink-3">Dernière visite : {formatDate(lastP.lastVisitedAt)}</span>
              </div>
              <p className="mt-1 font-display text-lg font-bold">{last.title}</p>
              <p className="text-[0.9rem] text-ink-2">
                {lastP.lastMissionTitle ? `Dernière activité : ${lastP.lastMissionTitle}` : 'Aucune mission enregistrée'} · {lastP.activitiesDone}/
                {lastP.activitiesTotal} activités
              </p>
              <ProgressBar value={progressRatio(lastP)} partId={last.partId} label="Progression du dernier dossier" className="mt-3 max-w-md" />
            </div>
            <ButtonLink to={resumeTo(last.id, lastP.lastMissionId)} variant="secondary">
              {getChapter(last.id) ? 'Reprendre l’activité' : 'Ouvrir le dossier'} <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          </div>
        ) : (
          <EmptyState icon={<History className="size-6" />} title="Rien à reprendre pour l’instant">
            Dès que tu auras commencé une mission, tu la retrouveras ici et tu pourras la rouvrir en un clic, exactement là où tu t’es arrêté.
          </EmptyState>
        )}
      </section>

      {/* ---------------- Progression ---------------- */}
      <section aria-labelledby="progression">
        <SectionHeader
          id="progression"
          eyebrow="Ma progression"
          title="Où j’en suis"
          action={<DataModeTag mode={v.mode} />}
        />
        <div className="grid gap-4 lg:grid-cols-[auto_1fr]">
          <div className="card flex items-center gap-5 p-5 text-p1 lg:flex-col lg:justify-center lg:px-8">
            <ProgressRing value={v.summary.overall} label="Progression totale du parcours" />
            <div className="text-ink lg:text-center">
              <p className="font-display text-lg font-bold">Progression totale</p>
              <p className="text-[0.85rem] text-ink-3">Activités accomplies sur l’ensemble du parcours</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Dossiers commencés" value={`${v.summary.started}/15`} />
            <Stat label="Dossiers terminés" value={`${v.summary.finished}/15`} hint="Terminé ne veut pas dire maîtrisé." />
            <Stat label="Dernier dossier consulté" value={last ? <UnitTag unit={last} className="text-base" /> : '—'} hint={last ? last.title : 'Aucun pour l’instant'} />
            <Stat label="Résultats évalués" value={`${v.evaluated.length}/${totalOutcomes}`} hint="Résultats attendus ayant reçu un niveau." />
            <Stat
              label="À retravailler"
              value={v.toRework.length}
              accent={v.toRework.length ? 'text-m1' : undefined}
              hint={v.toRework.length ? v.toRework.map((r) => r.unit.kind === 'dossier' ? `D${r.unit.number}` : `S${r.unit.number}`).filter((x, i, a) => a.indexOf(x) === i).join(', ') : 'Niveaux 1 ou 2 — aucun pour l’instant.'}
            />
            <div className="col-span-2 flex gap-3 rounded-2xl border border-dashed border-line-2 p-4 text-[0.85rem] text-ink-2 sm:col-span-1">
              <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
              <p>
                <strong>Progression</strong> = activités faites. <strong>Réussite</strong> = qualité des réponses. <strong>Maîtrise</strong> = niveau
                validé par ton professeur.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- Trois parties ---------------- */}
      <section aria-labelledby="parties">
        <SectionHeader id="parties" eyebrow="Le programme" title="Trois parties, un même magasin" />
        <div className="grid gap-4 md:grid-cols-3">
          {PARTS.map((p) => {
            const t = PART_THEME[p.id];
            const units = unitsOfPart(p.id);
            const done = units.filter((u) => v.statusOf(u) === 'termine').length;
            return (
              <Link
                key={p.id}
                to={`/dossiers?partie=${p.id}`}
                className={cx('card card-lift group relative flex flex-col overflow-hidden', t.bgSoft)}
              >
                <div className="flex items-start justify-between p-5 pb-0">
                  <span className={cx('font-display text-[3.2rem] leading-none font-extrabold', t.text)}>{p.number}</span>
                  <span className={cx('rounded-full px-3 py-1 text-[0.75rem] font-bold text-white', t.bg)}>{t.name}</span>
                </div>
                <PartIllustration partId={p.id} className="mx-auto -mt-2 h-36 w-auto" />
                <div className="flex flex-1 flex-col gap-2 border-t border-ink/10 bg-card/80 p-5">
                  <h3 className="text-[1.15rem] font-bold">{p.title}</h3>
                  <p className="text-[0.9rem] text-ink-2">{p.tagline}</p>
                  <div className="mt-auto flex items-center justify-between pt-2 text-[0.85rem] font-bold">
                    <span className="text-ink-3">
                      {units.filter((u) => u.kind === 'dossier').length} dossiers
                      {units.some((u) => u.kind === 'scenario') ? ' + 1 scénario' : ''} · {done} terminé{done > 1 ? 's' : ''}
                    </span>
                    <ArrowRight className={cx('size-5 transition-transform group-hover:translate-x-1', t.text)} aria-hidden />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ---------------- Mes dossiers ---------------- */}
      <section aria-labelledby="dossiers">
        <SectionHeader
          id="dossiers"
          eyebrow="Mes dossiers"
          title="Prochaines étapes"
          action={
            <ButtonLink to="/dossiers" variant="secondary">
              Catalogue complet <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {preview.map((u) => (
            <UnitCard key={u.id} unit={u} />
          ))}
        </div>
      </section>

      {/* ---------------- Compétences ---------------- */}
      <section aria-labelledby="competences">
        <SectionHeader
          id="competences"
          eyebrow="Mes compétences"
          title="Ce sur quoi tu seras évalué"
          action={
            <ButtonLink to="/competences" variant="secondary">
              Détail des compétences <ArrowRight className="size-4" aria-hidden />
            </ButtonLink>
          }
        />
        <div className="grid gap-4 md:grid-cols-3">
          {META_COMPETENCES.map((m, i) => {
            const refs = outcomesOfMeta(m.id);
            const d = distribution(refs.map((r) => v.levelOf(r.outcome.id)));
            const pid = PARTS[i].id;
            return (
              <Link key={m.id} to={`/competences?mc=${m.id}`} className="card card-lift flex flex-col gap-3 p-5">
                <span className={cx('size-3 rounded-full', PART_THEME[pid].bg)} aria-hidden />
                <h3 className="text-[1.05rem] font-bold">{m.label}</h3>
                <MasteryStack counts={d} label={`Répartition des niveaux pour ${m.label}`} />
                <p className="text-[0.85rem] text-ink-3">
                  {d.total - d.ne === 0
                    ? `${d.total} résultats attendus · aucun encore évalué`
                    : `${d.total - d.ne} évalué${d.total - d.ne > 1 ? 's' : ''} sur ${d.total} · ${d.l1 + d.l2} à retravailler`}
                </p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
