import { useId, useState, type FormEvent } from 'react';
import { Button } from './ui';

export function ProfileForm({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: { pseudo: string; classLabel: string };
  submitLabel: string;
  onSubmit: (v: { pseudo: string; classLabel: string }) => void;
}) {
  const [pseudo, setPseudo] = useState(initial?.pseudo ?? '');
  const [classLabel, setClassLabel] = useState(initial?.classLabel ?? '');
  const [error, setError] = useState<string | null>(null);
  const id = useId();

  function submit(e: FormEvent) {
    e.preventDefault();
    const p = pseudo.trim();
    if (p.length < 2) {
      setError('Indique un prénom ou un pseudonyme d’au moins 2 caractères.');
      return;
    }
    if (p.length > 24) {
      setError('24 caractères maximum.');
      return;
    }
    setError(null);
    onSubmit({ pseudo: p, classLabel: classLabel.trim().slice(0, 24) });
  }

  const field =
    'mt-1.5 block w-full min-h-12 rounded-xl border border-line-2 bg-white px-4 text-[1rem] outline-none focus:border-ink focus:ring-2 focus:ring-tag';

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <label htmlFor={`${id}-p`} className="font-bold">
          Prénom ou pseudonyme
        </label>
        <input
          id={`${id}-p`}
          className={field}
          value={pseudo}
          onChange={(e) => setPseudo(e.target.value)}
          autoComplete="off"
          maxLength={24}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : `${id}-ph`}
          placeholder="Ex. : Sam"
        />
        {error ? (
          <p id={`${id}-err`} className="mt-1.5 text-[0.88rem] font-bold text-m1" role="alert">
            {error}
          </p>
        ) : (
          <p id={`${id}-ph`} className="mt-1.5 text-[0.85rem] text-ink-3">
            Un pseudonyme suffit. Pas de nom de famille.
          </p>
        )}
      </div>
      <div>
        <label htmlFor={`${id}-c`} className="font-bold">
          Classe <span className="font-normal text-ink-3">(facultatif)</span>
        </label>
        <input
          id={`${id}-c`}
          className={field}
          value={classLabel}
          onChange={(e) => setClassLabel(e.target.value)}
          autoComplete="off"
          maxLength={24}
          placeholder="Ex. : 1re MCV A"
        />
      </div>
      <Button type="submit" className="mt-1 self-start">
        {submitLabel}
      </Button>
    </form>
  );
}
