/**
 * Prebióticos y probióticos por condición.
 */

export interface PrebioticosProbioticosDiariosInputs {
  condicion: string;
}

export interface PrebioticosProbioticosDiariosOutputs {
  prebioticoGramos: number;
  probioticoUFC: string;
  cepaSugerida: string;
  alimentosPrebioticos: string;
  resumen: string;
  _insight?: any;
}

export function prebioticosProbioticosDiarios(inputs: PrebioticosProbioticosDiariosInputs): PrebioticosProbioticosDiariosOutputs {
  const c = inputs.condicion || 'mantenimiento';
  const map: Record<string, { pre: number; ufc: string; cepa: string }> = {
    'mantenimiento': { pre: 5, ufc: '1-5 mil millones', cepa: 'Yogur con L. bulgaricus + S. thermophilus' },
    'sii': { pre: 5, ufc: '10 mil millones', cepa: 'L. plantarum 299v o multi-cepa' },
    'antibioticos': { pre: 5, ufc: '10 mil millones', cepa: 'Saccharomyces boulardii (2 semanas)' },
    'diarrea-viajero': { pre: 0, ufc: '5-10 mil millones', cepa: 'S. boulardii o LGG' },
    'constipacion': { pre: 10, ufc: '10 mil millones', cepa: 'B. lactis BB-12' },
    'eczema': { pre: 5, ufc: '10 mil millones', cepa: 'L. rhamnosus GG' },
  };
  const r = map[c] ?? map['mantenimiento'];
  const etiquetas: Record<string, string> = {
    'mantenimiento': 'mantenimiento general',
    'sii': 'síndrome de intestino irritable',
    'antibioticos': 'soporte durante antibióticos',
    'diarrea-viajero': 'diarrea del viajero',
    'constipacion': 'constipación',
    'eczema': 'eczema',
  };
  const etiqueta = etiquetas[c] ?? 'mantenimiento general';
  const preTxt = r.pre > 0 ? `**${r.pre}g de prebiótico** y ` : 'enfocarte en ';
  const insight = {
    title: 'Tu pauta diaria',
    text: `Para **${etiqueta}**, la pauta orientativa es ${preTxt}**${r.ufc} UFC/día** de **${r.cepa}**. La cepa importa tanto como la dosis: distintas condiciones responden a cepas específicas. Consultá a un profesional antes de suplementar.`,
    tone: 'neutral',
    icon: '🦠',
  };
  return {
    prebioticoGramos: r.pre,
    probioticoUFC: `${r.ufc} UFC/día`,
    cepaSugerida: r.cepa,
    alimentosPrebioticos: 'Cebolla, ajo, banana, espárragos, avena, papa fría (almidón resistente)',
    resumen: `${r.pre}g prebiótico + ${r.ufc} UFC de ${r.cepa}`,
    _insight: insight,
  };
}
