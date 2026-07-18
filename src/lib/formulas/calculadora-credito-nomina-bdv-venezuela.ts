/**
 * Crédito de nómina (credinómina) — cuota y capacidad de pago.
 * Banco de Venezuela (BDV) y otros bancos ofrecen préstamos que se descuentan
 * directamente de la nómina del trabajador.
 *
 * Cuota mensual — sistema francés (cuota fija):
 *   C = P · [ i (1+i)^n ] / [ (1+i)^n − 1 ]
 *   con i = tasa mensual = tasaAnual / 12 (nominal), n = plazo en meses.
 *
 * La TASA la ingresa el usuario (las tasas cambian con frecuencia; no se fija).
 *
 * Capacidad de pago: la LOTTT (Art. 154) limita la amortización de deudas por
 * nómina a 1/3 (≈33,33%) del salario mensual. Se usa como tope prudencial.
 *
 * Fuente: Banco de Venezuela (credinómina); LOTTT Art. 154 (Justia VE).
 */
import { DEDUCCION_MAXIMA_NOMINA_LOTTT, fmtVES } from '../data/venezuela-2026';

export interface Inputs {
  salarioMensual?: number;   // salario/ingreso mensual neto en Bs.
  montoSolicitado?: number;  // monto del crédito en Bs.
  plazoMeses?: number;       // plazo en meses
  tasaAnual?: number;        // tasa de interés anual (%) — la ingresa el usuario
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, Number(i.salarioMensual) || 0);
  if (!salario) throw new Error('Ingresá tu salario o ingreso mensual (Bs.)');

  const monto = Math.max(0, Number(i.montoSolicitado) || 0);
  if (!monto) throw new Error('Ingresá el monto del crédito (Bs.)');

  const plazo = Math.max(1, Math.floor(Number(i.plazoMeses) || 0));
  if (!plazo) throw new Error('Ingresá el plazo en meses');

  const tasaAnual = Math.max(0, Number(i.tasaAnual) || 0);
  if (!tasaAnual) throw new Error('Ingresá la tasa de interés anual (%). Cambia seguido: consultá la vigente en tu banco');

  const iMensual = tasaAnual / 12 / 100;

  // Cuota — sistema francés (o cuota lineal si la tasa es 0).
  let cuota: number;
  if (iMensual === 0) {
    cuota = monto / plazo;
  } else {
    const factor = Math.pow(1 + iMensual, plazo);
    cuota = monto * (iMensual * factor) / (factor - 1);
  }

  const totalPagado = cuota * plazo;
  const interesesTotales = totalPagado - monto;

  // Capacidad de pago: tope legal de 1/3 del salario (LOTTT Art. 154).
  const cuotaMaxima = salario * DEDUCCION_MAXIMA_NOMINA_LOTTT;
  const pctSalario = (cuota / salario) * 100;
  const esViable = cuota <= cuotaMaxima;

  // Monto máximo prestable con la cuota tope.
  let montoMaximo: number;
  if (iMensual === 0) {
    montoMaximo = cuotaMaxima * plazo;
  } else {
    const factor = Math.pow(1 + iMensual, plazo);
    montoMaximo = cuotaMaxima * (factor - 1) / (iMensual * factor);
  }

  const pct = Math.round(pctSalario * 100) / 100;

  const _insight = {
    title: esViable ? 'La cuota entra en tu nómina' : 'La cuota supera el tope de nómina',
    text: esViable
      ? `Tu cuota mensual sería **${fmtVES(cuota)}**, el **${pct}%** de tu salario, dentro del tope legal de 1/3 (33,33%). ` +
        `En ${plazo} meses pagarías **${fmtVES(totalPagado)}** (**${fmtVES(interesesTotales)}** de intereses). ` +
        `Con estas condiciones podrías pedir hasta **${fmtVES(montoMaximo)}**.`
      : `Tu cuota de **${fmtVES(cuota)}** equivale al **${pct}%** de tu salario y supera el tope legal de 1/3 (${fmtVES(cuotaMaxima)}). ` +
        `El máximo que te descontarían por nómina con este plazo y tasa es **${fmtVES(montoMaximo)}**; bajá el monto o estirá el plazo.`,
    tone: esViable ? 'good' : 'warn',
    icon: '🏦',
  };

  const _chart = {
    type: 'scale' as const,
    marker: pct,
    markerLabel: `${pct}% del salario`,
    min: 0,
    segments: [
      { nombre: 'Holgado', max: 20, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Al límite', max: 33.33, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Supera el tope', max: Math.max(60, Math.ceil(pct) + 5), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `La cuota representa ${pct}% del salario; el tope legal por nómina es 33,33%.`,
  };

  return {
    cuotaMensual: Number(cuota.toFixed(2)),
    cuotaMaxima: Number(cuotaMaxima.toFixed(2)),
    pctSalario: pct,
    interesesTotales: Number(interesesTotales.toFixed(2)),
    totalPagado: Number(totalPagado.toFixed(2)),
    montoMaximo: Number(montoMaximo.toFixed(2)),
    esViable: esViable ? 'Sí' : 'No',
    detalle: `Cuota ${fmtVES(cuota)}/mes (${pct}% del salario) · total ${fmtVES(totalPagado)} · intereses ${fmtVES(interesesTotales)}`,
    _insight,
    _chart,
  };
}
