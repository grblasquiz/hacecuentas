/** Porción de arroz por persona */
export interface Inputs { personas: number; tipo?: string; ninos?: string; __lang?: string; }
export interface Outputs { gramosCrudo: number; tazasArroz: number; tazasAgua: number; porPersona: number; _table?: any; _insight?: any; }

const GRAMOS_PERSONA: Record<string, number> = { guarnicion: 60, principal: 80, sushi: 75, ensalada: 60 };
const RATIO_AGUA: Record<string, number> = { guarnicion: 2, principal: 2, sushi: 1.5, ensalada: 2 };

// Helper central: a partir de la cantidad de personas (+ tipo/niños fijos) calcula la porción.
// Lo usan TANTO el resultado principal COMO cada fila de la tabla, así nunca divergen.
function calcArroz(pers: number, gBase: number, ratioAgua: number, ninos: string) {
  const persEfectivas = ninos === 'si' ? pers * 0.75 : pers;
  const totalG = Math.round(gBase * persEfectivas);
  const tazas = Number((totalG / 185).toFixed(1)); // 185g por taza
  const tazasAgua = Number((tazas * ratioAgua).toFixed(1));
  const porPersona = Math.round(totalG / pers);
  return { totalG, tazas, tazasAgua, porPersona };
}

export function porcionArrozPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pers = Number(i.personas); if (!pers || pers <= 0) throw new Error(__lang === 'en' ? 'Enter the number of people' : 'Ingresá la cantidad de personas');
  const tipo = String(i.tipo || 'guarnicion');
  const ninos = String(i.ninos || 'no');
  const gBase = GRAMOS_PERSONA[tipo] || 60;
  const ratioAgua = RATIO_AGUA[tipo] || 2;

  const { totalG, tazas, tazasAgua, porPersona } = calcArroz(pers, gBase, ratioAgua, ninos);
  const _insight = {
    title: __lang === 'en' ? 'How much rice to cook' : 'Cuánto arroz cocinar',
    text: __lang === 'en'
      ? `Cook **${totalG} g** of raw rice for **${pers}** ${pers === 1 ? 'person' : 'people'} (~${porPersona} g each) with **${tazasAgua}** cups of water.`
      : `Cociná **${totalG} g** de arroz crudo para **${pers}** ${pers === 1 ? 'persona' : 'personas'} (~${porPersona} g c/u) con **${tazasAgua}** tazas de agua.`,
    tone: 'neutral',
    icon: '🍚',
  };
  const tipoLabel: Record<string, string> = __lang === 'en'
    ? { guarnicion: 'side', principal: 'main', sushi: 'sushi', ensalada: 'salad' }
    : { guarnicion: 'guarnición', principal: 'plato principal', sushi: 'sushi', ensalada: 'ensalada' };
  const tLabel = tipoLabel[tipo] || tipo;
  // Filas: la dimensión que varía es la cantidad de comensales. Incluyo el valor del usuario
  // para que la fila coincida exactamente con el resultado principal aunque sea impar.
  const baseRows = Array.from(new Set([2, 4, 6, 8, 10, pers])).sort((a, b) => a - b);
  const _table = {
    title: __lang === 'en'
      ? `Rice by number of people (${tLabel}${ninos === 'si' ? ', with kids' : ''})`
      : `Arroz según comensales (${tLabel}${ninos === 'si' ? ', con niños' : ''})`,
    headers: __lang === 'en'
      ? ['People', 'Raw rice', 'Rice (cups)', 'Water (cups)']
      : ['Comensales', 'Arroz crudo', 'Arroz (tazas)', 'Agua (tazas)'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: baseRows.map((p) => {
      const r = calcArroz(p, gBase, ratioAgua, ninos);
      return [String(p), `${r.totalG} g`, String(r.tazas), String(r.tazasAgua)];
    }),
    note: __lang === 'en'
      ? `Raw rice for a ${tLabel} portion (${gBase} g per person${ninos === 'si' ? ', kids count as 0.75' : ''}). 1 cup ≈ 185 g; water at a ${ratioAgua}:1 ratio.`
      : `Arroz crudo para porción de ${tLabel} (${gBase} g por persona${ninos === 'si' ? ', los niños cuentan 0,75' : ''}). 1 taza ≈ 185 g; agua en relación ${ratioAgua}:1.`,
  };

  return { gramosCrudo: totalG, tazasArroz: tazas, tazasAgua: tazasAgua, porPersona, _table, _insight };
}
