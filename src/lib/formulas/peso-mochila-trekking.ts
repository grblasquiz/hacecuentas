/** Peso ideal de mochila para trekking */
export interface PesoMochilaTrekkingInputs {
  pesoPersona: number;
  duracion?: string;
  nivel?: string;
}
export interface PesoMochilaTrekkingOutputs {
  pesoMaximoKg: number;
  pesoIdealKg: number;
  porcentajePeso: number;
  detalle: string;
}

interface DuracionConfig {
  pctIdeal: number;
  pctMax: number;
}

const DURACIONES: Record<string, DuracionConfig> = {
  dia: { pctIdeal: 10, pctMax: 15 },
  '2-3-dias': { pctIdeal: 18, pctMax: 22 },
  semana: { pctIdeal: 20, pctMax: 25 },
  'mas-semana': { pctIdeal: 22, pctMax: 25 },
};

const AJUSTE_NIVEL: Record<string, number> = {
  principiante: 3,  // suma al porcentaje (equipo más pesado)
  intermedio: 0,
  avanzado: -4,     // resta (equipo ultralight)
};

export function pesoMochilaTrekking(inputs: PesoMochilaTrekkingInputs): PesoMochilaTrekkingOutputs {
  const peso = Number(inputs.pesoPersona);
  const duracion = String(inputs.duracion || 'dia');
  const nivel = String(inputs.nivel || 'intermedio');

  if (!peso || peso <= 0) throw new Error('Ingresá tu peso corporal en kg');
  if (!DURACIONES[duracion]) throw new Error('Duración no válida');
  if (!(nivel in AJUSTE_NIVEL)) throw new Error('Nivel no válido');

  const d = DURACIONES[duracion];
  const ajuste = AJUSTE_NIVEL[nivel];

  const pctIdeal = Math.max(8, d.pctIdeal + ajuste);
  const pctMax = Math.max(10, d.pctMax + ajuste);

  const pesoIdeal = Number(((peso * pctIdeal) / 100).toFixed(1));
  const pesoMax = Number(((peso * pctMax) / 100).toFixed(1));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    pesoMaximoKg: pesoMax,
    pesoIdealKg: pesoIdeal,
    porcentajePeso: pctIdeal,
    detalle: `Persona de ${fmt.format(peso)} kg, trekking ${duracion.replace(/-/g, ' ')}, nivel ${nivel} → peso ideal ${fmt.format(pesoIdeal)} kg (${pctIdeal}%), máximo ${fmt.format(pesoMax)} kg (${pctMax}%).`,
  };
}
