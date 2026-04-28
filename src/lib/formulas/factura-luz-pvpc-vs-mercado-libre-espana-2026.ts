export interface Inputs {
  consumo_kwh_mes: number;
  potencia_contratada_kw: number;
  perfil_consumo: 'diurno' | 'nocturno' | 'uniforme';
  tarifa_mercado_libre_eur_kwh: number;
  tiene_bono_social: 'no' | 'vulnerabilidad_severa' | 'vulnerabilidad_media';
  coste_fijo_mensual_eur: number;
}

export interface Outputs {
  coste_total_pvpc_mes: number;
  coste_total_mercado_libre_mes: number;
  diferencia_mensual: number;
  ahorro_anual: number;
  recomendacion: string;
  precio_promedio_kwh_pvpc: number;
  precio_promedio_kwh_mercado_libre: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 España — Fuente: CNMC, REE, AEAT
  // Precio promedio PVPC 2026 (€/kWh) — datos REE + CNMC
  const PRECIO_PVPC_BASE_EUR_KWH = 0.20;
  
  // Ajuste por perfil de consumo
  const AJUSTE_PERFIL: Record<string, number> = {
    'diurno': 1.05,      // +5% (picos caros mañana-tarde)
    'nocturno': 0.90,    // -10% (descuento valle noche)
    'uniforme': 1.00     // sin ajuste
  };
  
  // IVA + impuesto especial electricidad (5,127%) + gestión
  const FACTOR_IMPUESTOS = 1.2663; // (1 + 0.21 IVA) × (1 + 0.05127 especial) aprox.
  
  // Descuentos bono social (aplican solo a PVPC, sobre consumo energético)
  const DESCUENTO_BONO_SOCIAL: Record<string, number> = {
    'no': 0,
    'vulnerabilidad_media': 0.25,
    'vulnerabilidad_severa': 0.50
  };
  
  // Precio promedio PVPC con ajuste de perfil
  const precio_pvpc_ajustado = PRECIO_PVPC_BASE_EUR_KWH * AJUSTE_PERFIL[i.perfil_consumo];
  
  // ========== CÁLCULO PVPC ==========
  // Término de potencia base (sin impuestos inicialmente)
  const potencia_base = i.potencia_contratada_kw * 0.50; // 0,50 €/kW/mes estándar
  
  // Término de potencia con impuestos
  const potencia_con_impuestos = potencia_base * FACTOR_IMPUESTOS;
  
  // Consumo energía PVPC (sin descuento bono social aún)
  const consumo_bruto = i.consumo_kwh_mes * precio_pvpc_ajustado;
  
  // Aplicar descuento bono social (25% o 50% sobre consumo de energía)
  const descuento_factor = 1 - DESCUENTO_BONO_SOCIAL[i.tiene_bono_social];
  const consumo_con_bono = consumo_bruto * descuento_factor;
  
  // Consumo con impuestos
  const consumo_con_impuestos = consumo_con_bono * FACTOR_IMPUESTOS;
  
  // Total PVPC
  const coste_total_pvpc = potencia_con_impuestos + consumo_con_impuestos;
  
  // ========== CÁLCULO MERCADO LIBRE ==========
  // Término de potencia (igual al PVPC)
  const mercado_libre_potencia = potencia_con_impuestos;
  
  // Consumo energía mercado libre (sin bono social, es tarifa negociada)
  const mercado_libre_consumo_bruto = i.consumo_kwh_mes * i.tarifa_mercado_libre_eur_kwh;
  
  // Consumo con impuestos
  const mercado_libre_consumo_con_impuestos = mercado_libre_consumo_bruto * FACTOR_IMPUESTOS;
  
  // Total mercado libre
  const coste_total_mercado_libre = mercado_libre_potencia + mercado_libre_consumo_con_impuestos;
  
  // ========== COMPARACIÓN ==========
  const diferencia = coste_total_pvpc - coste_total_mercado_libre;
  const ahorro_anual = diferencia * 12;
  
  // Precios promedio por kWh (solo energía, sin potencia, para referencia)
  const precio_promedio_pvpc = consumo_con_impuestos / i.consumo_kwh_mes;
  const precio_promedio_mercado_libre = i.tarifa_mercado_libre_eur_kwh; // tarifa introducida directamente
  
  // ========== RECOMENDACIÓN ==========
  let recomendacion = '';
  
  if (Math.abs(diferencia) < 2) {
    // Diferencia muy pequeña
    recomendacion = '💡 Ambas opciones son prácticamente equivalentes (diferencia < 2€/mes). Elige PVPC si prefieres regulación estatal; mercado libre si quieres mejor servicio comercial.';
  } else if (diferencia > 0) {
    // PVPC más caro
    const porcentaje_ahorro = ((diferencia / coste_total_pvpc) * 100).toFixed(1);
    recomendacion = `✅ MERCADO LIBRE es más barato: ahorrarías ${diferencia.toFixed(2)}€/mes (~${porcentaje_ahorro}%). Solicita presupuesto a comercializadoras (Iberdrola, Endesa, Naturgy, Podo, Holaluz).`;
  } else {
    // Mercado libre más caro
    const porcentaje_ahorro = ((Math.abs(diferencia) / coste_total_mercado_libre) * 100).toFixed(1);
    recomendacion = `✅ PVPC es más barato: ahorrarías ${Math.abs(diferencia).toFixed(2)}€/mes (~${porcentaje_ahorro}%). Además, está regulado por la Administración.`;
    
    if (i.tiene_bono_social !== 'no') {
      recomendacion += ` Con tu bono social aplicado, PVPC es aún más ventajoso.`;
    }
  }
  
  // Nota adicional si consumo es bajo
  if (i.consumo_kwh_mes < 150) {
    recomendacion += ' (Tu consumo es bajo: PVPC típicamente favorecido.)\n';
  }
  // Nota si consumo alto
  else if (i.consumo_kwh_mes > 500) {
    recomendacion += ' (Tu consumo es alto: negocia bien mercado libre o revisa PVPC horario.)\n';
  }
  
  return {
    coste_total_pvpc_mes: Math.round(coste_total_pvpc * 100) / 100,
    coste_total_mercado_libre_mes: Math.round(coste_total_mercado_libre * 100) / 100,
    diferencia_mensual: Math.round(diferencia * 100) / 100,
    ahorro_anual: Math.round(ahorro_anual * 100) / 100,
    recomendacion: recomendacion.trim(),
    precio_promedio_kwh_pvpc: Math.round(precio_promedio_pvpc * 10000) / 10000,
    precio_promedio_kwh_mercado_libre: Math.round(precio_promedio_mercado_libre * 10000) / 10000
  };
}
