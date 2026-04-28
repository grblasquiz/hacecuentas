export interface Inputs {
  monto_deposito: number;
  plazo_dias: number;
  banco_seleccionado: 'bancoestado' | 'chileno' | 'santander' | 'bci' | 'personalizado';
  tasa_anual_personalizada: number;
  tipo_deposito: 'nominal' | 'uf';
  tasa_uf_anual: number;
}

export interface OutputBanco {
  banco: string;
  tasa: number;
  rendimiento_bruto: number;
  impuesto: number;
  rendimiento_neto: number;
}

export interface Outputs {
  rendimiento_bruto: number;
  impuesto_retenido: number;
  rendimiento_neto: number;
  tasa_neta_anual: number;
  monto_final: number;
  comparativa_bancos: OutputBanco[];
  alternativa_uf: string;
}

function obtenerTasaPorBancoYPlazo(banco: string, plazo: number): number {
  // Tasas de referencia Banco Central Chile 2026 (valores referenciales)
  const tasas: Record<string, Record<number, number>> = {
    bancoestado: { 7: 0.032, 30: 0.038, 90: 0.045, 180: 0.051, 360: 0.058 },
    chileno: { 7: 0.035, 30: 0.041, 90: 0.048, 180: 0.054, 360: 0.062 },
    santander: { 7: 0.034, 30: 0.040, 90: 0.047, 180: 0.053, 360: 0.060 },
    bci: { 7: 0.033, 30: 0.039, 90: 0.046, 180: 0.052, 360: 0.059 }
  };
  
  return tasas[banco]?.[plazo] || 0.05; // Fallback 5% si plazo no está en tabla
}

export function compute(i: Inputs): Outputs {
  const IMPUESTO_RENTAS_FINANCIERAS = 0.125; // 12.5% SII 2026
  const DIAS_ANIO = 365;
  
  // Determinar tasa a usar
  let tasa_anual = i.tasa_anual_personalizada;
  if (i.banco_seleccionado !== 'personalizado') {
    tasa_anual = obtenerTasaPorBancoYPlazo(i.banco_seleccionado, i.plazo_dias);
  }
  
  // Cálculo para depósito nominal
  let rendimiento_bruto = 0;
  
  if (i.tipo_deposito === 'nominal') {
    rendimiento_bruto = i.monto_deposito * tasa_anual * (i.plazo_dias / DIAS_ANIO);
  } else {
    // Depósito UF: usamos tasa UF más pequeña
    rendimiento_bruto = i.monto_deposito * i.tasa_uf_anual * (i.plazo_dias / DIAS_ANIO);
  }
  
  const impuesto_retenido = Math.round(rendimiento_bruto * IMPUESTO_RENTAS_FINANCIERAS);
  const rendimiento_neto = Math.round(rendimiento_bruto - impuesto_retenido);
  const monto_final = Math.round(i.monto_deposito + rendimiento_neto);
  
  // Tasa neta anual
  const tasa_neta_anual = (rendimiento_neto / i.monto_deposito) * (DIAS_ANIO / i.plazo_dias);
  
  // Comparativa con otros bancos (si se selecciona uno, mostrar todos)
  const bancos = ['bancoestado', 'chileno', 'santander', 'bci'];
  const comparativa_bancos: OutputBanco[] = bancos.map(banco => {
    const tasa = obtenerTasaPorBancoYPlazo(banco, i.plazo_dias);
    const rendimiento = i.monto_deposito * tasa * (i.plazo_dias / DIAS_ANIO);
    const impuesto = rendimiento * IMPUESTO_RENTAS_FINANCIERAS;
    const rendimiento_neto_banco = rendimiento - impuesto;
    
    return {
      banco: banco === 'chileno' ? 'Banco Chile' : banco.charAt(0).toUpperCase() + banco.slice(1),
      tasa: tasa * 100,
      rendimiento_bruto: Math.round(rendimiento),
      impuesto: Math.round(impuesto),
      rendimiento_neto: Math.round(rendimiento_neto_banco)
    };
  });
  
  // Alternativa UF
  let alternativa_uf = '';
  if (i.tipo_deposito === 'nominal') {
    const rendimiento_uf = i.monto_deposito * i.tasa_uf_anual * (i.plazo_dias / DIAS_ANIO);
    const impuesto_uf = rendimiento_uf * IMPUESTO_RENTAS_FINANCIERAS;
    const rendimiento_neto_uf = rendimiento_uf - impuesto_uf;
    const diferencia = rendimiento_neto_uf - rendimiento_neto;
    
    if (diferencia > 0) {
      alternativa_uf = `Depósito en UF reajustable (${i.tasa_uf_anual.toFixed(2)}% anual) generaría $${Math.round(rendimiento_neto_uf).toLocaleString('es-CL')} netos, $${Math.round(diferencia).toLocaleString('es-CL')} más que nominal (con reajuste IPC proyectado).`;
    } else {
      alternativa_uf = `Depósito en UF reajustable (${i.tasa_uf_anual.toFixed(2)}% anual) generaría $${Math.round(rendimiento_neto_uf).toLocaleString('es-CL')} netos, $${Math.round(Math.abs(diferencia)).toLocaleString('es-CL')} menos que nominal.`;
    }
  } else {
    alternativa_uf = 'Depósito UF seleccionado. Rendimiento protegido contra inflación mediante reajuste diario IPC.';
  }
  
  return {
    rendimiento_bruto: Math.round(rendimiento_bruto),
    impuesto_retenido,
    rendimiento_neto,
    tasa_neta_anual: parseFloat((tasa_neta_anual * 100).toFixed(2)),
    monto_final,
    comparativa_bancos,
    alternativa_uf
  };
}
