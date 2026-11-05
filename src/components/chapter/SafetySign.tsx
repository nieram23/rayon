import type { ReactNode } from 'react';
import type { SignKey } from '../../domain/chapter';

/**
 * Pictogrammes de sécurité dessinés pour Rayon (formes normalisées :
 * cercle bleu = obligation, cercle barré rouge = interdiction,
 * triangle jaune = danger, rectangle vert = évacuation).
 */
const INK = '#16181d';

function Forklift({ x = 0, y = 0, s = 1, color = INK }: { x?: number; y?: number; s?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} fill={color} stroke={color}>
      <rect x="10" y="22" width="20" height="12" rx="2" />
      <path d="M14 22V12h10l4 10" fill="none" strokeWidth="2.5" />
      <rect x="31" y="6" width="2.5" height="30" />
      <rect x="31" y="33" width="12" height="2.5" />
      <circle cx="14" cy="37" r="4" />
      <circle cx="27" cy="37" r="4" />
    </g>
  );
}

function Prohibit({ children }: { children: ReactNode }) {
  return (
    <>
      <circle cx="50" cy="50" r="44" fill="#fff" stroke="#d4211c" strokeWidth="9" />
      {children}
      <line x1="19" y1="19" x2="81" y2="81" stroke="#d4211c" strokeWidth="9" />
    </>
  );
}

function FireSquare({ children }: { children: ReactNode }) {
  return (
    <>
      <rect x="6" y="6" width="88" height="88" rx="6" fill="#d4211c" />
      {children}
    </>
  );
}

function Danger({ children }: { children: ReactNode }) {
  return (
    <>
      <path d="M50 8 94 88H6z" fill="#f2c14e" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      {children}
    </>
  );
}

const SIGNS: Record<SignKey, () => JSX.Element> = {
  extincteur: () => (
    <FireSquare>
      <rect x="40" y="34" width="20" height="46" rx="6" fill="#fff" />
      <rect x="45" y="24" width="10" height="10" fill="#fff" />
      <path d="M55 28h14l6 8" stroke="#fff" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M22 70c4-10 8-6 8-16 6 6 8 12 4 20z" fill="#fff" />
    </FireSquare>
  ),
  alarme: () => (
    <FireSquare>
      <rect x="22" y="22" width="56" height="56" rx="4" fill="#fff" />
      <circle cx="50" cy="50" r="16" fill="#d4211c" />
      <path d="M40 72c6-4 14-4 20 0" stroke="#d4211c" strokeWidth="4" fill="none" />
    </FireSquare>
  ),
  'sol-glissant': () => (
    <Danger>
      <circle cx="56" cy="42" r="5" fill={INK} />
      <path d="M52 50 44 62l12 6M48 56l-12 6M44 62l-6 12" stroke={INK} strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M26 78h48" stroke={INK} strokeWidth="4" />
    </Danger>
  ),
  electrique: () => (
    <Danger>
      <path d="M54 32 38 60h12l-6 20 18-30H50z" fill={INK} />
    </Danger>
  ),
  gants: () => (
    <>
      <circle cx="50" cy="50" r="46" fill="#2850a8" />
      <path d="M36 78V44c0-3 5-3 5 0v-12c0-3 5-3 5 0v-4c0-3 5-3 5 0v4c0-3 5-3 5 0v16l4-6c2-3 6-1 5 2l-7 16v18z" fill="#fff" />
    </>
  ),
  'entree-interdite': () => (
    <Prohibit>
      <circle cx="50" cy="30" r="6" fill={INK} />
      <path d="M50 38v22M50 60l-8 16M50 60l8 16M40 46h20" stroke={INK} strokeWidth="6" strokeLinecap="round" />
    </Prohibit>
  ),
  fumer: () => (
    <Prohibit>
      <rect x="22" y="52" width="46" height="10" fill={INK} />
      <rect x="70" y="52" width="8" height="10" fill="#d4211c" />
      <path d="M72 46c-4-6 4-8 0-16" stroke={INK} strokeWidth="3" fill="none" />
    </Prohibit>
  ),
  rassemblement: () => (
    <>
      <rect x="6" y="6" width="88" height="88" rx="6" fill="#1d8a4a" />
      {[
        [30, 30],
        [70, 30],
        [30, 70],
        [70, 70],
      ].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y}L50 50`} stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      ))}
      <circle cx="50" cy="44" r="5" fill="#fff" />
      <circle cx="42" cy="54" r="4" fill="#fff" />
      <circle cx="58" cy="54" r="4" fill="#fff" />
    </>
  ),
  chaussures: () => (
    <>
      <circle cx="50" cy="50" r="46" fill="#2850a8" />
      <path d="M30 28h16v26l20 6c5 1.5 8 5 8 10v4H28z" fill="#fff" />
      <rect x="28" y="74" width="46" height="5" fill="#fff" />
    </>
  ),
  telephone: () => (
    <Prohibit>
      <rect x="38" y="24" width="24" height="46" rx="4" fill={INK} />
      <rect x="42" y="30" width="16" height="26" fill="#fff" />
      <path d="M64 22c4 3 4 9 0 12M68 18c7 5 7 15 0 20" stroke={INK} strokeWidth="2.5" fill="none" />
    </Prohibit>
  ),
  'danger-chariots': () => (
    <>
      <path d="M50 8 94 88H6z" fill="#f2c14e" stroke={INK} strokeWidth="6" strokeLinejoin="round" />
      <Forklift x={27} y={40} s={1} />
    </>
  ),
  stockage: () => (
    <Prohibit>
      <rect x="28" y="30" width="44" height="40" fill="none" stroke={INK} strokeWidth="4" />
      <path d="M28 50h44M43 30v40M57 30v40" stroke={INK} strokeWidth="3" />
    </Prohibit>
  ),
  chariots: () => (
    <Prohibit>
      <Forklift x={26} y={28} s={1.05} />
    </Prohibit>
  ),
  gauche: () => (
    <Prohibit>
      <path d="M58 76V46H36" fill="none" stroke={INK} strokeWidth="8" />
      <path d="M40 34 26 46l14 12z" fill={INK} />
    </Prohibit>
  ),
  monter: () => (
    <Prohibit>
      <Forklift x={24} y={36} s={1} />
      <circle cx="40" cy="30" r="4" fill={INK} />
      <path d="M40 34v10" stroke={INK} strokeWidth="4" />
      <circle cx="54" cy="28" r="4" fill="#d4211c" />
      <path d="M54 32v12" stroke="#d4211c" strokeWidth="4" />
    </Prohibit>
  ),
  sortie: () => (
    <>
      <rect x="2" y="18" width="96" height="64" rx="4" fill="#1d8a4a" />
      <rect x="10" y="28" width="22" height="44" fill="none" stroke="#fff" strokeWidth="4" />
      <path d="M40 50h18M40 50l8-7M40 50l8 7" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" />
      <circle cx="76" cy="32" r="5" fill="#fff" />
      <path d="M74 40 66 52l8 4-4 14M74 40l10 10 6-4M70 56l10 6" stroke="#fff" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
};

export function SafetySign({ sign, size = 84, label }: { sign: SignKey; size?: number; label?: string }) {
  const S = SIGNS[sign];
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      <S />
    </svg>
  );
}
