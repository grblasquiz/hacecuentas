/**
 * Tarjeta de crédito y pago mínimo — Ecuador (dolarizado, USD).
 * Simula cuánto tiempo e intereses lleva pagar una deuda de tarjeta según el monto
 * que se abona cada mes (amortización mes a mes con interés compuesto sobre saldo).
 *
 * Dato 2026: tasa efectiva máxima del segmento consumo (prioritario) del Banco
 * Central del Ecuador = 16,77% TEA. Es el techo legal para tarjetas de crédito.
 * Fuente: BCE, Tasas de Interés Activas Efectivas Vigentes,
 *   https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm
 *   (consumo: nominal 15,60% → TEA máxima 16,77%, vigente 2026).
 * En Ecuador la tasa es de libre contratación siempre que no supere esa máxima efectiva.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tasa efectiva máxima del segmento consumo (BCE 2026) — techo legal de las tarjetas.
// fuente: Banco Central del Ecuador, https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm, 2026
const TEA_MAX_CONSUMO_BCE = 16.77; // % anual

export interface Inputs {
  saldo: number;          // saldo / deuda actual de la tarjeta (USD)
  tasaAnual?: number;     // tasa efectiva anual en % (si falta, usa la máxima BCE 16,77%)
  pagoMensual: number;    // monto que se abona cada mes (USD)
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const saldo = Number(i.saldo) || 0;
  const pagoMensual = Number(i.pagoMensual) || 0;
  // Si no ingresan tasa, usamos la máxima efectiva del segmento consumo del BCE.
  const tasaRaw = i.tasaAnual === undefined || i.tasaAnual === null || (i.tasaAnual as any) === ''
    ? TEA_MAX_CONSUMO_BCE
    : Number(i.tasaAnual);
  const tasaAnual = Number.isFinite(tasaRaw) && tasaRaw > 0 ? tasaRaw : TEA_MAX_CONSUMO_BCE;

  if (saldo <= 0) throw new Error('Ingresá el saldo de tu tarjeta de crédito');
  if (pagoMensual <= 0) throw new Error('Ingresá cuánto pagás por mes');

  // La tasa que muestra el BCE es EFECTIVA ANUAL (TEA). La tasa mensual efectiva
  // equivalente es (1 + TEA)^(1/12) − 1, no TEA/12.
  const tasaMensual = Math.pow(1 + tasaAnual / 100, 1 / 12) - 1;
  const interesPrimerMes = saldo * tasaMensual;

  // Si el pago no cubre ni el interés del primer mes, la deuda nunca baja.
  if (pagoMensual <= interesPrimerMes) {
    const _insight = {
      title: 'Tu pago no cubre ni los intereses',
      text: `Con un saldo de **${fmtUSDec(saldo)}** al **${tasaAnual.toLocaleString('es-EC', { maximumFractionDigits: 2 })}%** anual, el interés del primer mes es **${fmtUSDec(interesPrimerMes)}**. Si pagás **${fmtUSDec(pagoMensual)}** por mes, no alcanzás a cubrir el interés y la deuda **crece todos los meses** en vez de bajar. Tenés que pagar más que ${fmtUSDec(interesPrimerMes)} para que el saldo empiece a reducirse.`,
      tone: 'bad',
      icon: '🚨',
    };
    return {
      meses: 'Nunca (la deuda crece)',
      anios: 'Nunca',
      interesesTotales: 'Crece sin fin',
      totalPagado: 'Crece sin fin',
      pagoMinimoCubreInteres: 'No',
      detalle: `El pago de ${fmtUSDec(pagoMensual)}/mes es menor al interés mensual (${fmtUSDec(interesPrimerMes)}): la deuda nunca se cancela y aumenta cada mes.`,
      _insight,
      _chart: {
        type: 'donut',
        segments: [
          { label: 'Saldo (capital)', value: Math.round(saldo * 100) / 100 },
          { label: 'Interés del 1er mes', value: Math.round(interesPrimerMes * 100) / 100 },
        ],
        ariaLabel: `El pago mensual de ${fmtUSDec(pagoMensual)} no cubre el interés mensual de ${fmtUSDec(interesPrimerMes)}.`,
      },
    };
  }

  // Amortización mes a mes hasta cancelar el saldo.
  let saldoRestante = saldo;
  let meses = 0;
  let interesesTotales = 0;
  const MAX_MESES = 1200; // tope 100 años de seguridad
  while (saldoRestante > 0.005 && meses < MAX_MESES) {
    const interesMes = saldoRestante * tasaMensual;
    interesesTotales += interesMes;
    const capitalPagado = pagoMensual - interesMes;
    saldoRestante = saldoRestante - capitalPagado;
    meses++;
    // Último mes: si el saldo quedó negativo, ajustamos el pago final.
    if (saldoRestante < 0) {
      // el exceso pagado de más no es interés; corregimos el total de intereses no cambia
      saldoRestante = 0;
    }
  }

  const totalPagado = saldo + interesesTotales;
  const anios = meses / 12;
  const sobrecostoPct = saldo > 0 ? (interesesTotales / saldo) * 100 : 0;

  // Comparativa: pago mínimo "trampa" (5% del saldo) vs pago fijo del usuario.
  // En Ecuador el pago mínimo típico ronda 5%–10% del saldo; usamos 5% como piso.
  const pagoMinimoTipico = Math.max(saldo * 0.05, 10); // 5% del saldo, mínimo $10
  let saldoMin = saldo;
  let mesesMin = 0;
  let interesesMin = 0;
  // El pago mínimo suele ser un % del SALDO (decreciente): recalculamos cada mes.
  while (saldoMin > 0.005 && mesesMin < MAX_MESES) {
    const interesMes = saldoMin * tasaMensual;
    const cuota = Math.max(saldoMin * 0.05, 10);
    const pago = Math.min(cuota, saldoMin + interesMes);
    if (pago <= interesMes) { mesesMin = MAX_MESES; break; }
    interesesMin += interesMes;
    saldoMin = saldoMin - (pago - interesMes);
    mesesMin++;
  }
  const aniosMin = mesesMin >= MAX_MESES ? Infinity : mesesMin / 12;

  const tone = sobrecostoPct >= 40 ? 'bad' : sobrecostoPct >= 15 ? 'warn' : 'good';
  const _insight = {
    title: meses >= MAX_MESES ? 'Vas a tardar décadas' : 'Cuánto te cuesta tu tarjeta',
    text: `Con un saldo de **${fmtUSDec(saldo)}** al **${tasaAnual.toLocaleString('es-EC', { maximumFractionDigits: 2 })}%** anual, pagando **${fmtUSDec(pagoMensual)}** por mes liquidás la deuda en **${meses} meses** (${anios.toLocaleString('es-EC', { maximumFractionDigits: 1 })} años) y pagás **${fmtUSDec(interesesTotales)}** de intereses: un **${sobrecostoPct.toLocaleString('es-EC', { maximumFractionDigits: 0 })}%** extra sobre lo que debías. ${pagoMensual < pagoMinimoTipico ? `Ojo: estás cerca del pago mínimo (~${fmtUSDec(pagoMinimoTipico)}), la trampa más cara.` : 'Subir la cuota mensual acorta mucho el plazo y baja los intereses.'}`,
    tone,
    icon: '💳',
  };
  const _chart = {
    type: 'donut',
    segments: [
      { label: 'Capital (lo que debías)', value: Math.round(saldo * 100) / 100 },
      { label: 'Intereses pagados', value: Math.round(interesesTotales * 100) / 100 },
    ],
    ariaLabel: `De ${fmtUSDec(totalPagado)} totales, ${fmtUSDec(saldo)} es capital y ${fmtUSDec(interesesTotales)} son intereses.`,
  };

  return {
    meses: `${meses} ${meses === 1 ? 'mes' : 'meses'}`,
    anios: anios.toLocaleString('es-EC', { maximumFractionDigits: 1 }) + (anios === 1 ? ' año' : ' años'),
    interesesTotales: fmtUSDec(interesesTotales),
    totalPagado: fmtUSDec(totalPagado),
    sobrecosto: sobrecostoPct.toLocaleString('es-EC', { maximumFractionDigits: 0 }) + '% sobre el saldo',
    tasaUsada: tasaAnual.toLocaleString('es-EC', { maximumFractionDigits: 2 }) + '% anual',
    pagoMinimoTrampa: mesesMin >= MAX_MESES
      ? `Pagando solo el mínimo (5% del saldo) no terminás de pagar en décadas.`
      : `Pagando solo el mínimo (~${fmtUSDec(pagoMinimoTipico)} al inicio, 5% del saldo) tardarías ${mesesMin} meses (${aniosMin.toLocaleString('es-EC', { maximumFractionDigits: 1 })} años) y pagarías ${fmtUSDec(interesesMin)} de intereses.`,
    detalle: `Saldo ${fmtUSDec(saldo)} al ${tasaAnual.toLocaleString('es-EC', { maximumFractionDigits: 2 })}% anual · pago ${fmtUSDec(pagoMensual)}/mes → ${meses} meses, ${fmtUSDec(interesesTotales)} de intereses, total ${fmtUSDec(totalPagado)}.`,
    _insight,
    _chart,
  };
}
