import { useState } from 'react';
import { CheckCircle2, FlaskConical, HardDrive, RotateCcw, ShieldCheck } from 'lucide-react';
import { ProfileForm } from '../../components/ProfileForm';
import { Button } from '../../components/ui';
import type { DataMode } from '../../domain/types';
import { cx, formatDate } from '../../lib/theme';
import { useApp } from '../../state/AppContext';
import { useAuth } from '../../state/AuthContext';
import { LogoutButton } from '../../components/SyncChip';

export function Profil() {
  const { profile, saveProfile, mode, setMode, resetAll, persistent } = useApp();
  const { cloud, account } = useAuth();
  const [saved, setSaved] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  if (!profile) return null;

  const modes: Array<{ value: DataMode; title: string; text: string; icon: typeof HardDrive }> = [
    {
      value: 'local',
      title: cloud ? 'Mes données' : 'Mes données (local)',
      text: cloud
        ? 'Ta progression réelle, enregistrée sur ton compte. Vide tant qu’aucun dossier n’est ouvert.'
        : 'Ta progression réelle, enregistrée uniquement dans ce navigateur. Vide tant qu’aucun dossier n’est ouvert.',
      icon: HardDrive,
    },
    {
      value: 'demo',
      title: 'Démonstration',
      text: 'Progression et niveaux simulés pour visualiser l’interface. Signalé par un bandeau jaune sur toutes les pages.',
      icon: FlaskConical,
    },
  ];

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8">
      <header className="flex items-center gap-4">
        <span className="grid size-16 place-items-center rounded-2xl bg-tag font-display text-3xl font-extrabold">{profile.pseudo.slice(0, 1).toUpperCase()}</span>
        <div>
          <p className="eyebrow">Mon profil</p>
          <h1 className="text-[1.9rem] font-extrabold">{profile.pseudo}</h1>
          <p className="text-[0.9rem] text-ink-3">
            {profile.classLabel || 'Classe non renseignée'} · {cloud ? 'compte créé' : 'profil créé'} le {formatDate(profile.createdAt)}
          </p>
        </div>
      </header>

      {cloud && account ? (
        <section aria-labelledby="ident" className="card p-5 sm:p-6">
          <h2 id="ident" className="mb-4 text-[1.2rem] font-bold">
            Mon compte
          </h2>
          <dl className="grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-[0.82rem] font-bold text-ink-3">Identifiant</dt>
              <dd className="font-bold">{account.username}</dd>
            </div>
            <div>
              <dt className="text-[0.82rem] font-bold text-ink-3">Nom affiché</dt>
              <dd className="font-bold">{account.displayName}</dd>
            </div>
            <div>
              <dt className="text-[0.82rem] font-bold text-ink-3">Classe</dt>
              <dd className="font-bold">{account.classLabel || '—'}</dd>
            </div>
          </dl>
          <p className="mt-4 text-[0.88rem] text-ink-3">Pour corriger ces informations ou changer de mot de passe, adresse-toi à ton professeur.</p>
          <div className="mt-4">
            <LogoutButton className="inline-flex min-h-11 items-center gap-2 rounded-full border border-line-2 bg-card px-5 font-bold hover:border-ink" />
          </div>
        </section>
      ) : (
      <section aria-labelledby="ident" className="card p-5 sm:p-6">
          <h2 id="ident" className="mb-4 text-[1.2rem] font-bold">
            Identité
          </h2>
          <ProfileForm
            key={profile.pseudo + profile.classLabel}
            initial={profile}
            submitLabel="Enregistrer"
            onSubmit={(v) => {
              saveProfile(v);
              setSaved(true);
              window.setTimeout(() => setSaved(false), 2500);
            }}
          />
          {saved && (
            <p className="mt-3 inline-flex items-center gap-2 text-[0.9rem] font-bold text-p1-dark" role="status">
              <CheckCircle2 className="size-4" aria-hidden /> Profil enregistré.
            </p>
          )}
        </section>
      )}

      <section aria-labelledby="mode" className="card p-5 sm:p-6">
        <h2 id="mode" className="mb-1 text-[1.2rem] font-bold">
          Données affichées
        </h2>
        <p className="mb-4 text-[0.9rem] text-ink-3">Le mode actif est toujours indiqué à l’écran.</p>
        <div role="radiogroup" aria-labelledby="mode" className="grid gap-3 sm:grid-cols-2">
          {modes.map((m) => {
            const active = mode === m.value;
            return (
              <button
                key={m.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setMode(m.value)}
                className={cx(
                  'flex flex-col items-start gap-2 rounded-2xl border-2 p-4 text-left transition-colors',
                  active ? 'border-ink bg-card' : 'border-line bg-card/50 hover:border-line-2',
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <m.icon className="size-5" aria-hidden />
                  <span className={cx('size-5 rounded-full border-2', active ? 'border-[6px] border-ink' : 'border-line-2')} aria-hidden />
                </span>
                <span className="font-bold">{m.title}</span>
                <span className="text-[0.88rem] text-ink-2">{m.text}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section aria-labelledby="vie-privee" className="card p-5 sm:p-6">
        <h2 id="vie-privee" className="mb-3 flex items-center gap-2 text-[1.2rem] font-bold">
          <ShieldCheck className="size-5" aria-hidden /> Mes données
        </h2>
        <p className="text-[0.95rem] text-ink-2">
          {cloud
            ? 'Tes réponses sont enregistrées sur ton compte, sur le serveur de Rayon. Seuls toi et ton professeur peuvent les consulter. Tu les retrouves sur n’importe quel ordinateur après connexion.'
            : persistent
            ? 'Ton pseudonyme, ta classe et tes préférences sont enregistrés uniquement dans ce navigateur. Aucune donnée n’est envoyée à un serveur.'
            : 'Le stockage local est indisponible : tes informations ne seront conservées que jusqu’à la fermeture de la page.'}
        </p>
        {!cloud && <div className="mt-4">
          {confirmReset ? (
            <div className="flex flex-col gap-3 rounded-xl border-2 border-m1/40 bg-m1/5 p-4" role="alertdialog" aria-labelledby="confirm-title">
              <p id="confirm-title" className="font-bold">
                Effacer le profil, la progression locale et les préférences de ce navigateur ?
              </p>
              <div className="flex flex-wrap gap-2">
                <Button variant="danger" onClick={resetAll}>
                  Oui, tout effacer
                </Button>
                <Button variant="secondary" onClick={() => setConfirmReset(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Button variant="secondary" onClick={() => setConfirmReset(true)}>
              <RotateCcw className="size-4" aria-hidden /> Réinitialiser le profil
            </Button>
          )}
        </div>}
      </section>
    </div>
  );
}
