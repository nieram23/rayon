import { registerPdfFonts } from './fonts';
const fs = 'node_modules/@fontsource/';
registerPdfFonts({
  body400: fs + 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-normal.woff',
  body700: fs + 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-normal.woff',
  body400i: fs + 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-400-italic.woff',
  body700i: fs + 'atkinson-hyperlegible/files/atkinson-hyperlegible-latin-700-italic.woff',
  title500: fs + 'bricolage-grotesque/files/bricolage-grotesque-latin-500-normal.woff',
  title700: fs + 'bricolage-grotesque/files/bricolage-grotesque-latin-700-normal.woff',
  title800: fs + 'bricolage-grotesque/files/bricolage-grotesque-latin-800-normal.woff',
  math: fs + 'noto-sans-math/files/noto-sans-math-latin-400-normal.woff',
});
