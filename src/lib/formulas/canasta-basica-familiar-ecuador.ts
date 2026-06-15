/**
 * Canasta Básica Familiar (Ecuador) — compara el ingreso familiar mensual contra
 * el costo de la Canasta Básica Familiar y la Canasta Vital del INEC (marzo 2026)
 * y devuelve el porcentaje cubierto, la brecha y el remanente.
 * Ecuador está dolarizado → todos los montos en USD ("$"), sin conversión.
 * Fuente de datos: INEC, https://www.ecuadorencifras.gob.ec/canasta/ (marzo 2026).
 */
import { CANASTA_INEC_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  /** Ingreso familiar mensual neto del hogar (suma de todos los perceptores), en USD. */
  ingresoFamiliar: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoFamiliar);
  if (!Number.isFinite(ingreso) || ingreso <= 0) {
    throw new Error('Ingresá el ingreso familiar mensual del hogar (mayor a 0)');
  }

  const cbf = CANASTA_INEC_2026.basicaFamiliar;   // $829,38 — Canasta Básica Familiar
  const vital = CANASTA_INEC_2026.vital;          // $579,20 — Canasta Vital

  // Cobertura respecto de la Canasta Básica Familiar.
  const pctCubiertoCBF = (ingreso / cbf) * 100;
  const brechaCBF = cbf - ingreso;                // >0 = te falta ; <0 = te sobra
  const remanenteCBF = ingreso - cbf;             // >0 = superávit (lo que sobra)

  // Cobertura respecto de la Canasta Vital (mínimo de subsistencia).
  const pctCubiertoVital = (ingreso / vital) * 100;
  const brechaVital = vital - ingreso;
  const remanenteVital = ingreso - vital;

  const cubreCBF = ingreso >= cbf;
  const cubreVital = ingreso >= vital;

  // Redondeos a 2 decimales para los porcentajes mostrados.
  const r2 = (n: number) => Math.round(n * 100) / 100;
  const pctCBF = r2(pctCubiertoCBF);
  const pctVital = r2(pctCubiertoVital);

  // Estado para el insight.
  let estado: string;
  let tone: 'positive' | 'neutral' | 'warning' | 'negative';
  let icon: string;
  if (cubreCBF) {
    estado = `Tu ingreso familiar cubre la Canasta Básica Familiar y te queda un superávit de **${fmtUSDec(remanenteCBF)}** al mes (${r2(pctCBF - 100)}% por encima del costo de la canasta).`;
    tone = 'positive';
    icon = '🟢';
  } else if (cubreVital) {
    estado = `Tu ingreso cubre la Canasta Vital pero no llega a la Canasta Básica Familiar: te faltan **${fmtUSDec(brechaCBF)}** al mes para cubrirla por completo (cubrís el ${pctCBF}%).`;
    tone = 'warning';
    icon = '🟡';
  } else {
    estado = `Tu ingreso no alcanza ni la Canasta Vital: te faltan **${fmtUSDec(brechaVital)}** para el mínimo de subsistencia y **${fmtUSDec(brechaCBF)}** para la Canasta Básica Familiar.`;
    tone = 'negative';
    icon = '🔴';
  }

  const _insight = {
    title: 'Cuánto cubre tu ingreso',
    text: estado,
    tone,
    icon,
  };

  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Tu ingreso familiar', value: r2(ingreso) },
      { label: 'Canasta Básica Familiar', value: cbf },
      { label: 'Canasta Vital', value: vital },
    ],
    ariaLabel: `Ingreso familiar ${fmtUSDec(ingreso)} comparado con la Canasta Básica Familiar de ${fmtUSDec(cbf)} y la Canasta Vital de ${fmtUSDec(vital)}.`,
  };

  return {
    porcentajeCubiertoCBF: `${pctCBF.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    brechaCBF: cubreCBF ? `Superávit de ${fmtUSDec(remanenteCBF)}` : `Te faltan ${fmtUSDec(brechaCBF)}`,
    porcentajeCubiertoVital: `${pctVital.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`,
    canastaBasicaFamiliar: fmtUSDec(cbf),
    canastaVital: fmtUSDec(vital),
    detalle: `Ingreso ${fmtUSDec(ingreso)} vs CBF ${fmtUSDec(cbf)} → cubrís el ${pctCBF}% (${cubreCBF ? 'superávit' : 'brecha'} de ${fmtUSDec(Math.abs(remanenteCBF))}). Vital ${fmtUSDec(vital)} → cubrís el ${pctVital}%.`,
    _insight,
    _chart,
  };
}
