export interface Inputs {
  proveedor: string;
  modelo: string;
  tokens_input_m: number;
  tokens_output_m: number;
  latencia_aceptable: string;
  solicitudes_dia: number;
}

export interface Outputs {
  costo_realtime_usd: number;
  costo_batch_usd: number;
  ahorro_usd: number;
  ahorro_pct: number;
  recomendacion: string;
  volumen_minimo_ok: string;
  detalle_precios: string;
}

// Precios en USD por millón de tokens (MTok) — fuente: OpenAI & Anthropic pricing 2026
const PRECIOS: Record<string, { inputRT: number; outputRT: number; label: string }> = {
  gpt4o:          { inputRT: 2.50,  outputRT: 10.00, label: "GPT-4o" },
  gpt4o_mini:     { inputRT: 0.15,  outputRT: 0.60,  label: "GPT-4o mini" },
  o3_mini:        { inputRT: 1.10,  outputRT: 4.40,  label: "o3-mini" },
  claude35_sonnet:{ inputRT: 3.00,  outputRT: 15.00, label: "Claude 3.5 Sonnet" },
  claude3_haiku:  { inputRT: 0.25,  outputRT: 1.25,  label: "Claude 3 Haiku" },
  claude35_haiku: { inputRT: 0.80,  outputRT: 4.00,  label: "Claude 3.5 Haiku" },
};

const BATCH_DISCOUNT = 0.50; // 50% off sobre precio real-time
const MIN_SOLICITUDES_DIA = 100; // umbral práctico recomendado
const MIN_AHORRO_USD = 5; // ahorro mensual mínimo que justifica la complejidad

export function compute(i: Inputs): Outputs {
  const tokensInputM  = Math.max(0, Number(i.tokens_input_m)  || 0);
  const tokensOutputM = Math.max(0, Number(i.tokens_output_m) || 0);
  const solicitudesDia = Math.max(0, Number(i.solicitudes_dia) || 0);
  const latenciaOk = String(i.latencia_aceptable) === "si";

  if (tokensInputM === 0 && tokensOutputM === 0) {
    return {
      costo_realtime_usd: 0,
      costo_batch_usd: 0,
      ahorro_usd: 0,
      ahorro_pct: 0,
      recomendacion: "Ingresá al menos un volumen de tokens para calcular.",
      volumen_minimo_ok: "—",
      detalle_precios: "—",
    };
  }

  const precio = PRECIOS[i.modelo];
  if (!precio) {
    return {
      costo_realtime_usd: 0,
      costo_batch_usd: 0,
      ahorro_usd: 0,
      ahorro_pct: 0,
      recomendacion: "Modelo no reconocido. Seleccioná un modelo válido.",
      volumen_minimo_ok: "—",
      detalle_precios: "—",
    };
  }

  // Costo real-time
  const costoRealtimeUsd =
    tokensInputM  * precio.inputRT +
    tokensOutputM * precio.outputRT;

  // Costo batch (50% off)
  const costoBatchUsd = costoRealtimeUsd * (1 - BATCH_DISCOUNT);

  // Ahorro
  const ahorroUsd = costoRealtimeUsd - costoBatchUsd;
  const ahorroPct = costoRealtimeUsd > 0
    ? (ahorroUsd / costoRealtimeUsd) * 100
    : 0;

  // Precios batch derivados
  const inputBatch  = precio.inputRT  * (1 - BATCH_DISCOUNT);
  const outputBatch = precio.outputRT * (1 - BATCH_DISCOUNT);

  // Volumen mínimo
  const volumenSuficiente =
    solicitudesDia >= MIN_SOLICITUDES_DIA && ahorroUsd >= MIN_AHORRO_USD;
  const volumenMinOk = volumenSuficiente
    ? `✅ Sí — ${solicitudesDia} solicitudes/día y USD ${ahorroUsd.toFixed(2)} de ahorro/mes superan los umbrales mínimos.`
    : `⚠️ No recomendado — necesitás ≥ ${MIN_SOLICITUDES_DIA} solicitudes/día y ahorro ≥ USD ${MIN_AHORRO_USD}/mes para que justifique la complejidad operativa.`;

  // Recomendación final
  let recomendacion: string;
  if (!latenciaOk) {
    recomendacion = "❌ No uses Batch API — tu caso de uso requiere respuesta inmediata. La Batch API solo aplica cuando tolerás hasta 24 h de espera.";
  } else if (!volumenSuficiente) {
    recomendacion = `⚠️ El ahorro de USD ${ahorroUsd.toFixed(2)}/mes o el volumen de ${solicitudesDia} solicitudes/día es bajo. Batch API es técnicamente válida pero el overhead puede no justificarla. Evaluá si el saving compensa la complejidad.`;
  } else {
    recomendacion = `✅ Batch API recomendada — ahorrás USD ${ahorroUsd.toFixed(2)}/mes (${ahorroPct.toFixed(0)}% off) con ${precio.label}. Latencia ≤ 24 h aceptada y volumen suficiente.`;
  }

  const detalle = (
    `${precio.label} | ` +
    `Input: USD ${precio.inputRT.toFixed(3)} → USD ${inputBatch.toFixed(4)}/MTok | ` +
    `Output: USD ${precio.outputRT.toFixed(3)} → USD ${outputBatch.toFixed(4)}/MTok`
  );

  return {
    costo_realtime_usd: Math.round(costoRealtimeUsd * 100) / 100,
    costo_batch_usd:    Math.round(costoBatchUsd    * 100) / 100,
    ahorro_usd:         Math.round(ahorroUsd        * 100) / 100,
    ahorro_pct:         Math.round(ahorroPct * 100)  / 100,
    recomendacion,
    volumen_minimo_ok: volumenMinOk,
    detalle_precios: detalle,
  };
}
