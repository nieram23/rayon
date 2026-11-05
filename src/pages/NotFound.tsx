import { SearchX } from 'lucide-react';
import { ButtonLink, EmptyState } from '../components/ui';

export function NotFound() {
  return (
    <div className="py-10">
      <EmptyState icon={<SearchX className="size-6" />} title="Page introuvable" action={<ButtonLink to="/">Retour à l’accueil</ButtonLink>}>
        Ce rayon est vide : l’adresse demandée n’existe pas ou plus.
      </EmptyState>
    </div>
  );
}
