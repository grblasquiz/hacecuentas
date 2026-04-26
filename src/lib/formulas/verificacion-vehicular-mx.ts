/**
 * Calculadora de costo y vigencia de verificación vehicular México
 * Costo base: 2.51 UMA diaria (aprox 2026). Multa extemporánea: 20 UMA.
 * Vigencia depende del holograma (00 = 24 meses, 0 = 12 meses, 1/2 = 6 meses).
 */

export interface Inputs {
  tipoHolograma: string; // '00' | '0' | '1' | '2'
  entidad?: string;
  fueraCalendario?: 'si' | 'no' | boolean;
  uma?: number;
  // retro-compat
  tipoEngomado?: string;
}

export interface Outputs {
  costoTotal: number;
  costoBase: number;
  multa: number;
  proximaFecha: string;
  vigenciaMeses: number;
  mensaje: string;
}

// Vigencia por holograma (meses)
const VIGENCIA_HOLOGRAMA: Record<string, number> = {
  '00': 24,
  '0': 12,
  '1': 6,
  '2': 6,
};

// Engomados (retro-compat)
const CALENDARIO_ENGOMADO: Record<string, { meses: number[], vigencia: number }> = {
  amarillo: { meses: [2, 8], vigencia: 6 },
  rosa: { meses: [3, 9], vigencia: 6 },
  rojo: { meses: [4, 10], vigencia: 6 },
  verde: { meses: [5, 11], vigencia: 6 },
  azul: { meses: [6, 12], vigencia: 6 },
};

export function verificacionVehicularMx(i: Inputs): Outputs {
  const tipoRaw = String(i.tipoHolograma ?? i.tipoEngomado ?? '').toLowerCase();
  // UMA diaria 2026 según INEGI/DOF (vigente desde 1-feb-2026): $113.14
  const uma = Number(i.uma ?? 113.14);
  const fueraCalendario = i.fueraCalendario === true || i.fueraCalendario === 'si';

  if (!tipoRaw) throw new Error('Ingresá el tipo de holograma');

  let vigencia: number;
  if (VIGENCIA_HOLOGRAMA[tipoRaw] !== undefined) {
    vigencia = VIGENCIA_HOLOGRAMA[tipoRaw];
  } else if (CALENDARIO_ENGOMADO[tipoRaw]) {
    vigencia = CALENDARIO_ENGOMADO[tipoRaw].vigencia;
  } else {
    throw new Error('Holograma inválido (00, 0, 1, 2) o engomado (amarillo, rosa, rojo, verde, azul)');
  }

  const costoBase = uma * 2.51;
  const multa = fueraCalendario ? uma * 20 : 0;
  const costoTotal = costoBase + multa;

  // Próxima fecha: hoy + vigencia meses
  const hoy = new Date();
  const proxima = new Date(hoy.getFullYear(), hoy.getMonth() + vigencia, 1);
  const proximaFecha = `${String(proxima.getMonth() + 1).padStart(2, '0')}/${proxima.getFullYear()}`;

  return {
    costoTotal: Number(costoTotal.toFixed(2)),
    costoBase: Number(costoBase.toFixed(2)),
    multa: Number(multa.toFixed(2)),
    proximaFecha,
    vigenciaMeses: vigencia,
    mensaje: `Verificación (holograma ${tipoRaw}): costo base $${costoBase.toFixed(2)}${multa > 0 ? ` + multa $${multa.toFixed(2)}` : ''} = $${costoTotal.toFixed(2)}. Próxima: ${proximaFecha}.`,
  };
}
