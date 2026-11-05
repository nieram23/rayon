import { FileText, Globe, Mail, Newspaper, Pin, Quote, Receipt, ScrollText, StickyNote, Tag, ListOrdered } from 'lucide-react';
import { Photo } from './Photo';
import { SafetySign } from './SafetySign';
import { StorePlanView } from './StorePlanView';
import type { ChapterDocument, DocBlock } from '../../domain/chapter';
import { cx } from '../../lib/theme';

const LOOK: Record<ChapterDocument['look'], { icon: typeof FileText; label: string; cls: string }> = {
  texte: { icon: FileText, label: 'Document', cls: 'bg-card' },
  fiche: { icon: Tag, label: 'Fiche produit', cls: 'bg-card' },
  courriel: { icon: Mail, label: 'Courriel', cls: 'bg-card' },
  contrat: { icon: ScrollText, label: 'Extrait de contrat', cls: 'bg-[#fbfaf6]' },
  facture: { icon: Receipt, label: 'Document commercial', cls: 'bg-white' },
  article: { icon: Newspaper, label: 'Article', cls: 'bg-card' },
  procedure: { icon: ListOrdered, label: 'Procédure', cls: 'bg-card' },
  memo: { icon: StickyNote, label: 'Note interne', cls: 'bg-tag-soft/60' },
  site: { icon: Globe, label: 'Site internet', cls: 'bg-white' },
  postit: { icon: Pin, label: 'Note', cls: 'bg-tag' },
};

function Block({ b }: { b: DocBlock }) {
  switch (b.type) {
    case 'p':
      return <p className="leading-relaxed">{b.text}</p>;
    case 'list':
      return (
        <div>
          {b.title && <p className="mb-1 font-bold">{b.title}</p>}
          <ul className="flex flex-col gap-1.5">
            {b.items.map((it) => (
              <li key={it} className="flex gap-2">
                <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-p1" aria-hidden />
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case 'table':
      return (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[22rem] border-collapse text-[0.92rem]">
            {b.caption && <caption className="mb-1.5 text-left text-[0.85rem] font-bold">{b.caption}</caption>}
            <thead>
              <tr>
                {b.head.map((h, i) => (
                  <th key={i} className={cx('border-b-2 border-ink/80 px-2.5 py-2 font-bold', b.align?.[i] === 'right' ? 'text-right' : 'text-left')}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((r, ri) => (
                <tr key={ri} className="border-b border-line">
                  {r.map((c, ci) => (
                    <td key={ci} className={cx('px-2.5 py-2 align-top', b.align?.[ci] === 'right' && 'text-right tabular-nums', ci === 0 && 'font-bold')}>
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'facts':
      return (
        <dl className="grid gap-x-4 gap-y-1.5 sm:grid-cols-[auto_1fr]">
          {b.items.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-[0.88rem] font-bold text-ink-3">{k}</dt>
              <dd className="mb-1 sm:mb-0">{v}</dd>
            </div>
          ))}
        </dl>
      );
    case 'note':
      return <p className="rounded-lg border-l-4 border-tag bg-tag-soft px-3 py-2 text-[0.92rem]">{b.text}</p>;
    case 'formula':
      return (
        <div className="rounded-xl bg-ink px-4 py-3 text-paper">
          <p className="font-display text-[1.05rem] font-bold whitespace-pre-wrap">{b.text}</p>
          {b.example && <p className="mt-1.5 text-[0.88rem] text-paper/75">Exemple : {b.example}</p>}
        </div>
      );
    case 'image':
      return <Photo image={b.image} className={b.float ? 'float-right ml-4 mb-2 w-[42%] max-w-56' : 'w-full'} />;
    case 'zones': {
      const TONE = { rose: 'bg-[#f7d6dc]', bleu: 'bg-[#d6ecf3]', violet: 'bg-[#e1dcf2]', jaune: 'bg-[#fbefc9]', vert: 'bg-[#e1efd2]', orange: 'bg-[#f8d9c6]', gris: 'bg-ink/10' } as const;
      return (
        <div>
          {b.title && <p className="mb-1.5 font-bold">{b.title}</p>}
          <div className="grid grid-cols-2 gap-2 rounded-xl bg-ink/8 p-2 sm:grid-cols-4">
            {b.zones.map((z) => (
              <div key={z.id} className={cx('flex min-h-20 flex-col items-center justify-center rounded-lg border border-ink/20 p-2 text-center', TONE[z.tone], z.wide && 'col-span-2')}>
                <span className="font-display text-[0.95rem] font-extrabold">{z.label}</span>
                {z.sub && <span className="text-[0.8rem] leading-snug">{z.sub}</span>}
              </div>
            ))}
          </div>
        </div>
      );
    }
    case 'signs':
      return (
        <div className="flex flex-wrap gap-3">
          {b.signs.map((s, i) => (
            <figure key={s} className="flex w-20 flex-col items-center gap-1 text-center">
              <SafetySign sign={s} size={64} label={b.labels?.[i] ?? `Pictogramme ${i + 1}`} />
              {b.labels && <figcaption className="text-[0.75rem] leading-tight">{b.labels[i]}</figcaption>}
            </figure>
          ))}
        </div>
      );
    case 'plan':
      return <StorePlanView plan={b.plan} />;
    case 'quote':
      return (
        <blockquote className="relative rounded-xl bg-ink/4 py-3 pr-3 pl-10">
          <Quote className="absolute top-3 left-3 size-5 text-p2" aria-hidden />
          <p className="leading-relaxed italic">« {b.text} »</p>
          <footer className="mt-1.5 text-[0.85rem] font-bold">— {b.author}</footer>
        </blockquote>
      );
  }
}

export function DocumentView({ doc }: { doc: ChapterDocument }) {
  const L = LOOK[doc.look];
  if (doc.look === 'postit')
    return (
      <article id={doc.id} className="relative shrink-0 rotate-[-0.6deg] bg-tag p-5 pt-6 shadow-[var(--shadow-lift)]">
        <Pin className="absolute -top-2 left-1/2 size-6 -translate-x-1/2 text-p3" aria-hidden />
        <p className="mb-1 text-[0.72rem] font-bold tracking-wide uppercase">Document {doc.number} · {doc.title}</p>
        {doc.blocks.map((b, i) => (
          <p key={i} className="font-display text-[1.05rem] leading-snug font-bold">
            {b.type === 'p' ? b.text : null}
          </p>
        ))}
      </article>
    );
  return (
    <article id={doc.id} aria-labelledby={`${doc.id}-t`} className={cx('shrink-0 overflow-hidden rounded-2xl border border-line-2 shadow-[var(--shadow-card)]', L.cls)}>
      <header className="flex items-center gap-3 border-b border-line bg-p1-soft/60 px-4 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-p1 font-display text-sm font-extrabold text-white">{doc.number}</span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 text-[0.72rem] font-bold tracking-wide text-p1-dark uppercase">
            <L.icon className="size-3.5" aria-hidden /> Document {doc.number} · {L.label}
          </p>
          <h3 id={`${doc.id}-t`} className="text-[1.02rem] leading-snug font-bold">
            {doc.title}
          </h3>
        </div>
      </header>
      {doc.look === 'site' && (
        <div className="flex items-center gap-2 border-b border-line bg-ink/5 px-3 py-1.5" aria-hidden>
          <span className="flex gap-1">
            <span className="size-2 rounded-full bg-m1/70" />
            <span className="size-2 rounded-full bg-tag" />
            <span className="size-2 rounded-full bg-m3" />
          </span>
          <span className="flex-1 truncate rounded-full bg-white px-3 py-0.5 text-[0.75rem] text-ink-3">{doc.url}</span>
        </div>
      )}
      <div className="flow-root p-4 text-[0.97rem] [&>*+*]:mt-3">
        {doc.blocks.map((b, i) => (
          <Block key={i} b={b} />
        ))}
        {doc.source && <p className="text-[0.78rem] text-ink-3 italic">{doc.source}</p>}
      </div>
    </article>
  );
}
