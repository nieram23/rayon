import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardPen, Eye, Lightbulb, RotateCcw, Save, XCircle } from 'lucide-react';
import type { Activity, ActivityAnswer, AnswerValue } from '../../domain/chapter';
import { checkActivity, writtenCount, type CheckResult } from '../../domain/check';
import { saveAnswer } from '../../services/chapterStore';
import { useApp } from '../../state/AppContext';
import { cx } from '../../lib/theme';
import { Button, Pill } from '../ui';
import { ActivityBody } from './ActivityBody';

const HELP_LABEL = ['Indice', 'Rappel de méthode', 'Aide détaillée'];

export function ActivityCard({ unitId, activity, initial }: { unitId: string; activity: Activity; initial?: ActivityAnswer }) {
  const { bumpData } = useApp();
  const [values, setValues] = useState<Record<string, AnswerValue>>(initial?.values ?? {});
  const [attempts, setAttempts] = useState(initial?.attempts ?? 0);
  const [helpsUsed, setHelpsUsed] = useState(initial?.helpsUsed ?? 0);
  const [submitted, setSubmitted] = useState(!!initial?.submitted);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [checkedValues, setCheckedValues] = useState<Record<string, AnswerValue>>({});
  const [showCorrection, setShowCorrection] = useState(false);
  const open = activity.kind === 'open';

  // Recharge la dernière vérification enregistrée (affichage du score uniquement).
  const lastScore = initial?.total ? `${initial.correct}/${initial.total}` : null;

  const persist = (patch: Partial<ActivityAnswer>) => {
    const ans: ActivityAnswer = {
      values,
      attempts,
      helpsUsed,
      submitted,
      correct: result?.correct ?? initial?.correct,
      total: result?.total ?? initial?.total,
      updatedAt: new Date().toISOString(),
      ...patch,
    };
    saveAnswer(unitId, activity.id, ans);
    bumpData();
  };

  // Brouillon : enregistré à chaque saisie (léger délai).
  useEffect(() => {
    const t = window.setTimeout(() => {
      if (Object.keys(values).length) saveAnswer(unitId, activity.id, {
        values,
        attempts,
        helpsUsed,
        submitted: open ? submitted : undefined,
        correct: result?.correct ?? initial?.correct,
        total: result?.total ?? initial?.total,
        updatedAt: new Date().toISOString(),
      });
    }, 400);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const setValue = (k: string, v: AnswerValue) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (open && submitted) setSubmitted(false);
  };

  /** Marque visible uniquement si la valeur n'a pas changé depuis la vérification. */
  const marks = useMemo(() => {
    const m: Record<string, { ok: boolean; expected?: string }> = {};
    if (!result) {
      if (attempts > 0) (m as Record<string, unknown>).__reveal = { ok: true };
      return m;
    }
    for (const [k, r] of Object.entries(result.items)) {
      if (JSON.stringify(values[k]) !== JSON.stringify(checkedValues[k])) continue;
      m[k] = { ok: r.ok, expected: showCorrection && !r.ok ? r.expected : undefined };
    }
    if (attempts > 0) (m as Record<string, unknown>).__reveal = { ok: true };
    return m;
  }, [result, values, checkedValues, showCorrection, attempts]);

  function verify() {
    const r = checkActivity(activity, values);
    const a = attempts + 1;
    setResult(r);
    setCheckedValues(values);
    setAttempts(a);
    persist({ attempts: a, correct: r.correct, total: r.total });
  }

  function submitOpen() {
    setSubmitted(true);
    persist({ submitted: true, attempts: attempts + 1 });
    setAttempts((x) => x + 1);
  }

  function revealHelp() {
    const n = Math.min(3, helpsUsed + 1);
    setHelpsUsed(n);
    persist({ helpsUsed: n });
  }

  const wrong = result ? Object.entries(result.items).filter(([, r]) => !r.ok) : [];
  const allOk = result && wrong.length === 0;
  const empty = result ? wrong.filter(([, r]) => r.empty).length : 0;

  return (
    <section aria-labelledby={`${activity.id}-t`} className="card overflow-hidden">
      <header className="flex flex-wrap items-center gap-3 border-b border-line bg-[#eaf1fb] px-4 py-3 sm:px-5">
        <span className="rounded-full bg-p3 px-3 py-1 text-[0.78rem] font-extrabold tracking-wide text-white uppercase">{activity.label}</span>
        <h3 id={`${activity.id}-t`} className="min-w-0 flex-1 text-[1.08rem] font-bold">
          {activity.title}
        </h3>
        {open ? (
          <Pill className={submitted ? 'bg-p1-soft text-p1-dark' : 'bg-white text-ink-3 border border-line'}>
            {submitted ? 'Enregistrée · à corriger par ton professeur' : 'Production rédigée'}
          </Pill>
        ) : (
          attempts > 0 && <Pill className="bg-white border border-line text-ink-2">Tentative{attempts > 1 ? 's' : ''} : {attempts}{!result && lastScore ? ` · dernier score ${lastScore}` : ''}</Pill>
        )}
      </header>

      <div className="flex flex-col gap-4 p-4 sm:p-5">
        <p className="flex gap-2 font-bold">
          <ClipboardPen className="mt-0.5 size-5 shrink-0 text-p3" aria-hidden /> {activity.instructions}
        </p>

        <ActivityBody activity={activity} values={values} setValue={setValue} marks={marks} />

        {/* Aides */}
        <div className="flex flex-col gap-2 rounded-xl border border-dashed border-line-2 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Lightbulb className="size-4 text-[#9a7a1f]" aria-hidden />
            <span className="text-[0.9rem] font-bold">Besoin d’aide ?</span>
            {helpsUsed < 3 && (
              <Button variant="ghost" className="min-h-9 px-3 text-[0.85rem] underline underline-offset-4" onClick={revealHelp}>
                Afficher : {HELP_LABEL[helpsUsed].toLowerCase()} ({helpsUsed + 1}/3)
              </Button>
            )}
          </div>
          {activity.helps.slice(0, helpsUsed).map((h, i) => (
            <p key={i} className="animate-rise rounded-lg bg-tag-soft px-3 py-2 text-[0.92rem]">
              <strong>{HELP_LABEL[i]} : </strong>
              {h}
            </p>
          ))}
        </div>

        {/* Vérification */}
        {open ? (
          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={submitOpen} disabled={submitted || !Object.values(values).some((v) => typeof v === 'string' && v.trim().length > 0)}>
              <Save className="size-4" aria-hidden /> {submitted ? 'Réponse enregistrée' : 'Enregistrer ma réponse'}
            </Button>
            <p className="text-[0.85rem] text-ink-3">Pas de correction automatique : une réponse rédigée ne peut pas être évaluée de façon fiable par la plateforme.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              <Button onClick={verify}>
                <CheckCircle2 className="size-4" aria-hidden /> {attempts ? 'Vérifier à nouveau' : 'Vérifier mes réponses'}
              </Button>
              {result && !allOk && attempts >= 2 && !showCorrection && (
                <Button variant="secondary" onClick={() => setShowCorrection(true)}>
                  <Eye className="size-4" aria-hidden /> Afficher la correction
                </Button>
              )}
              {result && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setValues({});
                    setResult(null);
                    setShowCorrection(false);
                  }}
                >
                  <RotateCcw className="size-4" aria-hidden /> Tout effacer
                </Button>
              )}
            </div>
            {result && (
              <div
                role="status"
                className={cx('animate-rise rounded-xl p-4', allOk ? 'bg-p1-soft' : 'bg-m2/12')}
              >
                <p className="flex items-center gap-2 font-bold">
                  {allOk ? <CheckCircle2 className="size-5 text-p1-dark" aria-hidden /> : <XCircle className="size-5 text-[#9a6210]" aria-hidden />}
                  {result.total === 0
                    ? 'Réponses enregistrées. Compare chacune avec le corrigé affiché sous ta réponse, puis complète-la si besoin.'
                    : allOk
                    ? `Tout est juste : ${result.correct}/${result.total}.${writtenCount(activity) ? ' Compare aussi tes réponses rédigées avec le corrigé.' : ''}`
                    : `${result.correct}/${result.total} réponses justes.${empty ? ` ${empty} sans réponse.` : ''} Corrige les cases marquées en orange.`}
                </p>
                {!allOk && attempts < 2 && <p className="mt-1 text-[0.88rem] text-ink-2">Relis les explications ci-dessous et réessaie. La correction pourra être affichée à partir de la 2e tentative.</p>}
                <ul className="mt-3 flex flex-col gap-2">
                  {(allOk ? Object.entries(result.items) : wrong)
                                        .slice(0, allOk ? 12 : 8)
                    .map(([k, r]) => (
                      <li key={k} className="text-[0.92rem]">
                        <span className="font-bold">{allOk ? '✓ ' : '→ '}{r.label} : </span>
                        {allOk || showCorrection ? r.explain : hintFrom(r.explain)}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

/** Avant d'afficher la correction, on ne donne que la règle (la phrase avant les deux-points ou le calcul). */
function hintFrom(explain: string): string {
  const cut = explain.split(/ : |=/)[0];
  return cut.length < explain.length ? `${cut.trim()}…` : 'Vérifie cette réponse à l’aide des documents.';
}
