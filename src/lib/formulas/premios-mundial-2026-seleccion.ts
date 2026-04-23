/**
 * Calculadora de premios del Mundial FIFA 2026 (selecciones) por fase alcanzada.
 *
 * Pool estimado: $440 millones USD (FIFA, referencia Qatar 2022 fue $440M).
 *  - Participación (fase de grupos eliminado): $9.000.000
 *  - Eliminado en 16avos: $13.000.000
 *  - Eliminado en 8vos (cuartos): $18.000.000
 *  - Eliminado en semifinal (4º lugar): $27.000.000
 *  - Eliminado en semifinal (3º lugar, ganó bronce): $28.000.000
 *  - Subcampeón: $30.000.000
 *  - Campeón: $42.000.000
 *
 * Además FIFA paga ~$1.5M por selección para preparación (flat).
 */

export interface PremiosMundial2026Inputs {
  faseAlcanzada: string; // 'grupos' | '16avos' | 'cuartos' | 'semi' | 'cuartoLugar' | 'tercero' | 'subcampeon' | 'campeon'
}

export interface PremiosMundial2026Outputs {
  premioTotal: number;
  premioFase: number;
  bonusPreparacion: number;
  detalle: string;
  faseLabel: string;
}

const PREMIOS_M26: Record<string, number> = {
  grupos: 9000000,
  '16avos': 13000000,
  cuartos: 18000000,
  cuartoLugar: 27000000,
  tercero: 28000000,
  subcampeon: 30000000,
  campeon: 42000000,
};

const LABELS_M26: Record<string, string> = {
  grupos: 'Eliminado en fase de grupos',
  '16avos': 'Eliminado en 16avos de final',
  cuartos: 'Eliminado en cuartos de final (8vos)',
  cuartoLugar: '4º lugar',
  tercero: '3º lugar (ganó por tercer puesto)',
  subcampeon: 'Subcampeón (2º lugar)',
  campeon: 'Campeón del Mundo',
};

export function premiosMundial2026Seleccion(
  inputs: PremiosMundial2026Inputs
): PremiosMundial2026Outputs {
  const fase = String(inputs.faseAlcanzada || 'grupos').toLowerCase();
  // normalizar 4ºlugar
  const key = Object.keys(PREMIOS_M26).find(
    (k) => k.toLowerCase() === fase
  );
  if (!key) throw new Error('Fase no reconocida');

  const premioFase = PREMIOS_M26[key];
  const bonusPreparacion = 1500000;
  return {
    premioTotal: premioFase + bonusPreparacion,
    premioFase,
    bonusPreparacion,
    detalle: `${LABELS_M26[key]}: $${premioFase.toLocaleString('es-AR')} + preparación $${bonusPreparacion.toLocaleString('es-AR')}`,
    faseLabel: LABELS_M26[key],
  };
}
