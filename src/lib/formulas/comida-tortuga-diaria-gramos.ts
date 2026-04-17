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

  return {
    gramosDia: gramos,
    frecuencia,
    composicion,
    suplementos,
    alimentosProhibidos: prohibidos,
  };
}
