/** Gramos de alimento para gato según peso, edad y actividad */
export interface Inputs {
  pesoKg: number;
  edad?: string; // gatito | adulto | senior
  actividad?: string; // interior | mixto | exterior
  tipoAlimento?: string; // seco | humedo | mixto
  castrado?: boolean;
}
export interface Outputs {
  gramosSecoPorDia: number;
  gramosHumedoPorDia: number;
  kcalPorDia: number;
  tomas: number;
  gramosPorToma: number;
  aguaRecomendadaMl: number;
  etapa: string;
  resumen: string;
  _insight?: any;
}

const FACTORES: Record<string, number> = {
  gatito_hasta_4m: 2.5,
  gatito_4a12m: 2.0,
  adulto_activo: 1.4,
  adulto_interior: 1.0,
  adulto_castrado: 1.0,
  senior: 1.1,
};

export function comidaGatoDiaria(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar.
  (i as any).castrado = (i as any).castrado === true || (i as any).castrado === 'true';
  const peso = Number(i.pesoKg);
  const edad = String(i.edad || 'adulto');
  const act = String(i.actividad || 'interior');
  const alim = String(i.tipoAlimento || 'seco');
  const castrado = i.castrado === true;

  if (!peso || peso <= 0 || peso > 15) throw new Error('Ingresá el peso del gato (1-15 kg)');

  // RER gato = 70 × peso^0.75
  const RER = 70 * Math.pow(peso, 0.75);

  let clave = 'adulto_interior';
  if (edad === 'gatito') clave = peso < 2 ? 'gatito_hasta_4m' : 'gatito_4a12m';
  else if (edad === 'senior') clave = 'senior';
  else {
    if (castrado) clave = 'adulto_castrado';
    else if (act === 'exterior') clave = 'adulto_activo';
    else clave = 'adulto_interior';
  }

  const kcalDia = RER * FACTORES[clave];

  // Densidades típicas: seco 3.8 kcal/g, húmedo 0.9 kcal/g
  const gSeco = kcalDia / 3.8;
  const gHumedo = kcalDia / 0.9;

  let tomas = 2;
  if (edad === 'gatito') tomas = peso < 2 ? 4 : 3;

  const gramosPorToma = gSeco / tomas;

  // Agua: gatos ~60 ml/kg/día (base). Si come solo seco, más; solo húmedo, aporta ~75% de agua.
  let agua = peso * 60;
  if (alim === 'seco') agua *= 1.0;
  else if (alim === 'humedo') agua *= 0.4; // se cubre mucho con la comida
  else agua *= 0.7;

  let etapa = '';
  if (edad === 'gatito') etapa = 'Gatito en crecimiento';
  else if (edad === 'senior') etapa = 'Senior (7+ años)';
  else etapa = castrado ? 'Adulto castrado' : 'Adulto estándar';

  const gSecoR = Math.round(gSeco);
  const gHumedoR = Math.round(gHumedo);
  const kcalR = Math.round(kcalDia);
  const gPorTomaR = Math.round(gramosPorToma);

  const propensoPeso = (castrado || edad === 'senior' || (edad === 'adulto' && act === 'interior'));
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (edad === 'gatito') {
    insightText = `Como **gatito en crecimiento** repartí los **${gSecoR} g** en **${tomas} tomas** de ~${gPorTomaR} g: necesita comer seguido y a libre demanda controlada para sostener el desarrollo.`;
    insightTone = 'good';
    insightIcon = '🐱';
  } else if (propensoPeso) {
    insightText = `Por ser **${etapa.toLowerCase()}** quema menos: con **${kcalR} kcal/día** (${gSecoR} g de seco) es clave pesar la ración y no dejar el plato lleno todo el día, porque es el perfil más propenso al sobrepeso.`;
    insightTone = 'warn';
    insightIcon = '⚖️';
  } else {
    insightText = `Tu gato necesita **${gSecoR} g de seco** o **${gHumedoR} g de húmedo** al día (**${kcalR} kcal**), repartidos en ${tomas} tomas de ~${gPorTomaR} g.`;
    insightTone = 'neutral';
    insightIcon = '🐱';
  }
  if (alim === 'seco') {
    insightText += ` Como comés solo seco, asegurá **${Math.round(agua)} ml de agua** fresca diaria: los gatos beben poco y el alimento seco no aporta humedad.`;
  }

  return {
    gramosSecoPorDia: gSecoR,
    gramosHumedoPorDia: gHumedoR,
    kcalPorDia: kcalR,
    tomas,
    gramosPorToma: gPorTomaR,
    aguaRecomendadaMl: Math.round(agua),
    etapa,
    resumen: `Tu gato de ${peso} kg (${etapa}) necesita ~${gSecoR} g de seco o ~${gHumedoR} g de húmedo/día (${kcalR} kcal).`,
    _insight: {
      title: 'Qué significa esta ración',
      text: insightText,
      tone: insightTone,
      icon: insightIcon,
    },
  };
}
