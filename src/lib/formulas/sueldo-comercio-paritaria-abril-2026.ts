/**
 * Sueldo Empleados de Comercio — CCT 130/75, paritaria abril 2026.
 * Básicos remunerativos + no remunerativos acuerdo CAC-FAECyS vigente.
 * Categorías A (Maestranza), B (Administrativo), C (Vendedor), D (Especializado).
 * Antigüedad 1% por año sobre básico.
 */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }

const BASICOS_ABRIL_2026: Record<string, number> = {
  A: 945000,  // Maestranza A
  B: 970000,  // Administrativo B
  C: 995000,  // Vendedor C
  D: 1025000, // Auxiliar especializado D
};

const NO_REM_ABRIL_2026 = 80000;
const PRESENTISMO_PCT = 8.33;

export function sueldoComercioParitariaAbril2026(i: Inputs): Outputs {
  const cat = String(i.categoria || 'B').toUpperCase();
  const antiguedadAnios = Math.max(0, Number(i.antiguedadAnios) || 0);
  const jornada = Math.max(1, Math.min(8, Number(i.jornadaHoras) || 8));

  const basico = BASICOS_ABRIL_2026[cat] ?? BASICOS_ABRIL_2026.B;
  const factor = jornada / 8;
  const basicoAjust = basico * factor;
  const antiguedad = basicoAjust * 0.01 * antiguedadAnios;
  const presentismo = (basicoAjust + antiguedad) * (PRESENTISMO_PCT / 100);
  const remunerativo = basicoAjust + antiguedad + presentismo;

  const noRem = NO_REM_ABRIL_2026 * factor;
  const bruto = remunerativo + noRem;

  // Aportes sólo sobre remunerativo: jubilación 11% + ley 19.032 3% + obra social 3%
  const aportes = remunerativo * 0.17;
  const neto = bruto - aportes;

  const fmt = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
  return {
    sueldoBruto: fmt(bruto),
    sueldoNeto: fmt(neto),
    basico: fmt(basicoAjust),
    antiguedad: fmt(antiguedad),
    presentismo: fmt(presentismo),
    noRemunerativo: fmt(noRem),
    aportes: fmt(aportes),
    categoria: `Cat. ${cat} (CCT 130/75)`,
  };
}
