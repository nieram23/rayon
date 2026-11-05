import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { AisleIllustration, Logo } from '../../components/illustrations';
import { ProfileForm } from '../../components/ProfileForm';
import { useApp } from '../../state/AppContext';

/** Premier accès : création d'un profil local (aucune donnée transmise). */
export function Welcome() {
  const { saveProfile, persistent } = useApp();
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <div className="relative hidden overflow-hidden bg-[#ebe5d6] lg:block">
        <div className="absolute top-8 left-8">
          <Logo />
        </div>
        <AisleIllustration className="absolute inset-x-0 bottom-0 w-full" />
        <div className="absolute top-28 left-8 max-w-md">
          <p className="font-display text-[2.6rem] leading-[1.05] font-extrabold">
            Le magasin-école
            <br />
            du Bac Pro MCV.
          </p>
        </div>
      </div>
      <div className="flex flex-col justify-center px-5 py-10 sm:px-12">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        <div className="animate-rise max-w-md">
          <p className="eyebrow">Option A · Animation et gestion de l’espace commercial</p>
          <h1 className="mt-2 text-[2rem] font-extrabold sm:text-[2.4rem]">Bienvenue dans Rayon.</h1>
          <p className="mt-3 text-ink-2">
            13 dossiers et 2 scénarios pour t’entraîner comme en entreprise : commander, réceptionner, mettre en rayon, animer, conquérir des
            clients. Commence par te présenter.
          </p>
          <div className="card mt-6 p-5 sm:p-6">
            <ProfileForm submitLabel="Entrer dans Rayon" onSubmit={saveProfile} />
          </div>
          <p className="mt-4 flex items-start gap-2 text-[0.85rem] text-ink-3">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden />
            {persistent
              ? 'Ton profil reste dans ce navigateur. Rien n’est envoyé sur un serveur. Tu peux le modifier ou l’effacer à tout moment.'
              : 'Le stockage local est bloqué sur ce navigateur : ton profil sera oublié à la fermeture de la page.'}
          </p>
          <p className="mt-6 text-[0.88rem]">
            Vous êtes enseignant ?{' '}
            <Link to="/enseignant" className="font-bold underline underline-offset-4">
              Voir la démonstration de l’espace enseignant
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
