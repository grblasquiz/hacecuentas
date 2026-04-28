export interface Inputs {
  tipo_banco: string;
  transferencias_mensuales: number;
  retiros_atm_mensuales: number;
  depositos_mensuales: number;
  consultas_saldo: number;
  volumen_transferencias: number;
  tiene_nomina: string;
  saldo_promedio: number;
}

export interface Outputs {
  comision_manejo_cuenta: number;
  comision_transferencias: number;
  comision_retiros_atm: number;
  comision_depositos: number;
  gravamen_gmf: number;
  otras_comisiones: number;
  total_comisiones_mes: number;
  total_anual: number;
  banco_recomendado: string;
  ahorro_anual_mejor: number;
}

// Tarifas 2026 Colombia - Fuente: DIAN, Superfinanciera, carteradores oficiales
const TARIFAS_BANCOS: Record<string, any> = {
  bancolombia: {
    manejo_sin_nomina: 24000,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 3400,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 999,
    retiro_atm: 2900,
    deposito: 2900,
    consulta_extracto: 1500,
    nombre: 'Bancolombia'
  },
  davivienda: {
    manejo_sin_nomina: 22000,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 3500,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 20,
    retiro_atm: 3000,
    deposito: 3000,
    consulta_extracto: 1500,
    nombre: 'Davivienda'
  },
  bbva: {
    manejo_sin_nomina: 21000,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 3500,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 999,
    retiro_atm: 2900,
    deposito: 2500,
    consulta_extracto: 1200,
    nombre: 'BBVA'
  },
  banco_bogota: {
    manejo_sin_nomina: 24000,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 3500,
    transferencia_con_nomina: 2500,
    transferencias_exoneradas_nomina: 0,
    retiro_atm: 3000,
    deposito: 3000,
    consulta_extracto: 1500,
    nombre: 'Banco de Bogotá'
  },
  nu: {
    manejo_sin_nomina: 0,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 0,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 999,
    retiro_atm: 2450,
    retiro_atm_gratis_limite: 2,
    deposito: 0,
    consulta_extracto: 0,
    nombre: 'Nu'
  },
  lulo: {
    manejo_sin_nomina: 9000,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 0,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 999,
    retiro_atm: 2450,
    deposito: 0,
    consulta_extracto: 0,
    nombre: 'Lulo Bank'
  },
  rappipay: {
    manejo_sin_nomina: 0,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 0,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 999,
    retiro_atm: 2450,
    retiro_atm_gratis_limite: 2,
    deposito: 0,
    consulta_extracto: 0,
    nombre: 'RappiPay'
  },
  daviplata: {
    manejo_sin_nomina: 0,
    manejo_con_nomina: 0,
    transferencia_sin_nomina: 2500,
    transferencia_con_nomina: 0,
    transferencias_exoneradas_nomina: 0,
    retiro_atm: 2450,
    deposito: 0,
    consulta_extracto: 0,
    nombre: 'Daviplata'
  }
};

// Gravamen a Movimientos Financieros (GMF) 4×1000 - Fuente: DIAN
const TASA_GMF = 0.004; // 4 pesos por cada 1000

export function compute(i: Inputs): Outputs {
  const tarifa = TARIFAS_BANCOS[i.tipo_banco];
  if (!tarifa) {
    return getDefaultOutputs('Banco no encontrado', 0);
  }

  const conNomina = i.tiene_nomina === 'si';

  // 1. COMISIÓN MANEJO DE CUENTA
  let comision_manejo = conNomina ? tarifa.manejo_con_nomina : tarifa.manejo_sin_nomina;

  // 2. COMISIONES TRANSFERENCIAS
  let transferencias_a_cobrar = i.transferencias_mensuales;
  if (conNomina && tarifa.transferencias_exoneradas_nomina > 0) {
    transferencias_a_cobrar = Math.max(0, i.transferencias_mensuales - tarifa.transferencias_exoneradas_nomina);
  }
  const valor_transferencia = conNomina ? tarifa.transferencia_con_nomina : tarifa.transferencia_sin_nomina;
  let comision_transferencias = transferencias_a_cobrar * valor_transferencia;

  // 3. COMISIONES RETIROS ATM
  let comision_retiros_atm = 0;
  let retiros_con_comision = i.retiros_atm_mensuales;

  // Nu y RappiPay: 2 retiros gratis, luego cobran
  if ((i.tipo_banco === 'nu' || i.tipo_banco === 'rappipay') && tarifa.retiro_atm_gratis_limite) {
    retiros_con_comision = Math.max(0, i.retiros_atm_mensuales - tarifa.retiro_atm_gratis_limite);
  }

  comision_retiros_atm = retiros_con_comision * tarifa.retiro_atm;

  // 4. COMISIONES DEPÓSITOS
  let comision_depositos = i.depositos_mensuales * tarifa.deposito;

  // 5. OTRAS COMISIONES (consultas, extractos)
  let otras_comisiones = i.consultas_saldo * tarifa.consulta_extracto;

  // 6. GRAVAMEN 4×1000 (GMF)
  // Aplicar sobre débitos (transferencias interbancarias + retiros)
  const volumen_debitos = i.volumen_transferencias;
  const gravamen_gmf = Math.round(volumen_debitos * TASA_GMF);

  // TOTALES
  const total_comisiones_mes = Math.round(
    comision_manejo +
    comision_transferencias +
    comision_retiros_atm +
    comision_depositos +
    otras_comisiones +
    gravamen_gmf
  );

  const total_anual = total_comisiones_mes * 12;

  return {
    comision_manejo_cuenta: Math.round(comision_manejo),
    comision_transferencias: Math.round(comision_transferencias),
    comision_retiros_atm: Math.round(comision_retiros_atm),
    comision_depositos: Math.round(comision_depositos),
    gravamen_gmf,
    otras_comisiones: Math.round(otras_comisiones),
    total_comisiones_mes,
    total_anual,
    banco_recomendado: tarifa.nombre,
    ahorro_anual_mejor: 0
  };
}

function getDefaultOutputs(recomendacion: string, ahorro: number): Outputs {
  return {
    comision_manejo_cuenta: 0,
    comision_transferencias: 0,
    comision_retiros_atm: 0,
    comision_depositos: 0,
    gravamen_gmf: 0,
    otras_comisiones: 0,
    total_comisiones_mes: 0,
    total_anual: 0,
    banco_recomendado: recomendacion,
    ahorro_anual_mejor: ahorro
  };
}
