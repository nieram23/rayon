import { useState } from 'react';
import { Calculator as CalcIcon, X } from 'lucide-react';
import { cx } from '../../lib/theme';

/** Évalue une expression arithmétique simple sans eval (+ − × ÷ parenthèses, virgule décimale). */
export function evaluate(expr: string): number | null {
  const src = expr.replace(/,/g, '.').replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-').replace(/\s/g, '');
  let i = 0;
  const peek = () => src[i];
  function num(): number {
    if (peek() === '(') {
      i++;
      const v = add();
      if (peek() !== ')') throw new Error();
      i++;
      return v;
    }
    if (peek() === '-') {
      i++;
      return -num();
    }
    const m = /^\d+(\.\d+)?/.exec(src.slice(i));
    if (!m) throw new Error();
    i += m[0].length;
    let v = Number(m[0]);
    if (peek() === '%') {
      i++;
      v /= 100;
    }
    return v;
  }
  function mul(): number {
    let v = num();
    while (peek() === '*' || peek() === '/') {
      const op = src[i++];
      const r = num();
      v = op === '*' ? v * r : v / r;
    }
    return v;
  }
  function add(): number {
    let v = mul();
    while (peek() === '+' || peek() === '-') {
      const op = src[i++];
      const r = mul();
      v = op === '+' ? v + r : v - r;
    }
    return v;
  }
  try {
    if (!src) return null;
    const v = add();
    return i === src.length && Number.isFinite(v) ? v : null;
  } catch {
    return null;
  }
}

const KEYS = ['7', '8', '9', '÷', '4', '5', '6', '×', '1', '2', '3', '−', '0', ',', '%', '+', '(', ')', 'C', '='];

export function Calculator() {
  const [open, setOpen] = useState(false);
  const [expr, setExpr] = useState('');
  const [hist, setHist] = useState<string[]>([]);
  const res = evaluate(expr);
  const fmt = (n: number) => (Math.round(n * 10000) / 10000).toString().replace('.', ',');

  const press = (k: string) => {
    if (k === 'C') return setExpr('');
    if (k === '=') {
      if (res !== null) {
        setHist((h) => [`${expr} = ${fmt(res)}`, ...h].slice(0, 4));
        setExpr(fmt(res));
      }
      return;
    }
    setExpr((e) => e + k);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="fixed right-4 bottom-24 z-30 grid size-14 place-items-center rounded-full bg-ink text-paper shadow-[var(--shadow-lift)] lg:bottom-6"
        aria-label={open ? 'Fermer la calculatrice' : 'Ouvrir la calculatrice'}
      >
        {open ? <X className="size-6" /> : <CalcIcon className="size-6" />}
      </button>
      {open && (
        <div role="dialog" aria-label="Calculatrice" className="animate-rise fixed right-4 bottom-40 z-30 w-72 rounded-2xl border border-line bg-card p-3 shadow-[var(--shadow-lift)] lg:bottom-24">
          <label htmlFor="calc-in" className="sr-only">
            Calcul
          </label>
          <input
            id="calc-in"
            value={expr}
            onChange={(e) => setExpr(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && press('=')}
            className="h-12 w-full rounded-lg border border-line-2 bg-white px-3 text-right font-display text-xl font-bold tabular-nums"
            placeholder="0"
            inputMode="decimal"
          />
          <p className="h-5 pr-1 text-right text-[0.85rem] text-ink-3" aria-live="polite">
            {res !== null && expr ? `= ${fmt(res)}` : ''}
          </p>
          <div className="grid grid-cols-4 gap-1.5">
            {KEYS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => press(k)}
                className={cx('h-11 rounded-lg font-bold', k === '=' ? 'bg-tag' : /[÷×−+%()]/.test(k) ? 'bg-ink/8' : k === 'C' ? 'bg-m1/15 text-m1' : 'bg-white border border-line')}
              >
                {k}
              </button>
            ))}
          </div>
          {hist.length > 0 && (
            <ul className="mt-2 border-t border-line pt-2 text-[0.8rem] text-ink-3">
              {hist.map((h, i) => (
                <li key={i}>{h}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </>
  );
}
