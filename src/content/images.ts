/**
 * Registre des photos.
 * Les fichiers sont dans src/assets/photos/<id>.(webp|jpg|png) et les crédits dans credits.json.
 * Une photo absente est remplacée par un cadre illustré : le contenu reste utilisable.
 */
import credits from '../assets/photos/credits.json';

const files = import.meta.glob('../assets/photos/*.{webp,jpg,jpeg,png}', { eager: true, import: 'default' }) as Record<string, string>;

const byId: Record<string, string> = {};
for (const [path, url] of Object.entries(files)) {
  const id = path.split('/').pop()!.replace(/\.(webp|jpe?g|png)$/, '');
  byId[id] = url;
}

export interface PhotoCredit {
  author: string;
  source: 'Pexels' | 'Unsplash';
  url: string;
}

export function photoUrl(id: string): string | undefined {
  return byId[id];
}

export function photoCredit(id: string): PhotoCredit | undefined {
  return (credits as Record<string, PhotoCredit>)[id];
}

/** Photo détourée (fond transparent) : affichée sans cadre. */
export function isCutout(id: string): boolean {
  return id.endsWith('-cut');
}
