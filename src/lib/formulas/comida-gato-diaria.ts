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

  return {
    gramosSecoPorDia: Math.round(gSeco),
    gramosHumedoPorDia: Math.round(gHumedo),
    kcalPorDia: Math.round(kcalDia),
    tomas,
    gramosPorToma: Math.round(gramosPorToma),
    aguaRecomendadaMl: Math.round(agua),
    etapa,
    resumen: `Tu gato de ${peso} kg (${etapa}) necesita ~${Math.round(gSeco)} g de seco o ~${Math.round(gHumedo)} g de húmedo/día (${Math.round(kcalDia)} kcal).`,
  };
}
