// UF/UTM/UTA live desde mindicador.cl (cron diario fetch-chile.mjs), con fallback verificado.
import clLive from "../../data/live/chile.json";
// Exención y tasa máxima 2026 — fuente única (Art. 52 / Art. 43 N°1 LIR).
import { CHILE_2026 } from "../data/chile-2026";

export interface Inputs {
  renta_sueldos_anuales: number;
  renta_honorarios: number;
  renta_capital_mobiliario: number;
  renta_arriendos: number;
  descuento_afp: number;
  descuento_salud: number;
  impuestos_pagados: number;
  gastos_deducibles: number;
  credito_unico_familiar: number;
  uta_valor: number;
}

export interface Outputs {
  renta_imponible_total: number;
  renta_en_uta: number;
  tramo_impositivo: string;
  tasa_marginal: number;
  impuesto_global_complementario: number;
  impuesto_menos_creditos: number;
  resultado_declaracion: number;
  tipo_resultado: string;
  anticipo_obligatorio: number;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // ── Valor UTA (Unidad Tributaria Anual) en vivo, con fallback al último verificado (jun-2026) ──
  // UTA = 12 × UTM. La escala del Impuesto Global Complementario (Art. 52 LIR) es la misma
  // del Impuesto Único mensual de 2ª categoría (Art. 43 N°1), pero anualizada en UTA.
  const UTA = i.uta_valor > 0 ? i.uta_valor : ((clLive as any)?.uta?.valor ?? 858072);

  // 1. Renta bruta total (todas las fuentes)
  const renta_bruta =
    Math.max(0, i.renta_sueldos_anuales || 0) +
    Math.max(0, i.renta_honorarios || 0) +
    Math.max(0, i.renta_capital_mobiliario || 0) +
    Math.max(0, i.renta_arriendos || 0);

  // 2. Renta imponible (después de cotizaciones obligatorias y gastos deducibles)
  const renta_imp_final = Math.max(
    0,
    renta_bruta -
      Math.max(0, i.descuento_afp || 0) -
      Math.max(0, i.descuento_salud || 0) -
      Math.max(0, i.gastos_deducibles || 0)
  );

  // 3. Renta imponible expresada en UTA
  const renta_en_uta = renta_imp_final / UTA;

  // 4. Escala IGC anual — Art. 52 LIR (tramos en UTA, factor marginal + rebaja en UTA).
  //    Misma estructura que el Impuesto Único mensual (Art. 43 N°1) pero anualizada.
  //    La rebaja en UTA da continuidad entre tramos: impuesto = base·factor − rebaja·UTA.
  //    Tramos: 13,5 / 30 / 50 / 70 / 90 / 120 / 310 UTA. Tasa máxima 40%.
  const EXENTO_UTA = CHILE_2026.segundaCategoriaExentoUtm; // 13,5 UTA exentas
  const TRAMOS: { hastaUta: number; factor: number; rebajaUta: number; nombre: string }[] = [
    { hastaUta: EXENTO_UTA, factor: 0,     rebajaUta: 0,     nombre: '0–13,5 UTA (exento)' },
    { hastaUta: 30,         factor: 0.04,  rebajaUta: 0.54,  nombre: '13,5–30 UTA (4%)' },
    { hastaUta: 50,         factor: 0.08,  rebajaUta: 1.74,  nombre: '30–50 UTA (8%)' },
    { hastaUta: 70,         factor: 0.135, rebajaUta: 4.49,  nombre: '50–70 UTA (13,5%)' },
    { hastaUta: 90,         factor: 0.23,  rebajaUta: 11.14, nombre: '70–90 UTA (23%)' },
    { hastaUta: 120,        factor: 0.304, rebajaUta: 17.80, nombre: '90–120 UTA (30,4%)' },
    { hastaUta: 310,        factor: 0.35,  rebajaUta: 23.32, nombre: '120–310 UTA (35%)' },
    { hastaUta: Infinity,   factor: CHILE_2026.segundaCategoriaTasaMaxima, rebajaUta: 38.82, nombre: '>310 UTA (40%)' },
  ];

  let tasa_marginal = 0;
  let rebajaUta = 0;
  let tramo_impositivo = TRAMOS[0].nombre;
  for (const tramo of TRAMOS) {
    if (renta_en_uta <= tramo.hastaUta) {
      tasa_marginal = tramo.factor;
      rebajaUta = tramo.rebajaUta;
      tramo_impositivo = tramo.nombre;
      break;
    }
  }

  // 5. Impuesto Global Complementario (progresivo por la rebaja)
  const impuesto_igc = Math.round(Math.max(0, renta_imp_final * tasa_marginal - rebajaUta * UTA));

  // 6. Impuesto menos créditos y retenciones ya pagadas durante el año
  const impuesto_menos_creditos =
    impuesto_igc - Math.max(0, i.impuestos_pagados || 0) - Math.max(0, i.credito_unico_familiar || 0);

  // 7. Resultado de la declaración (cargo o devolución)
  const resultado_declaracion = Math.round(impuesto_menos_creditos);
  let tipo_resultado = 'Cargo';
  if (resultado_declaracion < 0) tipo_resultado = 'Devolución';
  else if (resultado_declaracion === 0) tipo_resultado = 'Sin movimiento';

  // 8. Anticipo obligatorio (PPM): si el cargo supera ~$1.500.000
  const limite_anticipo = 1500000;
  const anticipo_obligatorio =
    resultado_declaracion > limite_anticipo ? Math.round(resultado_declaracion * 0.5) : 0;

  const fmtCL = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const resultadoAbs = Math.abs(resultado_declaracion);
  const tasaMargPct = Math.round(tasa_marginal * 10000) / 100;

  let insightTone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  if (resultado_declaracion < 0) {
    insightTone = 'good';
    insightText = `Tu Operación Renta da **devolución de ${fmtCL(resultadoAbs)}**: las retenciones y créditos superaron tu Impuesto Global Complementario (**${fmtCL(impuesto_igc)}**). El SII te reintegra esa diferencia.`;
  } else if (resultado_declaracion === 0) {
    insightTone = 'neutral';
    insightText = `Tu declaración queda **sin movimiento**: el IGC de **${fmtCL(impuesto_igc)}** se cubre exactamente con tus retenciones y créditos. No pagás ni te devuelven.`;
  } else if (anticipo_obligatorio > 0) {
    insightTone = 'warn';
    insightText = `Te queda un **cargo de ${fmtCL(resultadoAbs)}** (tramo ${tramo_impositivo}, marginal ${tasaMargPct}%). Por superar el umbral, además te aplican un **anticipo obligatorio de ${fmtCL(anticipo_obligatorio)}** a cuenta del próximo período.`;
  } else {
    insightTone = 'warn';
    insightText = `Te queda un **cargo a pagar de ${fmtCL(resultadoAbs)}**: tu IGC (**${fmtCL(impuesto_igc)}**) superó lo retenido durante el año. Estás en el tramo ${tramo_impositivo} (marginal ${tasaMargPct}%).`;
  }

  const _insight = {
    title: 'Resultado de tu Operación Renta',
    text: insightText,
    tone: insightTone,
    icon: '🇨🇱',
  };

  return {
    renta_imponible_total: Math.round(renta_imp_final),
    renta_en_uta: Math.round(renta_en_uta * 100) / 100,
    tramo_impositivo,
    tasa_marginal: Math.round(tasa_marginal * 10000) / 100, // porcentaje
    impuesto_global_complementario: impuesto_igc,
    impuesto_menos_creditos: Math.round(impuesto_menos_creditos),
    resultado_declaracion,
    tipo_resultado,
    anticipo_obligatorio,
    _insight,
  };
}
