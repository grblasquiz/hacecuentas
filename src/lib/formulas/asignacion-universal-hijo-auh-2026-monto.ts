export interface Inputs {
  cantidad_hijos: number;
  hijos_discapacidad: number;
  integrantes_grupo: number;
  ingreso_familiar: number;
  bono_refuerzo: string;
}

export interface Outputs {
  accede: string;
  monto_mensual_neto: number;
  monto_retenido: number;
  monto_total_bruto: number;
  bono_mensual: number;
  acreditacion_anual: number;
  detalle: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Valores vigentes ago-2026 — ANSES, movilidad mensual IPC (DNU 274/2024): +1,89% (IPC junio)
  const AUH_GENERAL = A.auhGeneral;
  const AUH_DISCAPACIDAD = A.auhDiscapacidad;
  const PORCENTAJE_MENSUAL = 0.80;
  const PORCENTAJE_RETENIDO = 0.20;
  const MAX_HIJOS_GENERAL = 5;       // tope de hijos para AUH general

  // Sanitizar inputs
  const cantidadHijos = Math.max(0, Math.floor(Number(i.cantidad_hijos) || 0));
  const hijosDiscapacidad = Math.max(0, Math.floor(Number(i.hijos_discapacidad) || 0));
  const integrantesGrupo = Math.max(1, Math.floor(Number(i.integrantes_grupo) || 1));
  const ingresoFamiliar = Math.max(0, Number(i.ingreso_familiar) || 0);

  // Validaciones básicas
  if (cantidadHijos <= 0) {
    return {
      accede: "Ingresá al menos 1 hijo",
      monto_mensual_neto: 0,
      monto_retenido: 0,
      monto_total_bruto: 0,
      bono_mensual: 0,
      acreditacion_anual: 0,
      detalle: "Ingresá la cantidad de hijos para calcular.",
    };
  }

  if (hijosDiscapacidad > cantidadHijos) {
    return {
      accede: "Error: hijos con discapacidad no puede superar el total de hijos",
      monto_mensual_neto: 0,
      monto_retenido: 0,
      monto_total_bruto: 0,
      bono_mensual: 0,
      acreditacion_anual: 0,
      detalle: "Revisá la cantidad de hijos con discapacidad.",
    };
  }

  // AUH no usa la tabla de topes IGF de SUAF. El acceso depende principalmente
  // de la situación laboral/previsional y de residencia; el ingreso queda sólo
  // como dato informativo porque no alcanza para decidir elegibilidad.

  // Calcular hijos por tipo
  // Los hijos con discapacidad no tienen límite de cantidad; los generales tienen tope de 5
  const hijosGenerales = cantidadHijos - hijosDiscapacidad;
  const hijosGeneralesEfectivos = Math.min(hijosGenerales, MAX_HIJOS_GENERAL);

  // Monto bruto mensual total
  const montoBrutoGeneral = hijosGeneralesEfectivos * AUH_GENERAL;
  const montoBrutoDiscapacidad = hijosDiscapacidad * AUH_DISCAPACIDAD;
  const montoBrutoTotal = montoBrutoGeneral + montoBrutoDiscapacidad;

  // Tramos de pago
  const montoMensualNeto = montoBrutoTotal * PORCENTAJE_MENSUAL;
  const montoRetenido = montoBrutoTotal * PORCENTAJE_RETENIDO;

  // Acreditación anual (20% acumulado 12 meses)
  const acreditacionAnual = montoRetenido * 12;

  // El bono previsional de $70.000 no incluye AUH/AUE (Dto. 824/2026).
  const bonoMensual = 0;

  // Detalle textual
  const lines: string[] = [];
  lines.push(`Grupo declarado: ${integrantesGrupo} integrante/s; ingreso informado: $${ingresoFamiliar.toLocaleString("es-AR")}. La elegibilidad no se determina con un tope por integrante.`);
  if (hijosGeneralesEfectivos > 0) {
    lines.push(`Hijos generales (tope 5): ${hijosGeneralesEfectivos} × $${AUH_GENERAL.toLocaleString("es-AR")} = $${montoBrutoGeneral.toLocaleString("es-AR")}`);
  }
  if (hijosDiscapacidad > 0) {
    lines.push(`Hijos con discapacidad: ${hijosDiscapacidad} × $${AUH_DISCAPACIDAD.toLocaleString("es-AR")} = $${montoBrutoDiscapacidad.toLocaleString("es-AR")}`);
  }
  lines.push(`Monto bruto mensual: $${montoBrutoTotal.toLocaleString("es-AR")}`);
  lines.push(`80% cobro mensual: $${montoMensualNeto.toLocaleString("es-AR")}`);
  lines.push(`20% retenido: $${montoRetenido.toLocaleString("es-AR")} (se libera al presentar la Libreta)`);
  if (i.bono_refuerzo === 'si') lines.push('El bono previsional vigente no corresponde a AUH/AUE; no se suma al resultado.');
  lines.push(`Acumulado anual estimado del 20%: $${acreditacionAnual.toLocaleString("es-AR")}`);

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Cobro mensual (80%)', value: Math.round(montoMensualNeto) },
      { label: 'Retención (20%, contra Libreta)', value: Math.round(montoRetenido) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(montoBrutoTotal).toLocaleString('es-AR'),
    centerLabel: 'AUH bruta mensual',
    ariaLabel: 'Composición de la AUH mensual: 80% de cobro mensual y 20% retenido hasta marzo',
  };

  const insight = {
    title: 'Cobrás el 80% por mes',
    text: `De los **$${Math.round(montoBrutoTotal).toLocaleString("es-AR")}** brutos mensuales, ANSES te deposita **$${Math.round(montoMensualNeto).toLocaleString("es-AR")} cada mes** (80%) y retiene **$${Math.round(montoRetenido).toLocaleString("es-AR")}** (20%), que se libera al presentar la Libreta. El bono previsional vigente no incluye AUH/AUE.`,
    tone: 'good' as const,
    icon: '👶',
  };

  return {
    accede: "Accede a la AUH ✓",
    monto_mensual_neto: Math.round(montoMensualNeto),
    monto_retenido: Math.round(montoRetenido),
    monto_total_bruto: Math.round(montoBrutoTotal),
    bono_mensual: Math.round(bonoMensual),
    acreditacion_anual: Math.round(acreditacionAnual),
    detalle: lines.join(" | "),
    _chart: chart,
    _insight: insight,
  };
}
import { ASIGNACIONES_ANSES_AGO_2026 as A } from '../data/argentina-2026';
