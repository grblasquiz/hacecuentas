/** Leña necesaria para pasar el invierno según horas por día, meses y tipo de calefactor. */
export interface Inputs {
  horas_dia?: number | string;
  meses?: number | string;
  tipo?: string;
  __country?: string;
}

export interface Outputs {
  lena_kg: number;
  lena_m3: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function lenaEstufaHogarInvierno(i: Inputs): Outputs {
  const horas_dia = Math.max(0, Number(i.horas_dia) || 0);
  const meses = Math.max(0, Number(i.meses) || 0);
  const tipo = String(i.tipo || 'salamandra');

  // Consumo de leña en kg por hora según el tipo de calefactor.
  const kgHora: Record<string, number> = { salamandra: 3, hogar_abierto: 5, alto_rendimiento: 2 };
  const consumo = kgHora[tipo] || 3;

  if (horas_dia <= 0 || meses <= 0) {
    return {
      lena_kg: 0,
      lena_m3: 0,
      resumen: 'Cargá las horas por día y los meses de uso para calcular la leña.',
    };
  }

  const lena_kg = Math.round(horas_dia * 30 * meses * consumo);
  // Leña seca estibada pesa ~400 kg por m³.
  const lena_m3 = Math.round((lena_kg / 400) * 100) / 100;

  const tipoLabel =
    tipo === 'hogar_abierto' ? 'hogar abierto' : tipo === 'alto_rendimiento' ? 'estufa de alto rendimiento' : 'salamandra';

  const resumen = `Con ${tipoLabel}, ${horas_dia} h por día durante ${meses} mes${meses === 1 ? '' : 'es'}, vas a necesitar unos ${lena_kg} kg de leña (${lena_m3} m³ estibados).`;

  const out: Outputs = { lena_kg, lena_m3, resumen };

  out._insight = {
    title: 'Cuánta leña comprar para el invierno',
    text: `Encendiendo la ${tipoLabel} **${horas_dia} h por día** durante **${meses} mes${meses === 1 ? '' : 'es'}**, vas a quemar cerca de **${lena_kg} kg** de leña, o sea unos **${lena_m3} m³** estibados. Comprar seca y por adelantado suele salir más barato que comprar de a poco en pleno invierno.`,
    tone: 'neutral',
    icon: '🪵',
  };

  return out;
}
