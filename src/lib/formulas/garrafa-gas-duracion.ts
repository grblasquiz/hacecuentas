/** Duración estimada de una garrafa de gas según el uso y la cantidad de personas. */
export interface Inputs {
  tipo_garrafa?: string;
  uso?: string;
  personas?: number | string;
  __country?: string;
}

export interface Outputs {
  duracion_dias: number;
  consumo_mensual_kg: number;
  garrafas_por_mes: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function garrafaGasDuracion(i: Inputs): Outputs {
  const tipo_garrafa = String(i.tipo_garrafa || 'kg10');
  const uso = String(i.uso || 'solo_cocina');
  const personas = Math.max(0, Number(i.personas) || 0);

  const kgGarrafa: Record<string, number> = { kg10: 10, kg15: 15, kg45: 45 };
  // Consumo base en kg/mes para un hogar de 3 personas según el uso.
  const consumoBase: Record<string, number> = { solo_cocina: 6, cocina_calefon: 12, cocina_estufa: 18 };

  const kg = kgGarrafa[tipo_garrafa] || 10;
  const base = consumoBase[uso] || 6;

  if (personas <= 0) {
    return {
      duracion_dias: 0,
      consumo_mensual_kg: 0,
      garrafas_por_mes: 0,
      resumen: 'Cargá la cantidad de personas para estimar cuánto dura la garrafa.',
    };
  }

  const consumo_mensual_kg = Math.round(base * (personas / 3) * 10) / 10;
  const duracion_dias = consumo_mensual_kg > 0 ? Math.round((kg / consumo_mensual_kg) * 30) : 0;
  const garrafas_por_mes = Math.round((consumo_mensual_kg / kg) * 10) / 10;

  const usoLabel =
    uso === 'cocina_calefon' ? 'cocina + calefón' : uso === 'cocina_estufa' ? 'cocina + estufa' : 'solo cocina';
  const garrafaLabel = tipo_garrafa === 'kg15' ? 'de 15 kg' : tipo_garrafa === 'kg45' ? 'de 45 kg' : 'de 10 kg';

  const resumen = `Una garrafa ${garrafaLabel} para ${personas} persona${personas === 1 ? '' : 's'} con uso "${usoLabel}" dura unos ${duracion_dias} días. Consumo estimado: ${consumo_mensual_kg} kg/mes (${garrafas_por_mes} garrafas/mes).`;

  const out: Outputs = { duracion_dias, consumo_mensual_kg, garrafas_por_mes, resumen };

  out._insight = {
    title: 'Cuánto te dura la garrafa',
    text: `Con **${personas}** persona${personas === 1 ? '' : 's'} y uso "${usoLabel}", una garrafa ${garrafaLabel} rinde alrededor de **${duracion_dias} días**. Vas a gastar cerca de **${consumo_mensual_kg} kg por mes** (${garrafas_por_mes} garrafas). Es una estimación orientativa: depende mucho de los artefactos y de la época del año.`,
    tone: 'neutral',
    icon: '🔥',
  };

  return out;
}
