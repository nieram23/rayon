import type { PlanTone, StorePlan } from '../../domain/chapter';
import { SafetySign } from './SafetySign';

/** Plan de magasin dessiné en SVG : pièces, rayons, repères lettrés et flèches de circulation. */
const FILL: Record<PlanTone, string> = {
  rose: '#f7d6dc',
  bleu: '#d6ecf3',
  violet: '#e1dcf2',
  jaune: '#fbefc9',
  vert: '#e1efd2',
  orange: '#f8d9c6',
  gris: '#e4e2dc',
  blanc: '#ffffff',
  froid: '#cfe3fb',
};
const ARROW: Record<string, string> = { ink: '#16181d', rouge: '#d4211c', vert: '#1d8a4a', bleu: '#2850a8' };
const U = 20; // pixels par unité dans le repère SVG

export function StorePlanView({ plan }: { plan: StorePlan }) {
  const W = plan.width * U;
  const H = plan.height * U;
  const label = plan.title ?? 'Plan du magasin';
  return (
    <figure className="flex flex-col gap-1.5">
      {plan.title && <p className="font-bold">{plan.title}</p>}
      <div className="overflow-hidden rounded-xl border border-line-2 bg-[#faf9f5] p-2">
        <svg viewBox={`-4 -4 ${W + 8} ${H + 8}`} className="h-auto w-full" role="img" aria-label={label}>
          <defs>
            {Object.entries(ARROW).map(([k, c]) => (
              <marker key={k} id={`arrow-${k}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M0 0 10 5 0 10z" fill={c} />
              </marker>
            ))}
          </defs>
          <rect x="0" y="0" width={W} height={H} fill="#fff" stroke="#16181d" strokeWidth="4" />
          {plan.areas.map((a, i) => {
            const x = a.x * U;
            const y = a.y * U;
            const w = a.w * U;
            const h = a.h * U;
            const vertical = h > w * 1.6 && w < 70;
            const fs = Math.max(11, Math.min(17, w / Math.max(4, (a.label ?? '').length * 0.62)));
            return (
              <g key={i}>
                <rect x={x} y={y} width={w} height={h} fill={FILL[a.tone ?? 'gris']} stroke="#16181d" strokeOpacity={a.dashed ? 0.6 : 0.85} strokeWidth={a.dashed ? 1.5 : 2} strokeDasharray={a.dashed ? '6 4' : undefined} rx="3" />
                {a.label && (
                  <text
                    x={x + w / 2}
                    y={y + h / 2 - (a.sub && !vertical ? 7 : 0)}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize={vertical ? 13 : fs}
                    fontWeight="700"
                    fill="#16181d"
                    transform={vertical ? `rotate(-90 ${x + w / 2} ${y + h / 2})` : undefined}
                  >
                    {a.label}
                  </text>
                )}
                {a.sub && !vertical && (
                  <text x={x + w / 2} y={y + h / 2 + 11} textAnchor="middle" dominantBaseline="middle" fontSize="11" fill="#3d4047">
                    {a.sub}
                  </text>
                )}
              </g>
            );
          })}
          {plan.arrows?.map((ar, i) => (
            <polyline
              key={i}
              points={ar.points.map(([px, py]) => `${px * U},${py * U}`).join(' ')}
              fill="none"
              stroke={ARROW[ar.tone ?? 'ink']}
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="10 6"
              markerEnd={`url(#arrow-${ar.tone ?? 'ink'})`}
            />
          ))}
          {plan.marks?.map((m, i) => {
            const x = m.x * U;
            const y = m.y * U;
            if (m.kind === 'lettre')
              return (
                <g key={i}>
                  <circle cx={x} cy={y} r="15" fill="#16181d" />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="16" fontWeight="800" fill="#fff">
                    {m.label}
                  </text>
                </g>
              );
            if (m.kind === 'sortie' || m.kind === 'extincteur')
              return (
                <foreignObject key={i} x={x - 14} y={y - 14} width="28" height="28">
                  <SafetySign sign={m.kind} size={28} />
                </foreignObject>
              );
            if (m.kind === 'caisse')
              return (
                <g key={i}>
                  <rect x={x - 18} y={y - 10} width="36" height="20" rx="3" fill="#16181d" />
                  <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="700" fill="#fff">
                    {m.label ?? 'Caisse'}
                  </text>
                </g>
              );
            return (
              <g key={i}>
                <rect x={x - 34} y={y - 9} width="68" height="18" fill="#fff" />
                <text x={x} y={y + 1} textAnchor="middle" dominantBaseline="middle" fontSize="12" fontWeight="800" fill="#16181d">
                  {m.label ?? 'ENTRÉE'}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      {plan.legend && <figcaption className="text-[0.85rem] text-ink-3">{plan.legend}</figcaption>}
    </figure>
  );
}
