/**
 * Calculadora de costo y vigencia de verificación vehicular México
 * Costo: 2.51 UMA diaria (aprox 2026). Vigencia depende del engomado
 * Valores proyectados 2026, validar contra fuente oficial SEDEMA
 */

export interface Inputs {
  tipoEngomado: string; // 'amarillo' | 'rosa' | 'rojo' | 'verde' | 'azul' | '00' | '0'
  uma?: number; // UMA diaria
}

export interface Outputs {
  costoPesos: number;
  vigenciaMeses: number;
  fechaSugerida: string;
  mensaje: string;
}

// Calendario aproximado por engomado (meses)
// Valores proyectados 2026, validar contra fuente oficial
const CALENDARIO_ENGOMADO: Record<string, { meses: number[], vigencia: number }> = {
  amarillo: { meses: [2, 8], vigencia: 6 },
  rosa: { meses: [3, 9], vigencia: 6 },
  rojo: { meses: [4, 10], vigencia: 6 },
  verde: { meses: [5, 11], vigencia: 6 },
  azul: { meses: [6, 12], vigencia: 6 },
  '00': { meses: [1, 7], vigencia: 24 },
  '0': { meses: [1, 7], vigencia: 12 },
};

export function verificacionVehicularMx(i: Inputs): Outputs {
  const tipo = (i.tipoEngomado ?? '').toLowerCase();
  const uma = Number(i.uma ?? 120); // UMA diaria 2026 aprox

  if (!tipo) throw new Error('Ingresá el tipo de engomado');
  if (!CALENDARIO_ENGOMADO[tipo]) {
    throw new Error('Tipo de engomado inválido (amarillo, rosa, rojo, verde, azul, 00, 0)');
  }

  const costoPesos = uma * 2.51;
  const { meses, vigencia } = CALENDARIO_ENGOMADO[tipo];

  // Próximo mes de verificación desde hoy
  const hoy = new Date();
  const mesActual = hoy.getMonth() + 1;
  const proximoMes = meses.find(m => m >= mesActual) ?? meses[0];
  const anioSugerido = proximoMes >= mesActual ? hoy.getFullYear() : hoy.getFullYear() + 1;
  const fechaSugerida = `${String(proximoMes).padStart(2, '0')}/${anioSugerido}`;

  return {
    costoPesos: Number(costoPesos.toFixed(2)),
    vigenciaMeses: vigencia,
    fechaSugerida,
    mensaje: `Verificación para engomado ${tipo}: $${costoPesos.toFixed(2)}, vigencia ${vigencia} meses. Próxima: ${fechaSugerida}.`,
  };
}
