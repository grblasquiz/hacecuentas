/** Carbón (y leña opcional) para un asado según la cantidad de comensales. */
export interface Inputs {
  personas?: number | string;
  tipo_asado?: string;
  incluir_lena?: string;
  __country?: string;
}

export interface Outputs {
  carbon_kg: number;
  lena_kg: number;
  pastillas: number;
  tiempo_brasas_min: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function carbonAsadoKg(i: Inputs): Outputs {
  const p = Math.max(0, Math.floor(Number(i.personas) || 0));
  const tipo = String(i.tipo_asado || 'normal');
  const incluirLena = String(i.incluir_lena || 'no') === 'si';

  // kg de carbón por persona según cuánto dure el asado
  const factor = tipo === 'rapido' ? 0.6 : tipo === 'largo' ? 1.3 : 0.9;
  const carbon_kg = p > 0 ? Math.ceil(p * factor * 2) / 2 : 0; // redondeo a 0,5 kg
  const lena_kg = p > 0 && incluirLena ? Math.ceil(p * 0.3 * 2) / 2 : 0;
  const pastillas = p > 0 ? Math.max(2, Math.ceil(carbon_kg / 1.5)) : 0;
  const tiempo_brasas_min = p > 0 ? (tipo === 'rapido' ? 30 : tipo === 'largo' ? 45 : 40) : 0;

  const resumen = p > 0
    ? `Para ${p} personas: ${carbon_kg} kg de carbón${incluirLena ? ` + ${lena_kg} kg de leña` : ''}, ${pastillas} pastillas de encendido y ~${tiempo_brasas_min} min hasta tener brasas.`
    : 'Cargá la cantidad de personas para calcular el carbón.';

  const out: Outputs = { carbon_kg, lena_kg, pastillas, tiempo_brasas_min, resumen };

  if (p > 0) {
    out._insight = {
      title: 'Cuánto carbón comprar',
      text: `Para **${p}** comensales calculá **${carbon_kg} kg** de carbón${incluirLena ? ` y **${lena_kg} kg** de leña` : ''}. Regla práctica: entre 0,6 y 1,3 kg de carbón por persona según lo largo que sea el asado.`,
      tone: 'neutral',
      icon: '🔥',
    };
    if (incluirLena && lena_kg > 0) {
      out._chart = {
        type: 'doughnut',
        slices: [
          { label: 'Carbón', value: carbon_kg },
          { label: 'Leña', value: lena_kg },
        ],
        centerValue: `${(carbon_kg + lena_kg).toFixed(1)} kg`,
        centerLabel: 'Combustible',
        ariaLabel: `${carbon_kg} kg de carbón y ${lena_kg} kg de leña.`,
      };
    }
  }

  return out;
}
