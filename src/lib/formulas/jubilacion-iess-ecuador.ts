/** Pensión de jubilación por vejez del IESS (Ecuador) — estimación.
 *  Pensión ≈ promedio de los 5 mejores años × coeficiente por años de aportación.
 *  Coeficientes orientativos; el cálculo oficial lo realiza el IESS. */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  promedioSueldo5Años: number;
  aniosAportados: number;
  edad: number;
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Coeficiente referencial sobre el promedio de los 5 mejores años, según años imponibles.
function coeficientePorAnios(anios: number): number {
  if (anios < 10) return 0;        // mínimo 10 años (120 aportes) para pensión de vejez
  if (anios < 15) return 0.435;
  if (anios < 20) return 0.50;
  if (anios < 25) return 0.60;
  if (anios < 30) return 0.70;
  if (anios < 35) return 0.80;
  if (anios < 40) return 0.90;
  return 1.00;
}

export function compute(i: Inputs): Outputs {
  const promedio = Number(i.promedioSueldo5Años) || 0;
  const anios = Math.max(0, Number(i.aniosAportados) || 0);
  const edad = Math.max(0, Number(i.edad) || 0);
  if (promedio <= 0) throw new Error('Ingresá el promedio de tus 5 mejores años de sueldo');
  if (anios <= 0) throw new Error('Ingresá tus años de aportación');

  const cumpleAportes = anios >= 10;
  const coef = coeficientePorAnios(anios);
  let pension = promedio * coef;

  // Pisos referenciales del IESS según años de aportación (sobre el SBU).
  const pisoMinimo = anios >= 40 ? ECUADOR_2026.sbu : anios >= 30 ? ECUADOR_2026.sbu * 0.75 : ECUADOR_2026.sbu * 0.5;
  if (cumpleAportes && pension < pisoMinimo) pension = pisoMinimo;
  if (!cumpleAportes) pension = 0;

  // Requisito de edad (referencial): 60 años con 30 de aporte, 65 con 15, 70 con 10.
  let cumpleEdad = false;
  let reqEdad = 70;
  if (anios >= 30) reqEdad = 60;
  else if (anios >= 15) reqEdad = 65;
  else reqEdad = 70;
  cumpleEdad = edad >= reqEdad;

  const decimoTercero = pension / 12; // décimo tercero del pensionista (proporcional al año)
  const decimoCuarto = ECUADOR_2026.decimoCuarto / 12;

  const _insight = {
    title: 'Estimación de tu pensión',
    text: !cumpleAportes
      ? `Con **${anios} años** de aportación no alcanzás el mínimo de **10 años (120 aportes)** que exige el IESS para la pensión de vejez. Seguí aportando o consultá la devolución de aportes.`
      : `Con **${anios} años** de aportación y un promedio de **${fmtUSDec(promedio)}**, tu pensión estimada es de **${fmtUSDec(pension)}** mensuales (coeficiente ${(coef * 100).toFixed(1)}%). ${cumpleEdad ? `Ya cumplís la edad (${reqEdad} años).` : `Necesitás **${reqEdad} años** de edad para acceder con tus años de aporte.`} Es una estimación: el cálculo oficial lo hace el IESS.`,
    tone: cumpleAportes && cumpleEdad ? 'good' : 'warning',
    icon: '👵',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(pension * 100) / 100,
    min: 0,
    max: Math.round(promedio * 100) / 100,
    label: fmtUSDec(pension),
    ariaLabel: `Pensión estimada ${fmtUSDec(pension)} sobre un promedio de ${fmtUSDec(promedio)}.`,
  };

  return {
    pensionMensual: fmtUSDec(pension),
    coeficiente: (coef * 100).toFixed(1) + '%',
    decimoTercero: fmtUSDec(decimoTercero),
    decimoCuarto: fmtUSDec(decimoCuarto),
    detalle: `Promedio ${fmtUSDec(promedio)} × coeficiente ${(coef * 100).toFixed(1)}% (${anios} años). Requisito de edad: ${reqEdad} años. ${cumpleAportes ? '' : 'No cumple aportes mínimos.'}`,
    _insight,
    _chart,
  };
}
