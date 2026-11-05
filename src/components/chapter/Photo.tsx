import { ImageIcon } from 'lucide-react';
import type { ImageRef } from '../../domain/chapter';
import { isCutout, photoCredit, photoUrl } from '../../content/images';
import { cx } from '../../lib/theme';

/** Photo du registre, avec crédit. Sans fichier : cadre neutre portant la description. */
export function Photo({ image, className, rounded = true, showCaption = true }: { image: ImageRef; className?: string; rounded?: boolean; showCaption?: boolean }) {
  const src = photoUrl(image.id);
  const credit = photoCredit(image.id);
  const cut = isCutout(image.id);
  // Tant que la photo n'est pas fournie, on n'affiche rien plutôt qu'un cadre vide.
  if (!src && !import.meta.env.DEV) return null;
  return (
    <figure className={cx('flex flex-col gap-1', className)}>
      {src ? (
        <img
          src={src}
          alt={image.alt}
          loading="lazy"
          className={cx('h-full w-full', cut ? 'object-contain drop-shadow-[0_12px_18px_rgba(22,24,29,0.25)]' : 'object-cover', rounded && !cut && 'rounded-xl')}
        />
      ) : (
        <div
          role="img"
          aria-label={image.alt}
          className={cx('grid h-full min-h-32 w-full place-items-center bg-ink/5 p-4 text-center text-[0.8rem] text-ink-3 hatch', rounded && 'rounded-xl')}
        >
          <span className="flex flex-col items-center gap-1">
            <ImageIcon className="size-5" aria-hidden />
            {image.alt}
          </span>
        </div>
      )}
      {showCaption && (image.caption || credit) && (
        <figcaption className="text-[0.75rem] leading-snug text-ink-3">
          {image.caption}
          {credit && (
            <span className="block">
              Photo : {credit.author} / {credit.source}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
