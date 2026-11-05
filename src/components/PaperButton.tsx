import { useState } from 'react';
import { FileDown, KeyRound, Loader2 } from 'lucide-react';
import { useAuth } from '../state/AuthContext';
import { cx } from '../lib/theme';

/** Bouton « Version papier » : génère le cahier PDF du dossier. Le corrigé est réservé à l'administrateur. */
export function PaperButton({ unitId, className, tone = 'light' }: { unitId: string; className?: string; tone?: 'light' | 'dark' }) {
  const { isAdmin } = useAuth();
  const [busy, setBusy] = useState<null | 'eleve' | 'corrige'>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(corrige: boolean) {
    setBusy(corrige ? 'corrige' : 'eleve');
    setError(null);
    try {
      const { buildChapterPdf, saveBlob } = await import('../pdf/download');
      const { blob, filename } = await buildChapterPdf(unitId, corrige);
      saveBlob(blob, filename);
    } catch (e) {
      setError(e instanceof Error ? `Génération impossible : ${e.message}` : 'Génération impossible.');
    } finally {
      setBusy(null);
    }
  }

  const base =
    tone === 'dark'
      ? 'border-paper/30 text-paper hover:border-paper hover:bg-paper/10'
      : 'border-line-2 bg-card text-ink hover:border-ink';

  return (
    <div className={cx('flex flex-col gap-1.5', className)}>
      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => go(false)} disabled={!!busy} className={cx('inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-bold disabled:opacity-60', base)}>
          {busy === 'eleve' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <FileDown className="size-4" aria-hidden />}
          {busy === 'eleve' ? 'Préparation du cahier…' : 'Télécharger la version papier'}
        </button>
        {isAdmin && (
          <button type="button" onClick={() => go(true)} disabled={!!busy} className={cx('inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-[0.9rem] font-bold disabled:opacity-60', base)}>
            {busy === 'corrige' ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <KeyRound className="size-4" aria-hidden />}
            {busy === 'corrige' ? 'Préparation du corrigé…' : 'Corrigé professeur'}
          </button>
        )}
      </div>
      {error && (
        <p className={cx('text-[0.85rem] font-bold', tone === 'dark' ? 'text-tag' : 'text-m1')} role="alert">
          {error}
        </p>
      )}
      {busy && (
        <p className="sr-only" role="status">
          Préparation du PDF en cours.
        </p>
      )}
    </div>
  );
}
