/** Gramos diarios de balanceado según peso, edad, actividad y tipo */
export interface Inputs {
  pesoKg: number;
  edad?: string; // cachorro | adulto | senior
  actividad?: string; // baja | media | alta
  tipoAlimento?: string; // estandar | super_premium
  castrado?: boolean;
}
export interface Outputs {
  gramosPorDia: number;
  kcalPorDia: number;
  tomas: number;
  gramosPorToma: number;
  bolsaDuracion15kg: number;
  etapa: string;
  resumen: string;
  _insight?: any;
}

// RER (Resting Energy Requirement) kcal/día = 70 × (peso_kg)^0.75
// MER (Maintenance Energy Requirement) = factor × RER
const FACTOR_ETAPA: Record<string, number> = {
  cachorro_hasta_4m: 3.0,
  cachorro_4a12m: 2.0,
  adulto_activo: 1.8,
  adulto_normal: 1.6,
  adulto_bajo: 1.4,
  adulto_castrado: 1.4,
  senior_activo: 1.4,
  senior_normal: 1.2,
};

const KCAL_POR_G: Record<string, number> = {
  estandar: 3.3, // kcal/g balanceado mantenimiento estándar
  super_premium: 3.9, // balanceado super premium más denso
  medicado: 3.5,
};

export function comidaPerroDiaria(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).castrado = (i as any).castrado === true || (i as any).castrado === 'true';
  const peso = Number(i.pesoKg);
  const edad = String(i.edad || 'adulto');
  const act = String(i.actividad || 'media');
  const alim = String(i.tipoAlimento || 'estandar');
  const castrado = i.castrado === true;

  if (!peso || peso <= 0 || peso > 100) throw new Error('Ingresá el peso en kg (1-100)');

  const RER = 70 * Math.pow(peso, 0.75);

  // Elegir factor MER
  let clave = 'adulto_normal';
  if (edad === 'cachorro') {
    clave = peso < 5 ? 'cachorro_hasta_4m' : 'cachorro_4a12m';
  } else if (edad === 'senior') {
    clave = act === 'alta' ? 'senior_activo' : 'senior_normal';
  } else {
    if (castrado) clave = 'adulto_castrado';
    else if (act === 'alta') clave = 'adulto_activo';
    else if (act === 'baja') clave = 'adulto_bajo';
    else clave = 'adulto_normal';
  }

  const factor = FACTOR_ETAPA[clave];
  const kcalDia = RER * factor;

  const kcalG = KCAL_POR_G[alim] || 3.3;
  const gramos = kcalDia / kcalG;

  // Tomas diarias recomendadas
  let tomas = 2;
  if (edad === 'cachorro') tomas = peso < 5 ? 4 : 3;
  else if (edad === 'senior') tomas = 2;

  const gramosPorToma = gramos / tomas;

  // Duración de una bolsa de 15 kg
  const duracion = 15000 / gramos;

  let etapa = '';
  if (edad === 'cachorro') etapa = 'Cachorro en crecimiento';
  else if (edad === 'senior') etapa = 'Adulto senior (7+ años)';
  else etapa = castrado ? 'Adulto castrado' : act === 'alta' ? 'Adulto activo' : act === 'baja' ? 'Adulto sedentario' : 'Adulto estándar';

  const gramosR = Math.round(gramos);
  const kcalR = Math.round(kcalDia);
  const gPorTomaR = Math.round(gramosPorToma);
  const duracionR = Math.round(duracion);

  const propensoPeso = castrado || (edad === 'adulto' && act === 'baja') || edad === 'senior';
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (edad === 'cachorro') {
    insightText = `Como **cachorro en crecimiento** necesita **${gramosR} g/día** (${kcalR} kcal) en **${tomas} tomas** de ~${gPorTomaR} g: comer seguido sostiene su energía y desarrollo. Reajustá la ración a medida que gana peso.`;
    insightTone = 'good';
    insightIcon = '🐶';
  } else if (propensoPeso) {
    insightText = `Por ser **${etapa.toLowerCase()}** gasta menos energía: con **${gramosR} g/día** (${kcalR} kcal) conviene pesar la ración y no improvisar a ojo, porque es el perfil más propenso a engordar.`;
    insightTone = 'warn';
    insightIcon = '⚖️';
  } else {
    insightText = `Tu perro necesita **${gramosR} g/día** (${kcalR} kcal) en **${tomas} tomas** de ~${gPorTomaR} g. Una bolsa de 15 kg le dura unos **${duracionR} días**, útil para planificar la compra.`;
    insightTone = 'neutral';
    insightIcon = '🐶';
  }

  return {
    gramosPorDia: gramosR,
    kcalPorDia: kcalR,
    tomas,
    gramosPorToma: gPorTomaR,
    bolsaDuracion15kg: duracionR,
    etapa,
    resumen: `Tu perro de ${peso} kg (${etapa}) necesita ~${gramosR} g/día (${kcalR} kcal), repartido en ${tomas} tomas de ${gPorTomaR} g.`,
    _insight: {
      title: 'Qué significa esta ración',
      text: insightText,
      tone: insightTone,
      icon: insightIcon,
    },
  };
}
