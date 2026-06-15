/**
 * Fondo de cesantía del IESS (Ecuador) — Seguro de Cesantía.
 * Aporte mensual del 3% a la cuenta individual de cesantía:
 *   - 2% lo aporta el trabajador
 *   - 1% lo aporta el empleador
 * El fondo se acumula en la cuenta individual y rinde interés según la tasa pasiva
 * referencial del Banco Central del Ecuador (BCE).
 * Requisitos de retiro (IESS): mínimo 24 aportaciones (no simultáneas) y estar
 * cesante al menos 60 días desde el cese laboral.
 * Ecuador está dolarizado → todos los montos en dólares (USD, "$").
 *
 * Fuentes:
 *  - IESS — Seguro de Cesantía, https://www.iess.gob.ec/ (aporte 3% = 2% trabajador + 1% empleador; 24 aportaciones; 60 días cesante).
 *  - Banco Central del Ecuador — Tasa pasiva referencial, https://contenido.bce.fin.ec/documentos/informacioneconomica/indicadores/monetario/indTasaPasiva.html (~5,34% anual, mayo 2026).
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// fuente: IESS — Seguro de Cesantía, https://www.iess.gob.ec/, 2026
const APORTE_TRABAJADOR = 0.02;   // 2% del trabajador
const APORTE_EMPLEADOR = 0.01;    // 1% del empleador
const APORTE_TOTAL = APORTE_TRABAJADOR + APORTE_EMPLEADOR; // 3% total a la cuenta individual
const MIN_APORTACIONES = 24;      // mínimo de aportaciones no simultáneas para retirar
const DIAS_CESANTE = 60;          // días de cesantía exigidos desde el cese
// fuente: Banco Central del Ecuador — tasa pasiva referencial, mayo 2026
const TASA_PASIVA_BCE = 0.0534;   // 5,34% anual referencial (estimación de rendimiento)

export interface Inputs {
  remuneracion: number;     // remuneración mensual promedio aportada (USD)
  mesesAportados: number;   // número de aportaciones mensuales acumuladas
  estaCesante?: string;     // 'si' = ya cesó | 'no' = sigue trabajando
  diasCesante?: number;     // días transcurridos desde el cese (si estaCesante = 'si')
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const remuneracion = Number(i.remuneracion) || 0;
  const meses = Math.floor(Number(i.mesesAportados) || 0);
  const cesante = String(i.estaCesante ?? 'no') === 'si';
  const dias = i.diasCesante === undefined || i.diasCesante === null || (i.diasCesante as any) === ''
    ? 0
    : Math.max(0, Number(i.diasCesante) || 0);

  if (remuneracion <= 0) throw new Error('Ingresá tu remuneración mensual');
  if (meses <= 0) throw new Error('Ingresá los meses (aportaciones) acumulados');

  // Aporte mensual a la cuenta individual de cesantía (3% sobre la remuneración).
  const aporteMensualTrabajador = remuneracion * APORTE_TRABAJADOR;
  const aporteMensualEmpleador = remuneracion * APORTE_EMPLEADOR;
  const aporteMensualTotal = remuneracion * APORTE_TOTAL;

  // Fondo acumulado por capital (sin interés): 3% × remuneración × meses aportados.
  const fondoCapital = aporteMensualTotal * meses;

  // Estimación simple del interés ganado: aplica la tasa pasiva del BCE sobre el saldo
  // promedio del período de acumulación. Saldo promedio ≈ fondoCapital / 2; años ≈ meses / 12.
  const anios = meses / 12;
  const saldoPromedio = fondoCapital / 2;
  const interesEstimado = saldoPromedio * TASA_PASIVA_BCE * anios;
  const fondoEstimado = fondoCapital + interesEstimado;

  // Elegibilidad para retirar el fondo de cesantía.
  const cumpleAportaciones = meses >= MIN_APORTACIONES;
  const cumpleDias = cesante && dias >= DIAS_CESANTE;
  const elegible = cumpleAportaciones && cumpleDias;

  let estadoElegibilidad: string;
  let tone: 'good' | 'neutral' | 'bad';
  if (elegible) {
    estadoElegibilidad = 'Sí, cumplís los requisitos para retirar tu fondo de cesantía.';
    tone = 'good';
  } else if (!cesante) {
    estadoElegibilidad = `Todavía no: para retirar tenés que estar cesante al menos ${DIAS_CESANTE} días desde el cese laboral.`;
    tone = 'neutral';
  } else if (!cumpleAportaciones) {
    const faltan = MIN_APORTACIONES - meses;
    estadoElegibilidad = `Aún no: te falta${faltan === 1 ? '' : 'n'} ${faltan} aportaci${faltan === 1 ? 'ón' : 'ones'} para llegar a las ${MIN_APORTACIONES} mínimas.`;
    tone = 'bad';
  } else if (!cumpleDias) {
    const faltanDias = DIAS_CESANTE - dias;
    estadoElegibilidad = `Casi: cumplís las ${MIN_APORTACIONES} aportaciones pero te faltan ${faltanDias} día${faltanDias === 1 ? '' : 's'} para completar los ${DIAS_CESANTE} de cesantía.`;
    tone = 'neutral';
  } else {
    estadoElegibilidad = 'Revisá los requisitos de aportaciones y días de cesantía.';
    tone = 'neutral';
  }

  const _insight = {
    title: elegible ? 'Podés retirar tu fondo de cesantía' : 'Estado de tu fondo de cesantía',
    text: `Con una remuneración de **${fmtUSDec(remuneracion)}** y **${meses}** aportaciones, tu fondo de cesantía acumulado se estima en **${fmtUSDec(fondoEstimado)}** (capital ${fmtUSDec(fondoCapital)} + interés estimado ${fmtUSDec(interesEstimado)}). ${elegible ? `Cumplís las ${MIN_APORTACIONES} aportaciones y los ${DIAS_CESANTE} días de cesantía, así que podés solicitar el retiro en iess.gob.ec.` : estadoElegibilidad}`,
    tone,
    icon: '🏦',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aporte trabajador (2%)', value: Math.round(aporteMensualTrabajador * meses * 100) / 100 },
      { label: 'Aporte empleador (1%)', value: Math.round(aporteMensualEmpleador * meses * 100) / 100 },
      { label: 'Interés estimado (BCE)', value: Math.round(interesEstimado * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtUSDec(fondoEstimado),
    centerLabel: 'Fondo acumulado',
    ariaLabel: `Fondo de cesantía acumulado estimado de ${fmtUSDec(fondoEstimado)}.`,
  };

  return {
    fondoEstimado: fmtUSDec(fondoEstimado),
    fondoCapital: fmtUSDec(fondoCapital),
    interesEstimado: fmtUSDec(interesEstimado),
    aporteMensualTotal: fmtUSDec(aporteMensualTotal),
    elegibilidad: estadoElegibilidad,
    detalle: `3% × ${fmtUSDec(remuneracion)} × ${meses} aportaciones = ${fmtUSDec(fondoCapital)} de capital + ${fmtUSDec(interesEstimado)} de interés estimado (tasa pasiva BCE ~5,34%). Aportaciones: ${meses}/${MIN_APORTACIONES} · Días cesante: ${cesante ? dias : 0}/${DIAS_CESANTE}.`,
    _insight,
    _chart,
  };
}
