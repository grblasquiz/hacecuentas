/** Comida diaria de tortuga en gramos según especie y peso. */
export interface Inputs {
  especie?: string;
  pesoGr: number;
  etapa?: string;
}
export interface Outputs {
  gramosDia: number;
  frecuencia: string;
  composicion: string;
  suplementos: string;
  alimentosProhibidos: string;
  _insight?: any;
}

export function comidaTortugaDiariaGramos(i: Inputs): Outputs {
  const peso = Number(i.pesoGr);
  if (!peso || peso <= 0) throw new Error('Ingresá el peso de la tortuga');
  const especie = String(i.especie || 'mediterranea');
  const etapa = String(i.etapa || 'juvenil');

  const esAcuatica = especie === 'trachemys' || especie === 'otra-acuatica';

  // % del peso
  let pct = 0.02;
  if (etapa === 'cria') pct = 0.045;
  else if (etapa === 'juvenil') pct = 0.03;

  // Acuáticas comen menos (proporcional)
  if (esAcuatica) pct = pct * 0.7;

  const gramos = Math.round(peso * pct);

  const frecuencia = esAcuatica
    ? etapa === 'cria' ? 'Diario' : etapa === 'juvenil' ? 'Cada 2 días' : 'Cada 2-3 días'
    : etapa === 'adulto' ? 'Diario o día por medio' : 'Diario';

  const composicion = esAcuatica
    ? 'Balanceado específico + verduras (lechuga romana, endivia, achicoria) + proteína animal ocasional (gambas, pellet rico).'
    : '70% hojas verdes oscuras (achicoria, berro, diente de león), 20% vegetales (zapallo, calabaza, pimiento), 5-10% fruta ocasional.';

  const suplementos = 'Calcio (jibia flotante o carbonato) diario. Multivitamínico 2 veces/semana. UVB 10.0 obligatorio, reemplazar cada 6-12 meses.';

  const prohibidos = 'Lechuga iceberg, pan, lácteos, chocolate, ajo, cebolla, comida humana condimentada, carne roja salada.';

  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  if (etapa === 'cria') {
    insightText = `Como **cría** tu tortuga come **${gramos} g por día** (frecuencia: ${frecuencia.toLowerCase()}): en esta etapa el calcio diario y la lámpara **UVB** no son opcionales, son lo que evita el caparazón blando y deforme.`;
    insightTone = 'warn';
  } else if (esAcuatica) {
    insightText = `Tu tortuga acuática necesita **${gramos} g por día** (${frecuencia.toLowerCase()}). Comen menos seguido que las terrestres: el exceso de comida ensucia el agua y favorece infecciones, así que retirá lo que no consuma.`;
    insightTone = 'neutral';
  } else {
    insightText = `Tu tortuga terrestre necesita **${gramos} g por día** (${frecuencia.toLowerCase()}), con base de hojas verdes oscuras. El calcio y la **UVB** son clave: sin radiación UVB no fija el calcio aunque coma bien.`;
    insightTone = 'neutral';
  }

  return {
    gramosDia: gramos,
    frecuencia,
    composicion,
    suplementos,
    alimentosProhibidos: prohibidos,
    _insight: {
      title: 'Qué significa esta ración',
      text: insightText,
      tone: insightTone,
      icon: '🐢',
    },
  };
}
