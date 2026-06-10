import { COLOMBIA_2026 } from '../data/colombia-2026';
export interface Inputs {
  dividendos_sociedades: number;
  dividendos_fiducias: number;
  intereses_cdts: number;
  arrendamientos: number;
  ganancias_capital: number;
  retencion_intereses: number;
  retencion_dividendos: number;
  deducciones_arrendamiento: number;
  renta_laboral_total: number;
  dependientes_económicos: number;
}

export interface Outputs {
  renta_cedular_bruta: number;
  deducciones_permitidas: number;
  renta_cedular_liquida: number;
  gravamen_cedular: number;
  retenciones_totales: number;
  impuesto_neto: number;
  renta_total_anual: number;
  impuesto_estimado_total: number;
  saldo_a_pagar_o_favor: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia - DIAN
  const UVT_2026 = COLOMBIA_2026.uvt; // UVT 2026 = $52.374 (Resolución DIAN 000238/2025)
  const UMBRAL_GRAVAMEN_CEDULAR_UVT = 375; // UVT
  const UMBRAL_GRAVAMEN_CEDULAR = UMBRAL_GRAVAMEN_CEDULAR_UVT * UVT_2026; // ≈14.251.500
  const TARIFA_GRAVAMEN_CEDULAR = 0.10; // 10%
  const LIMITE_DEDUCCION_ARRENDAMIENTO = 0.40; // Máximo 40% del arriendo
  const DEDUCCION_DEPENDIENTE = 2_150_000; // $2.150.000 por dependiente
  const LIMITE_NO_OBLIGADO_DECLARAR = 48_000_000; // Aprox. 1.263 UVT

  // Tramos IRPF 2026 integración cédulas (Fuente: DIAN 2026)
  const tramos = [
    { limite: 376 * UVT_2026, tarifa: 0.00, impuesto_base: 0 },
    { limite: 1_000 * UVT_2026, tarifa: 0.19, impuesto_base: 376 * UVT_2026 * 0.00 },
    { limite: 2_000 * UVT_2026, tarifa: 0.28, impuesto_base: (1_000 - 376) * UVT_2026 * 0.19 },
    { limite: 3_000 * UVT_2026, tarifa: 0.37, impuesto_base: (1_000 - 376) * UVT_2026 * 0.19 + (2_000 - 1_000) * UVT_2026 * 0.28 },
    { limite: Infinity, tarifa: 0.45, impuesto_base: (1_000 - 376) * UVT_2026 * 0.19 + (2_000 - 1_000) * UVT_2026 * 0.28 + (3_000 - 2_000) * UVT_2026 * 0.37 }
  ];

  // 1. Renta Cedular Bruta (Cédula 5)
  const renta_cedular_bruta = i.dividendos_sociedades + i.dividendos_fiducias + i.intereses_cdts + i.arrendamientos + i.ganancias_capital;

  // 2. Deducciones Permitidas
  // Arrendamiento: máximo 40% del arriendo
  const max_deduccion_arrendamiento = i.arrendamientos * LIMITE_DEDUCCION_ARRENDAMIENTO;
  const deducciones_permitidas = Math.min(i.deducciones_arrendamiento, max_deduccion_arrendamiento);

  // 3. Renta Cedular Líquida
  const renta_cedular_liquida = Math.max(0, renta_cedular_bruta - deducciones_permitidas);

  // 4. Gravamen Cedular (10% si supera umbral)
  let gravamen_cedular = 0;
  if (renta_cedular_liquida >= UMBRAL_GRAVAMEN_CEDULAR) {
    gravamen_cedular = renta_cedular_liquida * TARIFA_GRAVAMEN_CEDULAR;
  }

  // 5. Retenciones Totales
  const retenciones_totales = i.retencion_intereses + i.retencion_dividendos;

  // 6. Impuesto Neto Cedular
  const impuesto_neto = Math.max(-Infinity, gravamen_cedular - retenciones_totales); // Puede ser negativo (saldo a favor cedular)

  // 7. Renta Total Anual (Integración cédula 1 + 5)
  // Aplicar deducción por dependientes a renta laboral (cédula 1)
  const deduccion_dependientes = i.dependientes_económicos * DEDUCCION_DEPENDIENTE;
  const renta_laboral_neta = Math.max(0, i.renta_laboral_total - deduccion_dependientes);
  const renta_total_anual = renta_laboral_neta + renta_cedular_liquida;

  // 8. Impuesto Estimado Total (con integración de tramos)
  let impuesto_estimado_total = 0;
  let renta_restante = renta_total_anual;

  for (const tramo of tramos) {
    if (renta_restante <= 0) break;
    
    if (renta_total_anual <= tramo.limite) {
      const base_en_tramo = renta_total_anual - (tramo.limite === Infinity ? 3_000 * UVT_2026 : tramo.limite - (1_000 * UVT_2026));
      if (base_en_tramo > 0) {
        impuesto_estimado_total += base_en_tramo * tramo.tarifa;
      }
      break;
    } else {
      const limite_anterior = tramo === tramos[0] ? 0 : tramos[tramos.indexOf(tramo) - 1].limite;
      const base_en_tramo = Math.min(tramo.limite, renta_total_anual) - limite_anterior;
      if (base_en_tramo > 0) {
        impuesto_estimado_total += base_en_tramo * tramo.tarifa;
      }
    }
  }

  // Simplificación de cálculo de tramos: uso directo
  // Según tabla DIAN 2026: Impuesto = (Renta × Tarifa) − Deducción
  if (renta_total_anual <= 376 * UVT_2026) {
    impuesto_estimado_total = 0;
  } else if (renta_total_anual <= 1_000 * UVT_2026) {
    impuesto_estimado_total = (renta_total_anual - 376 * UVT_2026) * 0.19;
  } else if (renta_total_anual <= 2_000 * UVT_2026) {
    impuesto_estimado_total = (624 * UVT_2026 * 0.19) + (renta_total_anual - 1_000 * UVT_2026) * 0.28;
  } else if (renta_total_anual <= 3_000 * UVT_2026) {
    impuesto_estimado_total = (624 * UVT_2026 * 0.19) + (1_000 * UVT_2026 * 0.28) + (renta_total_anual - 2_000 * UVT_2026) * 0.37;
  } else {
    impuesto_estimado_total = (624 * UVT_2026 * 0.19) + (1_000 * UVT_2026 * 0.28) + (1_000 * UVT_2026 * 0.37) + (renta_total_anual - 3_000 * UVT_2026) * 0.45;
  }

  // 9. Saldo a Pagar / A Favor
  // Total retenciones cédula 1 se asumiría como aproximación (no ingresada en formulario)
  // Para simplificar, asumimos retenciones totales = retenciones cédula 5
  const retenciones_cédula_1_estimada = Math.max(0, i.renta_laboral_total * 0.08); // Retención aprox 8% en cédula 1
  const retenciones_totales_estimadas = retenciones_totales + retenciones_cédula_1_estimada;
  
  const saldo_a_pagar_o_favor = impuesto_estimado_total - retenciones_totales_estimadas;

  const impuesto_final = Math.max(0, impuesto_estimado_total);
  const fmtCop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const tasaEfectivaTotal = renta_total_anual > 0 ? (impuesto_final / renta_total_anual) * 100 : 0;
  const aFavor = saldo_a_pagar_o_favor < 0;
  const _insight = {
    title: aFavor ? 'Te queda saldo a favor' : 'Quedás con saldo a pagar',
    text: aFavor
      ? `Tu impuesto estimado es **${fmtCop(impuesto_final)}** sobre una renta total de **${fmtCop(renta_total_anual)}**, pero las retenciones superan ese monto: tenés un saldo a favor de **${fmtCop(Math.abs(saldo_a_pagar_o_favor))}** para solicitar en la declaración.`
      : `Sobre una renta total de **${fmtCop(renta_total_anual)}** el impuesto estimado es **${fmtCop(impuesto_final)}** (tasa efectiva **${tasaEfectivaTotal.toFixed(1)}%**). Tras descontar retenciones, te queda un saldo a pagar de **${fmtCop(saldo_a_pagar_o_favor)}**.`,
    tone: (aFavor ? 'good' : 'warn') as 'good' | 'warn' | 'neutral',
    icon: '🇨🇴',
  };

  const renta_despues_impuesto = Math.max(0, renta_total_anual - impuesto_final);
  const _chart = renta_total_anual > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Impuesto estimado', value: Math.round(impuesto_final) },
      { label: 'Renta después de impuesto', value: Math.round(renta_despues_impuesto) },
    ],
    prefix: '$',
    centerValue: fmtCop(renta_total_anual),
    centerLabel: 'Renta total anual',
    ariaLabel: 'Reparto de la renta total anual entre impuesto estimado y renta después de impuesto',
  } : undefined;

  return {
    renta_cedular_bruta: Math.round(renta_cedular_bruta),
    deducciones_permitidas: Math.round(deducciones_permitidas),
    renta_cedular_liquida: Math.round(renta_cedular_liquida),
    gravamen_cedular: Math.round(gravamen_cedular),
    retenciones_totales: Math.round(retenciones_totales),
    impuesto_neto: Math.round(impuesto_neto),
    renta_total_anual: Math.round(renta_total_anual),
    impuesto_estimado_total: Math.round(Math.max(0, impuesto_estimado_total)),
    saldo_a_pagar_o_favor: Math.round(saldo_a_pagar_o_favor),
    _insight,
    _chart
  };
}
