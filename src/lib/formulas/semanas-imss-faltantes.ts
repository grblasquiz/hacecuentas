/**
 * Calculadora de semanas IMSS faltantes para pensión
 * Ley 97 (2026): 875 semanas (reforma 2020 en transición, llega a 1000 en 2031+)
 * Ley 73: 500 semanas
 */

export interface Inputs {
  semanasActuales: number;
  añoJubilacion?: number;
  semanasPorAno?: number;
  ley?: '97' | '73' | 97 | 73;
  // retro-compat
  semanasCotizadasActuales?: number;
  edad?: number;
}

export interface Outputs {
  semanasFaltantes: number;
  requisitoAplicable: number;
  añoCompletas: number;
  estaListo: string;
  aniosFaltan: number;
  porcentajeAvance: number;
  mensaje: string;
}

function requisitoLey97(anio: number): number {
  const table: Record<number, number> = {
    2021: 750, 2022: 775, 2023: 800, 2024: 825, 2025: 850,
    2026: 875, 2027: 900, 2028: 925, 2029: 950, 2030: 975,
  };
  if (anio <= 2020) return 750;
  if (anio >= 2031) return 1000;
  return table[anio] ?? 875;
}

export function semanasImssFaltantes(i: Inputs): Outputs {
  const semanas = Number(i.semanasActuales ?? i.semanasCotizadasActuales);
  const anioJubilacion = Number(i.añoJubilacion ?? 2030);
  const semanasPorAno = Number(i.semanasPorAno ?? 52);
  const ley = String(i.ley ?? '97');

  if (semanas === undefined || semanas === null || isNaN(semanas) || semanas < 0) {
    throw new Error('Ingresá las semanas cotizadas actuales');
  }

  const requisito = ley === '73' ? 500 : requisitoLey97(anioJubilacion);
  const semanasFaltan = Math.max(0, requisito - semanas);
  const aniosFaltan = Number((semanasFaltan / 52).toFixed(2));
  const porcentajeAvance = Number(Math.min(100, (semanas / requisito) * 100).toFixed(2));

  // Año en que las completa: desde el año actual (2026) sumando semanasFaltan/semanasPorAno
  const anioBase = 2026;
  const anioCompletas = semanasPorAno > 0
    ? anioBase + Math.ceil(semanasFaltan / semanasPorAno)
    : anioBase;

  const estaListoBool = semanasFaltan === 0 || anioCompletas <= anioJubilacion;

  return {
    semanasFaltantes: semanasFaltan,
    requisitoAplicable: requisito,
    añoCompletas: anioCompletas,
    estaListo: estaListoBool ? 'Sí alcanza' : 'No alcanza — seguí cotizando',
    aniosFaltan,
    porcentajeAvance,
    mensaje: semanasFaltan === 0
      ? `Ya tenés las ${requisito} semanas requeridas (Ley ${ley}). Avance: ${porcentajeAvance}%.`
      : `Te faltan ${semanasFaltan} semanas (~${aniosFaltan} años) para Ley ${ley} (requisito ${requisito}). Las completás en ${anioCompletas}.`,
  };
}
