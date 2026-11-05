/**
 * Prépare les images du cahier dans le navigateur : les pictogrammes et les plans
 * dessinés en SVG pour le site sont convertis en PNG haute définition,
 * les photos sont converties en JPEG (format lu par le générateur de PDF).
 */
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { SafetySign } from '../components/chapter/SafetySign';
import { StorePlanView } from '../components/chapter/StorePlanView';
import { photoUrl } from '../content/images';
import type { Chapter, SignKey, StorePlan } from '../domain/chapter';
import { planKey, signKey, type PdfAssets } from './ChapterPdf';

const SCALE = 4;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('image'));
    img.src = src;
  });
}

async function svgToPng(svg: string, w: number, h: number): Promise<string> {
  const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  const img = await loadImage(url);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(w * SCALE);
  canvas.height = Math.round(h * SCALE);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/png');
}

function onlySvg(markup: string): string {
  const m = markup.match(/<svg[\s\S]*<\/svg>/);
  let svg = m ? m[0] : markup;
  if (!/xmlns=/.test(svg)) svg = svg.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  return svg.replace(/\sclass="[^"]*"/g, '').replace(/\srole="[^"]*"/g, '');
}

async function signPng(sign: SignKey) {
  const svg = onlySvg(renderToStaticMarkup(createElement(SafetySign, { sign, size: 100 })));
  return svgToPng(svg, 100, 100);
}

async function planPng(plan: StorePlan) {
  let svg = onlySvg(renderToStaticMarkup(createElement(StorePlanView, { plan })));
  const vb = svg.match(/viewBox="([-\d.]+) ([-\d.]+) ([\d.]+) ([\d.]+)"/);
  const w = vb ? Number(vb[3]) : 600;
  const h = vb ? Number(vb[4]) : 400;
  svg = svg.replace('<svg', `<svg width="${w}" height="${h}" font-family="Arial, Helvetica, sans-serif"`);
  // Fond blanc : le PDF n'a pas la couleur de fond du site.
  svg = svg.replace(/(<svg[^>]*>)/, `$1<rect x="-10" y="-10" width="${w + 20}" height="${h + 20}" fill="#faf9f5"/>`);
  return svgToPng(svg, w, h);
}

async function photoJpeg(url: string): Promise<string> {
  const img = await loadImage(url);
  const max = 1400;
  const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(img.naturalWidth * r);
  canvas.height = Math.round(img.naturalHeight * r);
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.85);
}

export async function prepareAssets(chapter: Chapter): Promise<PdfAssets> {
  const images: Record<string, string> = {};
  const photos: Record<string, string> = {};
  const signs = new Set<SignKey>();
  const plans: Array<[string, StorePlan]> = [];
  const photoIds = new Set<string>();

  for (const st of chapter.steps) {
    for (const d of st.documents)
      d.blocks.forEach((b, i) => {
        if (b.type === 'signs') b.signs.forEach((x) => signs.add(x));
        if (b.type === 'plan') plans.push([planKey(st.id, d.id, i), b.plan]);
        if (b.type === 'image') photoIds.add(b.image.id);
      });
    for (const a of st.activities)
      if (a.kind === 'fields')
        for (const f of a.fields)
          if (f.kind === 'choice') {
            if (f.sign) signs.add(f.sign);
            if (f.image) photoIds.add(f.image.id);
          }
  }

  await Promise.all([
    ...[...signs].map(async (sg) => {
      try {
        images[signKey(sg)] = await signPng(sg);
      } catch {
        /* pictogramme absent : cadre vide */
      }
    }),
    ...plans.map(async ([k, plan]) => {
      try {
        images[k] = await planPng(plan);
      } catch {
        /* plan absent : cadre vide */
      }
    }),
    ...[...photoIds].map(async (id) => {
      const url = photoUrl(id);
      if (!url) return;
      try {
        photos[id] = await photoJpeg(url);
      } catch {
        /* photo illisible : ignorée */
      }
    }),
  ]);
  return { images, photos };
}
