export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Cake servings calculator based on surface-area method.
 *
 * Industry standard (Wilton): servings = cake surface area ÷ slice footprint.
 * - Party slice footprint  = 1.5" × 2" = 3 in² = 19.35 cm²
 * - Wedding slice footprint = 1.0" × 2" = 2 in² = 12.90 cm²
 * Height does NOT increase serving count (same number of cuts regardless of layers).
 *
 * Shape options:
 *   "round"  → area = π × (diameter/2)²
 *   "square" → area = side × side
 *   "rect"   → area = largo × ancho
 *
 * Portion type options: "party" | "wedding" | "child"
 *   child ≈ 1" × 1.5" = 1.5 in² = 9.68 cm² (smaller for kids' parties)
 *
 * Sources: Wilton Cake Serving Guide (wilton.com),
 *          Webstaurantstore Cake Serving Sizes guide.
 */
export function porcionesTortaCumpleanosInvitadosTamano(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  const shape      = String(i.shape      || 'round');
  const portion    = String(i.portion    || 'party');
  const diametro   = Number(i.diametro   ) || 0;  // cm — round
  const lado       = Number(i.lado       ) || 0;  // cm — square
  const largo      = Number(i.largo      ) || 0;  // cm — rect
  const ancho      = Number(i.ancho      ) || 0;  // cm — rect

  // Slice footprint in cm² (industry standard, Wilton)
  // 1 in² = 6.4516 cm²
  const sliceArea: Record<string, number> = {
    party:   3.0 * 6.4516,   // 1.5" × 2" = 19.35 cm²
    wedding: 2.0 * 6.4516,   // 1.0" × 2" = 12.90 cm²
    child:   1.5 * 6.4516,   // 1.0" × 1.5" = 9.68 cm²
  };
  const footprint = sliceArea[portion] ?? sliceArea.party;

  // Cake top surface area in cm²
  let area = 0;
  if (shape === 'round') {
    const r = diametro / 2;
    area = Math.PI * r * r;
  } else if (shape === 'square') {
    area = lado * lado;
  } else {
    // rect
    area = largo * ancho;
  }

  const rawServings = area > 0 ? area / footprint : 0;
  const servings    = Math.ceil(rawServings);

  // ── Labels by language ─────────────────────────────────────────────────────
  const portionLabels: Record<string, Record<string, string>> = {
    es: { party: 'fiesta/cumpleaños', wedding: 'boda/evento formal', child: 'fiesta infantil' },
    en: { party: 'party/birthday',    wedding: 'wedding/formal event', child: "kids' party" },
    pt: { party: 'festa/aniversário', wedding: 'casamento/evento formal', child: 'festa infantil' },
  };
  const shapeLabels: Record<string, Record<string, string>> = {
    es: { round: 'redonda', square: 'cuadrada', rect: 'rectangular' },
    en: { round: 'round',   square: 'square',   rect: 'rectangular' },
    pt: { round: 'redondo', square: 'quadrado', rect: 'retangular'  },
  };
  const portionLabel = portionLabels[__lang]?.[portion] ?? portionLabels.es.party;
  const shapeLabel   = shapeLabels[__lang]?.[shape]    ?? shapeLabels.es.round;

  // Dimension string
  let dimStr = '';
  if (shape === 'round') {
    dimStr = __lang === 'en'
      ? `${diametro} cm diameter`
      : __lang === 'pt'
      ? `${diametro} cm de diâmetro`
      : `${diametro} cm de diámetro`;
  } else if (shape === 'square') {
    dimStr = __lang === 'en'
      ? `${lado}×${lado} cm`
      : `${lado}×${lado} cm`;
  } else {
    dimStr = `${largo}×${ancho} cm`;
  }

  // ── Outputs ────────────────────────────────────────────────────────────────
  const resultado = servings > 0 ? String(servings) : '—';

  let resumen = '';
  if (servings <= 0 || area <= 0) {
    resumen = __lang === 'en'
      ? 'Enter the cake dimensions to see the serving count.'
      : __lang === 'pt'
      ? 'Informe as dimensões do bolo para ver o número de porções.'
      : 'Ingresá las medidas del molde para ver el número de porciones.';
  } else {
    resumen = __lang === 'en'
      ? `A ${shapeLabel} cake of ${dimStr} gives approximately **${servings} servings** (${portionLabel} portion: ${footprint.toFixed(1)} cm²/slice).`
      : __lang === 'pt'
      ? `Um bolo ${shapeLabel} de ${dimStr} rende aproximadamente **${servings} porções** (porção ${portionLabel}: ${footprint.toFixed(1)} cm²/fatia).`
      : `Una torta ${shapeLabel} de ${dimStr} rinde aproximadamente **${servings} porciones** (porción ${portionLabel}: ${footprint.toFixed(1)} cm²/porción).`;
  }

  // ── Insight ────────────────────────────────────────────────────────────────
  let insightText = '';
  if (servings > 0) {
    const guestGuide = __lang === 'en'
      ? `Perfect for **${Math.floor(servings * 0.9)}–${servings}** guests (10% safety buffer). Taller layers don't add slices — only the surface area matters.`
      : __lang === 'pt'
      ? `Ideal para **${Math.floor(servings * 0.9)}–${servings}** convidados (margem de 10%). Mais camadas não aumentam o número de fatias — apenas a área de superfície importa.`
      : `Ideal para **${Math.floor(servings * 0.9)}–${servings}** invitados (margen del 10%). Más capas no aumentan las porciones: solo importa el área de la superficie.`;
    insightText = guestGuide;
  } else {
    insightText = __lang === 'en'
      ? 'Fill in the fields above to get your serving count.'
      : __lang === 'pt'
      ? 'Preencha os campos acima para ver o resultado.'
      : 'Completá los campos para ver el resultado.';
  }

  const _insight = {
    title: __lang === 'en' ? 'Servings result' : __lang === 'pt' ? 'Resultado de porções' : 'Resultado de porciones',
    text:  insightText,
    tone:  'positive',
    icon:  '🎂',
  };

  return { resultado, resumen, _insight };
}
