/**
 * Estimación de pensión por AFP — República Dominicana (Ley 87-01, sistema de
 * Cuentas de Capitalización Individual / CCI). Proyección orientativa: NO es una
 * cifra oficial ni contempla la ley de "devolución del 30%" (no aprobada).
 *
 * Se proyecta el saldo de la CCI a la edad de jubilación (60 años) y se estima
 * una pensión mensual repartiendo ese saldo entre los meses esperados de retiro:
 *   saldoFinal = saldoActual·(1+r)^n + aporteMensual·[((1+r)^n − 1)/r]·(1+r)
 *   aporteMensual = salario × 8,4%  (parte que va a la CCI; editable)
 *   r = rendimiento anual / 12 ;  n = meses hasta jubilarse
 *   pensiónMensual ≈ saldoFinal ÷ meses de retiro esperados
 * Del 9,97% de aporte a pensiones, sólo ~8,4% del salario cotizable se acumula
 * en la CCI (el resto financia seguro de discapacidad/sobrevivencia y comisiones).
 */
import { AFP_PENSION_DO, fmtDOP } from '../data/republica-dominicana-2026';

export interface Inputs {
  edadActual: number;
  salario: number;            // salario mensual cotizable (RD$)
  saldoActual?: number;       // saldo actual de la CCI (RD$), opcional
  edadJubilacion?: number;    // default 60
  aportePct?: number;         // % del salario que va a la CCI (default 8,4)
  rendimientoAnual?: number;  // % anual esperado (default 7)
  aniosRetiro?: number;       // años esperados de retiro (default 20)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const edad = num(i.edadActual, 0);
  const salario = num(i.salario, 0);
  if (!(edad > 0) || edad >= 75) throw new Error('Ingresá tu edad actual (años)');
  if (!(salario > 0)) throw new Error('Ingresá tu salario mensual cotizable en RD$');

  const edadJub = Math.max(edad + 1, Math.floor(num(i.edadJubilacion, AFP_PENSION_DO.edadJubilacionVejez)));
  const saldoActual = Math.max(0, num(i.saldoActual, 0));
  const aportePct = Math.max(0, num(i.aportePct, AFP_PENSION_DO.aportePctCci * 100));
  const rAnual = Math.max(0, num(i.rendimientoAnual, 7));
  const aniosRetiro = Math.max(1, num(i.aniosRetiro, 20));

  const meses = (edadJub - edad) * 12;
  const r = rAnual / 100 / 12;
  const aporteMensual = salario * (aportePct / 100);

  // Valor futuro del saldo actual + anualidad de aportes (pago a fin de mes).
  const factor = Math.pow(1 + r, meses);
  const fvSaldo = saldoActual * factor;
  const fvAportes = r === 0
    ? aporteMensual * meses
    : aporteMensual * ((factor - 1) / r);
  const saldoFinal = fvSaldo + fvAportes;

  const mesesRetiro = aniosRetiro * 12;
  const pensionMensual = saldoFinal / mesesRetiro;
  const totalAportado = saldoActual + aporteMensual * meses;
  const rendimientos = saldoFinal - totalAportado;
  const tasaReemplazo = salario > 0 ? (pensionMensual / salario) * 100 : 0;

  const detalle =
    `A los ${edadJub} años (${meses} meses aportando ${fmtDOP(aporteMensual)}/mes = ${aportePct}% de ${fmtDOP(salario)}, ` +
    `rendimiento ${rAnual}% anual) tu CCI llegaría a ~${fmtDOP(saldoFinal)}. ` +
    `Repartido en ${aniosRetiro} años de retiro, son ~${fmtDOP(pensionMensual)}/mes (${tasaReemplazo.toFixed(0)}% de tu salario actual).`;

  const _insight = {
    title: `Pensión estimada: ~${fmtDOP(pensionMensual)}/mes`,
    text:
      `Proyectando tu **CCI** hasta los **${edadJub} años** con un aporte de **${fmtDOP(aporteMensual)}/mes** y un rendimiento del **${rAnual}% anual**, ` +
      `acumularías cerca de **${fmtDOP(saldoFinal)}** (de los cuales ~**${fmtDOP(rendimientos)}** son rendimientos). ` +
      `Repartido en **${aniosRetiro} años** de retiro da una pensión de **~${fmtDOP(pensionMensual)}/mes**, alrededor del **${tasaReemplazo.toFixed(0)}%** de tu salario. ` +
      `Es una estimación: la pensión real depende del rendimiento de los fondos, tus años cotizados (mínimo 360 meses) y la modalidad que elijas.`,
    tone: tasaReemplazo < 40 ? 'warn' as const : 'neutral' as const,
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Aportado', value: Math.round(totalAportado) },
      { label: 'Rendimientos', value: Math.max(0, Math.round(rendimientos)) },
    ],
    prefix: 'RD$',
    centerValue: fmtDOP(saldoFinal),
    centerLabel: 'Saldo al jubilarte',
    ariaLabel: 'Composición del saldo final de la CCI: aportes y rendimientos',
  };

  return {
    pensionMensual: fmtDOP(pensionMensual),
    saldoFinal: fmtDOP(saldoFinal),
    tasaReemplazo: `${tasaReemplazo.toFixed(0)}%`,
    totalAportado: fmtDOP(totalAportado),
    detalle,
    _insight,
    _chart,
  };
}
