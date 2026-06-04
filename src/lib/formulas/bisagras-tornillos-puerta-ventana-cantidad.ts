export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Hinge & screw quantity calculator for doors and windows.
 *
 * Real formula (industry standard):
 *   hinges = max(min_hinges_by_weight, ceil(height_m / 0.75))
 *   screws_per_hinge = holes_per_leaf × 2 leaves
 *   total_screws = hinges × doors × screws_per_hinge
 *   total_with_buffer = ceil(total_screws × (1 + buffer_pct/100))
 *
 * References:
 *  - "1 hinge per 30″ (≈75 cm) of door height" — widely cited in trade literature
 *    (Hager Companies, Royde & Tucker, VK Hardware, Grupo Kefren, Leroy Merlin ES)
 *  - Weight-based minimums: 2 hinges (<15 kg), 3 hinges (15-40 kg), 4 hinges (40-80 kg), 5 hinges (>80 kg)
 *  - Screws per hinge: 4 (2 holes/leaf × 2 leaves, standard residential), 6 (3 holes/leaf, heavy-duty)
 */
export function bisagrasTornillosPuertaVentanaCantidad(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Inputs
  const alturaM = Math.max(0.3, Number(i.altura_m) || 2.05);
  const cantidadPuertas = Math.max(1, Math.round(Number(i.cantidad_puertas) || 1));
  const pesoCat = String(i.peso_categoria || 'media');   // liviana | media | pesada | muy_pesada
  const huecosPorAla = Math.max(2, Math.min(4, Math.round(Number(i.agujeros_por_ala) || 2)));
  const bufferPct = Math.min(30, Math.max(0, Number(i.buffer_pct) || 10));

  // Weight-category => minimum hinges + label
  type PesoKey = 'liviana' | 'media' | 'pesada' | 'muy_pesada';
  const weightData: Record<PesoKey, { min: number; labelEs: string; labelEn: string }> = {
    liviana:   { min: 2, labelEs: 'liviana (<15 kg)',     labelEn: 'lightweight (<15 kg)' },
    media:     { min: 3, labelEs: 'media (15-40 kg)',      labelEn: 'medium (15-40 kg)' },
    pesada:    { min: 4, labelEs: 'pesada (40-80 kg)',     labelEn: 'heavy (40-80 kg)' },
    muy_pesada:{ min: 5, labelEs: 'muy pesada (>80 kg)',   labelEn: 'very heavy (>80 kg)' },
  };
  const wKey = (Object.prototype.hasOwnProperty.call(weightData, pesoCat) ? pesoCat : 'media') as PesoKey;
  const wd = weightData[wKey];

  // Height-based hinge count: 1 hinge per 75 cm (≈30 inches)
  const hingesByHeight = Math.ceil(alturaM / 0.75);
  const bisagrasPorPuerta = Math.max(wd.min, hingesByHeight);

  // Screws per hinge: holes_per_leaf × 2 leaves
  const tornillosPorBisagra = huecosPorAla * 2;

  // Totals
  const totalBisagras = bisagrasPorPuerta * cantidadPuertas;
  const totalTornillosSinBuffer = totalBisagras * tornillosPorBisagra;
  const totalTornillosConBuffer = Math.ceil(totalTornillosSinBuffer * (1 + bufferPct / 100));

  // Recommended screw size by weight category (informational)
  const screwSizeEs: Record<PesoKey, string> = {
    liviana:    '3,5×16 mm',
    media:      '4×30 mm',
    pesada:     '4×40 mm',
    muy_pesada: '5×60 mm',
  };
  const screwSizeEn: Record<PesoKey, string> = {
    liviana:    '#6 × ⅝″',
    media:      '#8 × 1¼″',
    pesada:     '#8 × 1½″',
    muy_pesada: '#10 × 2½″',
  };

  if (__lang === 'en') {
    const weightLabel = wd.labelEn;
    const screwSize = screwSizeEn[wKey];
    const resumen =
      `${cantidadPuertas} door${cantidadPuertas > 1 ? 's' : ''} × ${bisagrasPorPuerta} hinges × ${tornillosPorBisagra} screws = ${totalTornillosSinBuffer} screws. ` +
      `With ${bufferPct}% waste buffer: ${totalTornillosConBuffer} screws. ` +
      `Door type: ${weightLabel}. Recommended screw: ${screwSize}.`;

    const _insight = {
      title: `${totalBisagras} hinge${totalBisagras !== 1 ? 's' : ''} + ${totalTornillosConBuffer} screws`,
      text:
        `For **${cantidadPuertas}** ${weightLabel} door${cantidadPuertas > 1 ? 's' : ''} at **${alturaM} m** height: ` +
        `**${bisagrasPorPuerta} hinges/door** (height rule: ${hingesByHeight}, weight minimum: ${wd.min}), ` +
        `**${tornillosPorBisagra} screws/hinge** (${huecosPorAla} holes × 2 leaves). ` +
        `Buy **${totalTornillosConBuffer} screws** (includes ${bufferPct}% buffer). Recommended: **${screwSize}**.`,
      tone: 'neutral',
      icon: '🔩',
    };

    return {
      bisagras_total: totalBisagras,
      tornillos_sin_buffer: totalTornillosSinBuffer,
      tornillos_con_buffer: totalTornillosConBuffer,
      bisagras_por_puerta: bisagrasPorPuerta,
      resumen,
      _insight,
    };
  }

  // ES
  const weightLabel = wd.labelEs;
  const screwSize = screwSizeEs[wKey];
  const resumen =
    `${cantidadPuertas} puerta${cantidadPuertas > 1 ? 's' : ''} × ${bisagrasPorPuerta} bisagras × ${tornillosPorBisagra} tornillos = ${totalTornillosSinBuffer} tornillos. ` +
    `Con ${bufferPct}% de margen: ${totalTornillosConBuffer} tornillos. ` +
    `Tipo de puerta: ${weightLabel}. Tornillo recomendado: ${screwSize}.`;

  const _insight = {
    title: `${totalBisagras} bisagra${totalBisagras !== 1 ? 's' : ''} + ${totalTornillosConBuffer} tornillos`,
    text:
      `Para **${cantidadPuertas}** puerta${cantidadPuertas > 1 ? 's' : ''} de tipo ${weightLabel} de **${alturaM} m** de alto: ` +
      `**${bisagrasPorPuerta} bisagras/puerta** (regla altura: ${hingesByHeight}, mínimo por peso: ${wd.min}), ` +
      `**${tornillosPorBisagra} tornillos/bisagra** (${huecosPorAla} agujeros × 2 alas). ` +
      `Comprá **${totalTornillosConBuffer} tornillos** (incluye ${bufferPct}% de margen). Tornillo: **${screwSize}**.`,
    tone: 'neutral',
    icon: '🔩',
  };

  return {
    bisagras_total: totalBisagras,
    tornillos_sin_buffer: totalTornillosSinBuffer,
    tornillos_con_buffer: totalTornillosConBuffer,
    bisagras_por_puerta: bisagrasPorPuerta,
    resumen,
    _insight,
  };
}
