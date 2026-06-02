/** Porción de arroz por persona */
export interface Inputs { personas: number; tipo?: string; ninos?: string; __lang?: string; }
export interface Outputs { gramosCrudo: number; tazasArroz: number; tazasAgua: number; porPersona: number; _insight?: any; }

const GRAMOS_PERSONA: Record<string, number> = { guarnicion: 70, principal: 110, sushi: 120, ensalada: 80 };
const RATIO_AGUA: Record<string, number> = { guarnicion: 2, principal: 2, sushi: 1.2, ensalada: 2 };

export function porcionArrozPersonas(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const pers = Number(i.personas); if (!pers || pers <= 0) throw new Error(__lang === 'en' ? 'Enter the number of people' : 'Ingresá la cantidad de personas');
  const tipo = String(i.tipo || 'guarnicion');
  const ninos = String(i.ninos || 'no');
  const gBase = GRAMOS_PERSONA[tipo] || 70;
  const persEfectivas = ninos === 'si' ? pers * 0.75 : pers;
  const totalG = Math.round(gBase * persEfectivas);
  const tazas = Number((totalG / 185).toFixed(1)); // 185g por taza
  const ratioAgua = RATIO_AGUA[tipo] || 2;
  const tazasAgua = Number((tazas * ratioAgua).toFixed(1));

  const porPersona = Math.round(totalG / pers);
  const _insight = {
    title: __lang === 'en' ? 'How much rice to cook' : 'Cuánto arroz cocinar',
    text: __lang === 'en'
      ? `Cook **${totalG} g** of raw rice for **${pers}** ${pers === 1 ? 'person' : 'people'} (~${porPersona} g each) with **${tazasAgua}** cups of water.`
      : `Cociná **${totalG} g** de arroz crudo para **${pers}** ${pers === 1 ? 'persona' : 'personas'} (~${porPersona} g c/u) con **${tazasAgua}** tazas de agua.`,
    tone: 'neutral',
    icon: '🍚',
  };
  return { gramosCrudo: totalG, tazasArroz: tazas, tazasAgua: tazasAgua, porPersona, _insight };
}
