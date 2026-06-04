export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Meat portions for BBQ / asado per person.
 *
 * Method:
 *   base_adult_g  = bone-in 400 g | boneless 300 g | sausages 200 g  (neta cocida needed)
 *   base_child_g  = ~50 % of adult base
 *   appetite factor: light 0.80 | normal 1.00 | hungry 1.25
 *   sides factor:   abundant 0.80 | moderate 1.00 | none 1.20
 *   cooking-loss factor: bone-in 1.45 (35 % bone + 25 % cooking shrink) |
 *                        boneless 1.28 (22 % cooking shrink) |
 *                        sausages 1.12 (12 % cooking shrink)
 *
 * Sources:
 *   - Frigorífico Sada (AR) — porcion adulto asado de tira 400–500 g cruda con hueso
 *   - BBQ Hero / Sonny's BBQ — 1/2 lb cooked per adult (≈ 227 g), adjust for bone & shrink
 *   - Smokey D's BBQ catering guide — bone-in needs 25 % more raw weight
 *   - Standard catering ratio: child ≈ 50 % of adult (BBQ Smoke Central)
 */
export function porcionesCarneAsadoParrillaPersona(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const personas  = Math.max(0, Number(i.personas)  || 0);
  const ninos     = Math.max(0, Number(i.ninos)      || 0);
  const tipoCorte = String(i.tipoCorte || 'conHueso');
  const apetito   = String(i.apetito   || 'normal');
  const guarnicion= String(i.guarnicion|| 'moderada');

  // Base cooked-meat needed per adult (grams) — net edible finished portion
  const baseAdultG: Record<string, number> = {
    conHueso:   350,  // asado de tira / costillar / ribs (edible after bone)
    sinHueso:   280,  // vacío / entraña / bife / steaks
    embutidos:  180,  // chorizos / salchichas (count by weight)
  };
  const baseG = baseAdultG[tipoCorte] ?? 280;
  const childBaseG = baseG * 0.50;

  // Appetite factor
  const appetiteF: Record<string, number> = {
    liviano: 0.80,
    normal:  1.00,
    hambre:  1.25,
  };
  const af = appetiteF[apetito] ?? 1.00;

  // Sides factor
  const sidesF: Record<string, number> = {
    abundante: 0.80,
    moderada:  1.00,
    poca:      1.20,
  };
  const sf = sidesF[guarnicion] ?? 1.00;

  // Raw-weight multiplier to account for cooking shrinkage + bone wastage
  // bone-in: ~30% bone inedible + 25% cooking loss on remaining meat → buy ~1.45× net
  // boneless: ~22% cooking loss → buy ~1.28× net
  // sausages: ~12% cooking loss → buy ~1.12× net
  const lossF: Record<string, number> = {
    conHueso:  1.45,
    sinHueso:  1.28,
    embutidos: 1.12,
  };
  const lf = lossF[tipoCorte] ?? 1.28;

  // Net cooked grams needed total
  const netAdultG  = personas * baseG * af * sf;
  const netChildG  = ninos    * childBaseG * af * sf;
  const totalNetG  = netAdultG + netChildG;

  // Raw weight to buy (grams then kg)
  const totalRawG  = totalNetG * lf;
  const totalRawKg = totalRawG / 1000;

  // Buffer: +10% recommended for seconds / unexpected guests
  const withBufferKg = totalRawKg * 1.10;

  if (personas + ninos === 0) {
    const emptyMsg = __lang === 'en'
      ? 'Enter at least 1 person to calculate.'
      : 'Ingresá al menos 1 persona para calcular.';
    return { resultado: '0.00', resumen: emptyMsg, _insight: { title: '', text: emptyMsg, tone: 'neutral', icon: '🥩' } };
  }

  // Human-readable cut name
  const cutNameEs: Record<string, string> = {
    conHueso:  'corte con hueso (asado de tira, costillar)',
    sinHueso:  'corte sin hueso (vacío, entraña, bife)',
    embutidos: 'embutidos (chorizo, salchicha)',
  };
  const cutNameEn: Record<string, string> = {
    conHueso:  'bone-in cut (ribs, rack)',
    sinHueso:  'boneless cut (skirt, sirloin, steak)',
    embutidos: 'sausages / hot dogs',
  };

  const appetiteNameEs: Record<string, string> = { liviano: 'liviano', normal: 'normal', hambre: 'mucho apetito' };
  const appetiteNameEn: Record<string, string> = { liviano: 'light', normal: 'normal', hambre: 'very hungry' };

  const sidesNameEs: Record<string, string> = { abundante: 'con guarnición abundante', moderada: 'con guarnición moderada', poca: 'sin / poca guarnición' };
  const sidesNameEn: Record<string, string> = { abundante: 'with hearty sides', moderada: 'with moderate sides', poca: 'with few / no sides' };

  const cutEs = cutNameEs[tipoCorte] ?? tipoCorte;
  const cutEn = cutNameEn[tipoCorte] ?? tipoCorte;

  let resumen: string;
  if (__lang === 'en') {
    resumen =
      `For ${personas} adult${personas !== 1 ? 's' : ''}` +
      (ninos > 0 ? ` and ${ninos} child${ninos !== 1 ? 'ren' : ''}` : '') +
      ` — ${cutEn}, ${appetiteNameEn[apetito] ?? ''} appetite, ${sidesNameEn[guarnicion] ?? ''}: ` +
      `buy **${totalRawKg.toFixed(2)} kg** raw (${withBufferKg.toFixed(2)} kg with 10 % buffer). ` +
      `This yields approximately ${(totalNetG / 1000).toFixed(2)} kg of finished meat on the plate.`;
  } else {
    resumen =
      `Para ${personas} adulto${personas !== 1 ? 's' : ''}` +
      (ninos > 0 ? ` y ${ninos} niño${ninos !== 1 ? 's' : ''}` : '') +
      ` — ${cutEs}, apetito ${appetiteNameEs[apetito] ?? ''}, ${sidesNameEs[guarnicion] ?? ''}: ` +
      `comprá **${totalRawKg.toFixed(2)} kg** de carne cruda (${withBufferKg.toFixed(2)} kg con 10 % de margen). ` +
      `Esto equivale a aproximadamente ${(totalNetG / 1000).toFixed(2)} kg de carne cocida en el plato.`;
  }

  const _insight = {
    title: __lang === 'en' ? 'Raw meat to buy' : 'Carne cruda a comprar',
    text: __lang === 'en'
      ? `**${totalRawKg.toFixed(2)} kg** raw meat needed · **${withBufferKg.toFixed(2)} kg** with 10 % buffer · **${(totalNetG / 1000).toFixed(2)} kg** cooked yield`
      : `**${totalRawKg.toFixed(2)} kg** de carne cruda necesaria · **${withBufferKg.toFixed(2)} kg** con margen del 10 % · **${(totalNetG / 1000).toFixed(2)} kg** de carne cocida resultante`,
    tone: 'neutral',
    icon: '🥩',
  };

  return {
    resultado: `${totalRawKg.toFixed(2)} kg`,
    resumen,
    _insight,
  };
}
