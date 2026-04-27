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
}

export function compute(i: Inputs): Outputs {
  // Valores vigentes 2026 — Resolución ANSES actualización trimestral
  const AUH_GENERAL = 105640;        // ARS por hijo sin discapacidad
  const AUH_DISCAPACIDAD = 354280;   // ARS por hijo con CUD
  const TOPE_POR_INTEGRANTE = 952110; // ARS — tope ingreso por integrante grupo familiar
  const BONO_REFUERZO_VALOR = 70000; // ARS por hijo — cuando ANSES lo activa
  const PORCENTAJE_MENSUAL = 0.80;
  const PORCENTAJE_RETENIDO = 0.20;
  const MAX_HIJOS_GENERAL = 5;       // tope de hijos para AUH general

  // Sanitizar inputs
  const cantidadHijos = Math.max(0, Math.floor(Number(i.cantidad_hijos) || 0));
  const hijosDiscapacidad = Math.max(0, Math.floor(Number(i.hijos_discapacidad) || 0));
  const integrantesGrupo = Math.max(1, Math.floor(Number(i.integrantes_grupo) || 1));
  const ingresoFamiliar = Math.max(0, Number(i.ingreso_familiar) || 0);
  const bonoActivo = i.bono_refuerzo === "si";

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

  // Verificar tope de ingreso familiar
  const topeIngreso = integrantesGrupo * TOPE_POR_INTEGRANTE;
  if (ingresoFamiliar > topeIngreso) {
    return {
      accede: `No accede — ingreso $${ingresoFamiliar.toLocaleString("es-AR")} supera tope de $${topeIngreso.toLocaleString("es-AR")}`,
      monto_mensual_neto: 0,
      monto_retenido: 0,
      monto_total_bruto: 0,
      bono_mensual: 0,
      acreditacion_anual: 0,
      detalle: `El tope vigente es $${TOPE_POR_INTEGRANTE.toLocaleString("es-AR")} por integrante × ${integrantesGrupo} integrantes = $${topeIngreso.toLocaleString("es-AR")}.`,
    };
  }

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

  // Bono refuerzo (sin retención del 20%)
  const bonoMensual = bonoActivo ? cantidadHijos * BONO_REFUERZO_VALOR : 0;

  // Detalle textual
  const lines: string[] = [];
  lines.push(`Tope familiar: ${integrantesGrupo} integrantes × $${TOPE_POR_INTEGRANTE.toLocaleString("es-AR")} = $${topeIngreso.toLocaleString("es-AR")} → Ingreso declarado: $${ingresoFamiliar.toLocaleString("es-AR")} ✓`);
  if (hijosGeneralesEfectivos > 0) {
    lines.push(`Hijos generales (tope 5): ${hijosGeneralesEfectivos} × $${AUH_GENERAL.toLocaleString("es-AR")} = $${montoBrutoGeneral.toLocaleString("es-AR")}`);
  }
  if (hijosDiscapacidad > 0) {
    lines.push(`Hijos con discapacidad: ${hijosDiscapacidad} × $${AUH_DISCAPACIDAD.toLocaleString("es-AR")} = $${montoBrutoDiscapacidad.toLocaleString("es-AR")}`);
  }
  lines.push(`Monto bruto mensual: $${montoBrutoTotal.toLocaleString("es-AR")}`);
  lines.push(`80% cobro mensual: $${montoMensualNeto.toLocaleString("es-AR")}`);
  lines.push(`20% retenido: $${montoRetenido.toLocaleString("es-AR")} (se acredita en marzo)`);
  if (bonoActivo) {
    lines.push(`Bono refuerzo: ${cantidadHijos} hijo/s × $${BONO_REFUERZO_VALOR.toLocaleString("es-AR")} = $${bonoMensual.toLocaleString("es-AR")} (sin retención)`);
  }
  lines.push(`Acreditación anual estimada en marzo: $${acreditacionAnual.toLocaleString("es-AR")}`);

  return {
    accede: "Accede a la AUH ✓",
    monto_mensual_neto: Math.round(montoMensualNeto),
    monto_retenido: Math.round(montoRetenido),
    monto_total_bruto: Math.round(montoBrutoTotal),
    bono_mensual: Math.round(bonoMensual),
    acreditacion_anual: Math.round(acreditacionAnual),
    detalle: lines.join(" | "),
  };
}
