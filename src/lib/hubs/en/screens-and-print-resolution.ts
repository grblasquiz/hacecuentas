import type { HubData } from '../types';

/**
 * Hub EN — "What resolution / DPI do I actually need?"
 *
 * Absorbe 3 calculadoras: densidad de píxeles de pantalla (PPI / Retina),
 * resolución necesaria para imprimir a un tamaño dado, y peso estimado de un JPG
 * según megapíxeles y calidad.
 *
 * Constantes espejadas de las fórmulas reales:
 *  - densidad-pixeles-pantalla-ppi-retina.ts (Pitágoras / diagonal; umbrales 200 y 300 PPI)
 *  - dpi-ppp-impresion-resolucion.ts (px = pulgadas × DPI)
 *  - jpg-calidad-tamano-web-optimizacion.ts (anclas de ratio de compresión por calidad)
 */

/** Exacto por definición: 1 pulgada = 25,4 mm. */
export const MM_PER_INCH = 25.4;
/** Umbrales de densidad: por debajo de 200 PPI se ven los píxeles; 300+ es densidad "Retina". */
export const PPI_NEAR = 200;
export const PPI_RETINA = 300;

/**
 * Anclas [calidad, ratio de compresión] del modelo de peso JPEG, para foto natural.
 * Peso ≈ (píxeles × 3 bytes RGB) ÷ ratio.
 */
export const JPEG_ANCHORS: Array<[number, number]> = [
  [10, 120],
  [20, 80],
  [40, 50],
  [60, 35],
  [75, 22],
  [85, 15],
  [90, 10],
  [95, 5],
  [100, 3],
];

const DISCLAIMER =
  'Estimate based on the numbers you enter. Verify units, assumptions and rounding — file size in particular varies enormously with the content of the image, and this model is calibrated for natural photographs.';

export const hub: HubData = {
slug: 'en/tech/screens-and-print-resolution',
  title: 'Screen PPI, Print DPI and JPEG File Size Calculator',
  description:
    'Work out the pixel density of a screen and whether it counts as Retina, how many pixels you need to print sharply at a given size in inches, and how heavy a JPEG will be at a given quality setting.',
  silo: 'Tech',
siloHref: '/en/tech',
  locale: 'en',

  eyebrow: 'Screens & print',
  h1: 'What resolution do I actually need?',
  lede:
    'Pixels only mean something relative to a size and a viewing distance. The same 12-megapixel image is beautifully sharp on a phone, adequate as an 8×10 print and badly soft on a billboard seen from six feet. Three questions answered here: how dense your screen is, how many pixels your print needs, and what quality setting keeps a JPEG light without visible damage.',
  stamps: [
    'US units first: inches for screen diagonals and print sizes',
    'Retina threshold at 300 PPI, the usual handheld reading-distance figure',
    'JPEG size model calibrated on natural-photo compression ratios',
    'Replaces 3 single-purpose calculators',
  ],

  resultLabel: 'Your number',

  cases: {
    title: 'Which resolution question is it?',
    intro:
      'Pick what you are working out. Only the fields that case needs get read — the rest are ignored.',
    items: [
      {
        id: 'ppi',
        label: 'How sharp my screen is (PPI)',
        hint: 'Pixel density from the resolution and the diagonal, and whether that is Retina.',
        yes: [
          'Pixel density in pixels per inch',
          'Whether it clears the Retina threshold',
          'The physical size of a single pixel',
          'The viewing distance at which pixels stop being visible',
        ],
        warn: [
          DISCLAIMER,
          '"Retina" is not a fixed number of pixels — it is a density high enough that the eye cannot resolve individual pixels at the normal viewing distance for that device. A phone held 12 inches away needs around 300 PPI; a TV seen from eight feet needs barely 40.',
          'A higher PPI is not automatically better on a desktop. Above roughly 220 PPI, operating systems have to scale the interface, and applications that do not handle scaling well end up blurry or comically small.',
          'The diagonal on the box is the panel size, and on some monitors that includes a bezel-hidden margin. If your calculated PPI looks slightly off against the manufacturer’s figure, that is usually why.',
        ],
        plazo: 'For a desktop monitor, pick the size and resolution combination that lands near 110 PPI (no scaling) or near 220 PPI (clean 2× scaling) and avoid the awkward middle.',
        answer:
          'PPI = √(width² + height²) ÷ diagonal in inches. A 1920×1080 screen at 24 inches is 92 PPI; the same resolution at 15 inches is 147 PPI.',
      },
      {
        id: 'print',
        label: 'How many pixels I need to print this',
        hint: 'Pixel dimensions and megapixels required for a print size at a target DPI.',
        yes: [
          'The pixel dimensions the print requires',
          'How many megapixels that is',
          'What DPI your existing image would print at',
          'Whether 300 DPI is worth it at this size and distance',
        ],
        warn: [
          DISCLAIMER,
          'The 300 DPI rule is for things held in the hand — a photo print, a brochure, a book page. Large-format work seen from further away needs far less: 150 DPI for a poster, and billboards are routinely printed at 20 DPI or lower because nobody stands three feet from one.',
          'You can never add real detail by upsizing. Enlarging a small image to hit a pixel count invents data, and while modern upscaling can hide it well, it cannot recover detail the sensor never recorded.',
          'Print DPI and scanner DPI are not the same measure as screen PPI, and printer DPI is different again — an inkjet quoting 4800 DPI is describing ink droplet placement, not image resolution. Feeding a printer 4800 PPI of image data does nothing.',
        ],
        plazo: 'Check the DPI your existing file would print at before ordering; if it lands under 150 for a handheld print, reshoot or print smaller.',
        answer:
          'Pixels = inches × DPI. An 8×10 inch print at 300 DPI needs 2400×3000 pixels, which is 7.2 megapixels.',
      },
      {
        id: 'jpeg',
        label: 'How heavy a JPEG will be',
        hint: 'Estimated file size from megapixels and quality, and where the sweet spot sits.',
        yes: [
          'Estimated file size at that quality setting',
          'The compression ratio it implies',
          'What the quality-85 baseline would weigh',
          'How much a modern format would save on top',
        ],
        warn: [
          DISCLAIMER,
          'File size depends heavily on content. A smooth sky compresses many times better than foliage or fabric texture at the same quality setting, so treat this as a planning figure for a typical photograph rather than a prediction for a specific file.',
          'Above quality 95 the file grows steeply for differences no one can see on a screen. Below about 70, blocking and halo artefacts appear around edges and in flat gradients — and JPEG damage is permanent, since re-saving never restores what was thrown away.',
          'Every re-save of a JPEG loses a little more. Keep the original in a lossless format and export a JPEG each time, rather than repeatedly editing and re-saving the same JPEG.',
        ],
        plazo: 'Quality 80–85 is the standard web answer; serve WebP or AVIF alongside it and let the browser choose.',
        answer:
          'Quality 85 on a natural photograph gives roughly a 15:1 compression ratio, so a 12-megapixel image lands around 2.3 MB. WebP or AVIF cuts another 25–35% at the same visual quality.',
      },
    ],
  },

  inputsTitle: 'The numbers you have',
  inputsIntro: 'Fill in the fields for the case you picked — everything else is ignored.',
  fields: [
    { id: 'pxWide', label: 'Horizontal resolution', type: 'number', value: 1920, suffix: 'px', min: 1, step: 10, thousands: true },
    { id: 'pxHigh', label: 'Vertical resolution', type: 'number', value: 1080, suffix: 'px', min: 1, step: 10, thousands: true },
    { id: 'diagonal', label: 'Screen diagonal', type: 'number', value: 24, suffix: 'in', min: 1, max: 120, step: 0.1 },
    { id: 'printW', label: 'Print width', type: 'number', value: 8, suffix: 'in', min: 0.1, max: 400, step: 0.5 },
    { id: 'printH', label: 'Print height', type: 'number', value: 10, suffix: 'in', min: 0.1, max: 400, step: 0.5 },
    {
      id: 'dpi',
      label: 'Target print resolution',
      type: 'select',
      value: '300',
      options: [
        { value: '300', label: '300 DPI — photo prints, brochures, anything held in hand' },
        { value: '200', label: '200 DPI — small posters, seen from a few feet' },
        { value: '150', label: '150 DPI — large posters and signage' },
        { value: '72', label: '72 DPI — banners and backdrops seen from across a room' },
        { value: '30', label: '30 DPI — billboards and vehicle wraps' },
      ],
    },
    { id: 'haveMp', label: 'Megapixels of the image you already have', type: 'number', value: 12, suffix: 'MP', min: 0, max: 500, step: 0.1, help: 'Used to tell you what DPI it would actually print at. Leave at 0 to skip.' },
    { id: 'mp', label: 'Image resolution', type: 'number', value: 12, suffix: 'MP', min: 0.01, max: 500, step: 0.1 },
    { id: 'quality', label: 'JPEG quality setting', type: 'number', value: 85, suffix: '/ 100', min: 1, max: 100, step: 1 },
  ],
  fineprint: DISCLAIMER,

  chart: {
    type: 'donut',
    title: 'How the number splits',
    caption:
      'The composition behind the result — pixels against physical size, bytes kept against bytes discarded by compression.',
  },

  breakdownTitle: 'Line by line',
  breakdownIntro:
    'Inches and millimetres both shown where it helps, with 1 inch = 25.4 mm exactly, so nothing drifts between the two systems.',

  faq: [
    {
      q: 'How do I calculate the PPI of a screen?',
      a: 'Take the diagonal in pixels — the square root of width squared plus height squared — and divide by the diagonal in inches. A 1920×1080 panel has a 2202-pixel diagonal, so at 24 inches it works out to 92 PPI and at 15 inches to 147 PPI. The resolution alone tells you nothing without the physical size.',
    },
    {
      q: 'What counts as a Retina display?',
      a: 'There is no single number, because it depends on viewing distance. The commonly used threshold is 300 PPI for something held about a foot away, which is roughly where a person with normal vision stops resolving individual pixels. A laptop viewed from two feet needs only around 150 PPI to look equally seamless, and a television across a room needs far less again.',
    },
    {
      q: 'Is a higher PPI monitor always better?',
      a: 'Not on a desktop. Past about 220 PPI the operating system has to scale the interface, and any application that handles scaling badly ends up blurry or too small to use. The practical sweet spots are around 110 PPI, where nothing needs scaling, and around 220 PPI, where a clean 2× scale factor applies. The range in between is the frustrating one.',
    },
    {
      q: 'How many megapixels do I need for an 8×10 print?',
      a: '7.2 megapixels. At the standard 300 DPI for handheld prints, an 8×10 inch print needs 2400×3000 pixels. A 16×20 poster at the same DPI would need 28.8 megapixels — but posters are viewed from further away, so 150 DPI and 7.2 megapixels is usually plenty for one.',
    },
    {
      q: 'Is 300 DPI always necessary?',
      a: 'Only for things you hold. The required resolution falls with viewing distance: 300 DPI for a photo print or brochure, 150 DPI for a poster, around 72 DPI for a trade-show banner and as little as 20 DPI for a billboard. Printing a billboard at 300 DPI would produce a file of tens of gigabytes to display detail no viewer could ever resolve.',
    },
    {
      q: 'What is the difference between DPI and PPI?',
      a: 'PPI is pixels per inch and describes an image or a screen. DPI is dots per inch and describes a printing device. They are used interchangeably in casual conversation, but a printer quoting 4800 DPI is describing how finely it can place ink droplets to simulate a colour, not how much image data it can use — feeding it 4800 PPI of image achieves nothing.',
    },
    {
      q: 'Can I just upscale a small image to print it larger?',
      a: 'You can, but you cannot create detail that was never captured. Upscaling interpolates new pixels from existing ones, and modern machine-learning upscalers do it convincingly enough for many uses, but the fine texture is invented rather than recovered. For anything examined closely, reshooting at higher resolution beats any amount of upscaling.',
    },
    {
      q: 'What JPEG quality should I use for the web?',
      a: '80 to 85 for photographs. That range typically achieves a 15:1 compression ratio with no difference visible on a screen. Going to 95 can multiply the file size several times for no perceptible gain, and dropping below 70 introduces blocking and halos around edges that no later processing can remove.',
    },
    {
      q: 'How big will a 12 megapixel JPEG be?',
      a: 'Around 2.3 MB at quality 85 for a typical photograph, roughly 3.4 MB at quality 90 and about 7 MB at quality 95. Content matters a great deal though: a picture of a clear sky may come in at half those figures while a detailed forest scene comes in above them, at exactly the same setting.',
    },
    {
      q: 'Should I use WebP or AVIF instead of JPEG?',
      a: 'Yes, alongside it. WebP typically saves 25–35% over JPEG at matched visual quality and AVIF often more again, and both are supported by every current browser. Serve them through the picture element with a JPEG fallback so older clients still get an image, and let the browser pick.',
    },
    {
      q: 'Why does my JPEG look worse every time I save it?',
      a: 'Because JPEG is lossy and generation loss compounds. Each save re-quantises the image and discards a little more detail, permanently. Keep the master in a lossless format — the camera raw file, a PNG or a layered document — and export a fresh JPEG each time rather than editing and re-saving the same one.',
    },
    {
      q: 'How far away do I need to stand before pixels disappear?',
      a: 'Roughly the distance at which a pixel subtends less than one arcminute, the limit of normal visual acuity. In practice that works out to about 3,438 divided by the PPI, in inches — so a 92 PPI monitor stops showing pixels beyond about 37 inches, while a 460 PPI phone screen has already crossed the threshold at 7 inches.',
    },
  ],

  sources: [
    { name: 'Visual acuity and the arcminute limit of human vision', url: 'https://www.aao.org/eye-health/tips-prevention/visual-acuity', publisher: 'American Academy of Ophthalmology' },
    { name: 'NIST Special Publication 811 — 1 inch = 25.4 mm exactly', url: 'https://www.nist.gov/pml/special-publication-811', publisher: 'NIST' },
    { name: 'JPEG standard (ITU-T T.81) — baseline compression', url: 'https://www.w3.org/Graphics/JPEG/itu-t81.pdf', publisher: 'ITU-T / JPEG' },
    { name: 'Serve images in modern formats — WebP and AVIF savings', url: 'https://web.dev/articles/serve-images-webp', publisher: 'Google / web.dev' },
    { name: 'Image resolution and viewing distance for large-format print', url: 'https://www.printing.org/', publisher: 'PRINTING United Alliance' },
  ],

  replaces: [
    '/en/screen-ppi-pixel-density',
    '/en/dpi-ppp-print-resolution',
    '/en/jpg-quality-size-web-optimization',
  ],

lastReviewed: '2026-07-28',
};
