import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { CircleDashed, FlaskConical, HardDrive, Lock, CheckCircle2, PlayCircle, Circle } from 'lucide-react';
import { MASTERY_LEVELS, unitCode } from '../../content';
import type { Availability, DataMode, LearningUnit, MasteryValue, PartId, ProgressStatus } from '../../domain/types';
import { STATUS_LABEL } from '../../domain/progress';
import { MASTERY_THEME, PART_THEME, cx, masteryCode } from '../../lib/theme';
import { getBackend } from '../../services/cloud';

const CLOUD_ON = !!getBackend();

/* ------------------------------------------------------------------ */
/* Boutons                                                            */
/* ------------------------------------------------------------------ */

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
const BTN_BASE =
  'inline-flex items-center justify-center gap-2 rounded-full font-bold transition-[background,box-shadow,transform] active:translate-y-px disabled:opacity-50 disabled:pointer-events-none min-h-11 px-5 text-[0.95rem]';
const BTN_VARIANT: Record<Variant, string> = {
  primary: 'bg-ink text-paper hover:bg-ink-2 shadow-[0_2px_0_#000]',
  secondary: 'bg-card text-ink border border-line-2 hover:border-ink',
  ghost: 'text-ink hover:bg-ink/5',
  danger: 'bg-m1 text-white hover:bg-[#a92c23]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }>(
  ({ variant = 'primary', className, type = 'button', ...rest }, ref) => (
    <button ref={ref} type={type} className={cx(BTN_BASE, BTN_VARIANT[variant], className)} {...rest} />
  ),
);
Button.displayName = 'Button';

export function ButtonLink({ variant = 'primary', className, ...rest }: LinkProps & { variant?: Variant }) {
  return <Link className={cx(BTN_BASE, BTN_VARIANT[variant], className)} {...rest} />;
}

/* ------------------------------------------------------------------ */
/* Étiquettes et badges                                               */
/* ------------------------------------------------------------------ */

export function UnitTag({ unit, className }: { unit: LearningUnit; className?: string }) {
  const scenario = unit.kind === 'scenario';
  return (
    <span
      className={cx('price-tag', scenario ? 'bg-tag text-ink' : PART_THEME[unit.partId].tag, className)}
      aria-label={scenario ? `Scénario ${unit.number}` : `Dossier ${unit.number}`}
    >
      {unitCode(unit)}
    </span>
  );
}

export function Pill({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span className={cx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.78rem] font-bold leading-none', className)}>
      {children}
    </span>
  );
}

export function AvailabilityBadge({ value, demo }: { value: Availability; demo?: boolean }) {
  if (value === 'disponible')
    return (
      <Pill className="bg-p1-soft text-p1-dark">
        <span className="size-2 rounded-full bg-p1" aria-hidden /> Disponible{demo ? ' (démo)' : ''}
      </Pill>
    );
  return (
    <Pill className="bg-ink/6 text-ink-2">
      <Lock className="size-3.5" aria-hidden /> Prochainement disponible
    </Pill>
  );
}

const STATUS_ICON: Record<ProgressStatus, typeof Circle> = {
  'non-commence': Circle,
  'en-cours': PlayCircle,
  termine: CheckCircle2,
};

export function StatusBadge({ status }: { status: ProgressStatus }) {
  const Icon = STATUS_ICON[status];
  const cls =
    status === 'termine' ? 'bg-ink text-paper' : status === 'en-cours' ? 'bg-tag-soft text-[#7a5a0c]' : 'bg-white border border-line text-ink-3';
  return (
    <Pill className={cls}>
      <Icon className="size-3.5" aria-hidden /> {STATUS_LABEL[status]}
    </Pill>
  );
}

export function PartPill({ partId, label }: { partId: PartId; label?: string }) {
  const t = PART_THEME[partId];
  return (
    <Pill className={cx(t.bgSoft, t.textDark)}>
      <span className={cx('size-2 rounded-full', t.bg)} aria-hidden />
      {label ?? `Partie ${partId.slice(1)}`}
    </Pill>
  );
}

/* ------------------------------------------------------------------ */
/* Mode de données : toujours visible                                 */
/* ------------------------------------------------------------------ */

export function DataModeTag({ mode, className }: { mode: DataMode | 'demo-enseignant'; className?: string }) {
  if (mode === 'local')
    return (
      <Pill className={cx('bg-white border border-line text-ink-2', className)}>
        <HardDrive className="size-3.5" aria-hidden /> {CLOUD_ON ? 'Mes données' : 'Données locales'}
      </Pill>
    );
  return (
    <Pill className={cx('bg-tag text-ink', className)}>
      <FlaskConical className="size-3.5" aria-hidden /> Démonstration · données simulées
    </Pill>
  );
}

/* ------------------------------------------------------------------ */
/* Progression                                                        */
/* ------------------------------------------------------------------ */

export function ProgressBar({ value, partId, label, className }: { value: number; partId?: PartId; label: string; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <div
      className={cx('h-2 w-full overflow-hidden rounded-full bg-ink/8', className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
    >
      <div className={cx('h-full rounded-full transition-[width] duration-700', partId ? PART_THEME[partId].bar : 'bg-ink')} style={{ width: `${v * 100}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 92, label }: { value: number; size?: number; label: string }) {
  const r = (size - 12) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${label} : ${Math.round(v * 100)} %`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={10} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          className="transition-[stroke-dashoffset] duration-700"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center font-display text-xl font-bold">{Math.round(v * 100)}%</span>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Maîtrise                                                           */
/* ------------------------------------------------------------------ */

export function MasteryChip({ value, origin, compact }: { value: MasteryValue; origin?: 'enseignant' | 'indicatif'; compact?: boolean }) {
  const code = masteryCode(value);
  const def = MASTERY_LEVELS.find((l) => l.code === code)!;
  const t = MASTERY_THEME[code];
  return (
    <span
      className={cx('inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full py-1 pr-2.5 pl-1 text-[0.8rem] font-bold leading-none', t.soft)}
      title={origin === 'indicatif' ? `${def.label} — niveau indicatif, non validé par l'enseignant` : def.label}
    >
      <span
        className={cx(
          'grid size-6 place-items-center rounded-full text-[0.72rem]',
          code === 'NE' ? 'text-ink-3' : cx(t.bg, 'text-white'),
        )}
        aria-hidden
      >
        {code === 'NE' ? <CircleDashed className="size-4" /> : code}
      </span>
      <span className={code === 'NE' ? 'text-ink-3' : t.text}>{compact && code !== 'NE' ? `Niv. ${code}` : def.label}</span>
      {origin === 'indicatif' && <span className="font-normal text-ink-3">· indicatif</span>}
    </span>
  );
}

export function MasteryLegend({ className }: { className?: string }) {
  return (
    <ul className={cx('grid gap-2 sm:grid-cols-5', className)}>
      {MASTERY_LEVELS.map((l) => (
        <li key={l.code} className="rounded-xl border border-line bg-card p-3">
          <MasteryChip value={l.level} />
          <p className="mt-2 text-[0.82rem] leading-snug text-ink-2">{l.description}</p>
        </li>
      ))}
    </ul>
  );
}

/** Barre empilée de répartition des niveaux. */
export function MasteryStack({ counts, label }: { counts: { ne: number; l1: number; l2: number; l3: number; l4: number; total: number }; label: string }) {
  const segs: Array<[string, number, string]> = [
    ['bg-m1', counts.l1, 'niveau 1'],
    ['bg-m2', counts.l2, 'niveau 2'],
    ['bg-m3', counts.l3, 'niveau 3'],
    ['bg-m4', counts.l4, 'niveau 4'],
    ['hatch bg-ink/5', counts.ne, 'non évalué'],
  ];
  const desc = segs.map(([, n, l]) => `${n} ${l}`).join(', ');
  return (
    <div className="flex h-3 w-full overflow-hidden rounded-full bg-ink/5" role="img" aria-label={`${label} : ${desc}`}>
      {counts.total > 0 &&
        segs.map(([cls, n, l]) => (n > 0 ? <div key={l} className={cls} style={{ width: `${(n / counts.total) * 100}%` }} /> : null))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Structure                                                          */
/* ------------------------------------------------------------------ */

export function SectionHeader({ eyebrow, title, action, id }: { eyebrow?: string; title: string; action?: ReactNode; id?: string }) {
  return (
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow mb-1">{eyebrow}</p>}
        <h2 id={id} className="text-[1.45rem] font-bold sm:text-[1.65rem]">
          {title}
        </h2>
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, children, action }: { icon: ReactNode; title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="card hatch flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-card text-ink-2 shadow-[var(--shadow-card)]">{icon}</div>
      <h3 className="text-lg font-bold">{title}</h3>
      {children && <div className="max-w-md text-[0.95rem] text-ink-2">{children}</div>}
      {action}
    </div>
  );
}

export function Stat({ label, value, hint, accent }: { label: string; value: ReactNode; hint?: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-4">
      <p className="text-[0.8rem] font-bold text-ink-3">{label}</p>
      <p className={cx('mt-1 font-display text-[1.9rem] leading-none font-bold', accent)}>{value}</p>
      {hint && <p className="mt-2 text-[0.8rem] leading-snug text-ink-3">{hint}</p>}
    </div>
  );
}

/** Groupe de filtres accessible (boutons à bascule). */
export function FilterGroup<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Array<{ value: T; label: string; count?: number; dot?: string }>;
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cx(
              'inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-bold transition-colors',
              active ? 'border-ink bg-ink text-paper' : 'border-line-2 bg-card text-ink-2 hover:border-ink',
            )}
          >
            {o.dot && <span className={cx('size-2 rounded-full', o.dot)} aria-hidden />}
            {o.label}
            {o.count !== undefined && (
              <span className={cx('rounded-full px-1.5 text-[0.75rem]', active ? 'bg-paper/20' : 'bg-ink/6')}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
