import type { PartId } from '../../domain/types';

/**
 * Illustrations originales en SVG (aucune ressource externe).
 * Style : aplats, trait encre, palette des parties.
 */

const INK = '#16181d';

export function LogoMark({ size = 32, invert = false }: { size?: number; invert?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
      <rect width="32" height="32" rx="8" fill={INK} stroke={invert ? '#fffdf8' : INK} strokeOpacity={invert ? 0.35 : 1} />
      <rect x="7" y="8" width="18" height="3.5" rx="1.75" fill="#1f8a70" />
      <rect x="7" y="14.25" width="13" height="3.5" rx="1.75" fill="#e0623a" />
      <rect x="7" y="20.5" width="16" height="3.5" rx="1.75" fill="#3f63c9" />
    </svg>
  );
}

export function Logo({ subtitle = true, invert = false }: { subtitle?: boolean; invert?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark invert={invert} />
      <span className="flex flex-col leading-none">
        <span className={`font-display text-[1.35rem] font-extrabold tracking-tight ${invert ? 'text-paper' : 'text-ink'}`}>rayon</span>
        {subtitle && <span className={`mt-0.5 text-[0.62rem] font-bold tracking-[0.14em] uppercase ${invert ? 'text-paper/60' : 'text-ink-3'}`}>Bac Pro MCV · A</span>}
      </span>
    </span>
  );
}

/** Partie 1 — réserve : étagère, cartons, palette, bloc de contrôle. */
function Reserve() {
  return (
    <g>
      <rect x="18" y="20" width="148" height="118" rx="4" fill="#fffdf8" stroke={INK} strokeWidth="3" />
      {[58, 98].map((y) => (
        <rect key={y} x="18" y={y} width="148" height="5" fill={INK} />
      ))}
      <rect x="30" y="30" width="34" height="28" fill="#c9a26b" stroke={INK} strokeWidth="2.5" />
      <rect x="40" y="30" width="14" height="8" fill="#e8c999" />
      <rect x="70" y="36" width="28" height="22" fill="#d9b47e" stroke={INK} strokeWidth="2.5" />
      <rect x="106" y="26" width="50" height="32" fill="#1f8a70" stroke={INK} strokeWidth="2.5" />
      <path d="M118 42h26" stroke="#fffdf8" strokeWidth="3" strokeLinecap="round" />
      <rect x="28" y="68" width="22" height="30" fill="#fffdf8" stroke={INK} strokeWidth="2.5" />
      <rect x="54" y="68" width="22" height="30" fill="#fffdf8" stroke={INK} strokeWidth="2.5" />
      <rect x="80" y="74" width="40" height="24" fill="#c9a26b" stroke={INK} strokeWidth="2.5" />
      <rect x="126" y="64" width="30" height="34" fill="#e2f1eb" stroke={INK} strokeWidth="2.5" />
      <rect x="30" y="110" width="56" height="28" fill="#d9b47e" stroke={INK} strokeWidth="2.5" />
      <rect x="96" y="114" width="58" height="24" fill="#1f8a70" stroke={INK} strokeWidth="2.5" />
      {/* bloc de contrôle */}
      <g transform="translate(160 76) rotate(8)">
        <rect width="54" height="70" rx="5" fill="#f2c14e" stroke={INK} strokeWidth="3" />
        <rect x="16" y="-6" width="22" height="10" rx="3" fill={INK} />
        {[18, 32, 46].map((y, i) => (
          <g key={y}>
            <path d={`M10 ${y}l4 4 7-8`} stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity={i === 2 ? 0 : 1} />
            <rect x="9" y={y - 5} width="13" height="12" rx="2" fill="none" stroke={INK} strokeWidth="2" opacity={i === 2 ? 1 : 0} />
            <path d={`M27 ${y}h18`} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
          </g>
        ))}
      </g>
    </g>
  );
}

/** Partie 2 — vitrine : façade, store, mannequin produit, étiquettes. */
function Vitrine() {
  return (
    <g>
      <rect x="20" y="40" width="190" height="104" rx="4" fill="#fffdf8" stroke={INK} strokeWidth="3" />
      <path d="M14 22h202l-8 26H22z" fill="#e0623a" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path key={i} d={`M${22 + i * 31} 48 q15 14 31 0`} fill={i % 2 ? '#fffdf8' : '#e0623a'} stroke={INK} strokeWidth="2.5" />
      ))}
      <rect x="32" y="66" width="112" height="66" rx="3" fill="#fbe7de" stroke={INK} strokeWidth="2.5" />
      <rect x="44" y="110" width="88" height="10" fill={INK} />
      <circle cx="66" cy="96" r="12" fill="#f2c14e" stroke={INK} strokeWidth="2.5" />
      <path d="M86 108V80l14-8 14 8v28z" fill="#3f63c9" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
      <rect x="118" y="88" width="16" height="20" rx="2" fill="#1f8a70" stroke={INK} strokeWidth="2.5" />
      <rect x="154" y="66" width="44" height="78" rx="2" fill="#e5ebfa" stroke={INK} strokeWidth="2.5" />
      <circle cx="190" cy="108" r="3" fill={INK} />
      <g transform="translate(118 58) rotate(-12)">
        <path d="M0 0h30l8 9-8 9H0z" fill="#f2c14e" stroke={INK} strokeWidth="2.5" strokeLinejoin="round" />
        <circle cx="29" cy="9" r="2.5" fill={INK} />
        <path d="M6 9h14" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </g>
  );
}

/** Partie 3 — clientèle : téléphone, bulles, magasin repéré, contacts reliés. */
function Clientele() {
  return (
    <g>
      <path d="M40 120 C 70 70, 120 150, 170 70" stroke={INK} strokeWidth="2.5" strokeDasharray="5 6" fill="none" />
      <rect x="22" y="34" width="66" height="112" rx="12" fill={INK} />
      <rect x="28" y="44" width="54" height="88" rx="6" fill="#fffdf8" />
      <rect x="34" y="52" width="36" height="14" rx="7" fill="#3f63c9" />
      <rect x="44" y="72" width="32" height="14" rx="7" fill="#e5ebfa" stroke={INK} strokeWidth="2" />
      <rect x="34" y="92" width="28" height="14" rx="7" fill="#3f63c9" />
      <path d="M44 116h22" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <g transform="translate(150 22)">
        <path d="M22 0c12 0 22 9 22 21 0 16-22 37-22 37S0 37 0 21C0 9 10 0 22 0z" fill="#3f63c9" stroke={INK} strokeWidth="3" />
        <rect x="11" y="12" width="22" height="16" rx="2" fill="#fffdf8" stroke={INK} strokeWidth="2" />
        <path d="M9 14h26" stroke="#e0623a" strokeWidth="4" />
      </g>
      {[
        [120, 112, '#f2c14e'],
        [176, 128, '#1f8a70'],
        [206, 92, '#e0623a'],
      ].map(([x, y, c]) => (
        <g key={`${x}`}>
          <circle cx={x as number} cy={y as number} r="15" fill={c as string} stroke={INK} strokeWidth="2.5" />
          <circle cx={x as number} cy={(y as number) - 4} r="5" fill="#fffdf8" />
          <path d={`M${(x as number) - 8} ${(y as number) + 9} q8 -9 16 0`} fill="#fffdf8" />
        </g>
      ))}
      <path d="M135 112h26M190 120l10-16" stroke={INK} strokeWidth="2.5" />
    </g>
  );
}

const SCENES: Record<PartId, () => JSX.Element> = { p1: Reserve, p2: Vitrine, p3: Clientele };

export function PartIllustration({ partId, className }: { partId: PartId; className?: string }) {
  const Scene = SCENES[partId];
  return (
    <svg viewBox="0 0 230 160" className={className} role="img" aria-hidden>
      <Scene />
    </svg>
  );
}

/** Illustration d'accueil : allée de magasin en perspective, trois linéaires colorés. */
export function AisleIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 220" className={className} aria-hidden>
      <path d="M0 220 L130 96 L190 96 L320 220z" fill="#e9e3d4" />
      <path d="M130 96 L190 96" stroke={INK} strokeWidth="2" />
      {/* linéaire gauche */}
      <path d="M0 40 L120 80 L120 150 L0 210z" fill="#fffdf8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[
        ['#1f8a70', 0],
        ['#e0623a', 1],
        ['#3f63c9', 2],
      ].map(([c, i]) => {
        const n = i as number;
        const y0 = 70 + n * 45;
        const y1 = 95 + n * 18;
        return <path key={n} d={`M0 ${y0} L120 ${y1} L120 ${y1 + 6} L0 ${y0 + 12}z`} fill={c as string} stroke={INK} strokeWidth="2" />;
      })}
      {[0, 1, 2].map((n) =>
        [0, 1, 2, 3].map((k) => {
          const x = 12 + k * 26;
          const base = 70 + n * 45 - ((70 + n * 45) - (95 + n * 18)) * (x / 120);
          const h = 22 - k * 3;
          return <rect key={`${n}${k}`} x={x} y={base - h} width={16 - k * 2} height={h} fill={['#d9b47e', '#f2c14e', '#e5ebfa', '#fbe7de'][(n + k) % 4]} stroke={INK} strokeWidth="1.5" />;
        }),
      )}
      {/* linéaire droit */}
      <path d="M320 40 L200 80 L200 150 L320 210z" fill="#fffdf8" stroke={INK} strokeWidth="3" strokeLinejoin="round" />
      {[0, 1, 2].map((n) => {
        const y0 = 70 + n * 45;
        const y1 = 95 + n * 18;
        return <path key={n} d={`M320 ${y0} L200 ${y1} L200 ${y1 + 6} L320 ${y0 + 12}z`} fill={INK} opacity={0.85} />;
      })}
      {/* panneau suspendu */}
      <path d="M160 0 V 30" stroke={INK} strokeWidth="2" />
      <rect x="122" y="30" width="76" height="30" rx="6" fill="#f2c14e" stroke={INK} strokeWidth="3" />
      <path d="M138 45 h44" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      {/* chariot */}
      <g transform="translate(138 150)">
        <path d="M0 0 h8 l8 30 h30 l6 -22 h-40" fill="none" stroke={INK} strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="20" cy="40" r="4" fill={INK} />
        <circle cx="42" cy="40" r="4" fill={INK} />
        <rect x="18" y="0" width="14" height="10" fill="#e0623a" stroke={INK} strokeWidth="2" />
        <rect x="32" y="-4" width="10" height="14" fill="#3f63c9" stroke={INK} strokeWidth="2" />
      </g>
    </svg>
  );
}
