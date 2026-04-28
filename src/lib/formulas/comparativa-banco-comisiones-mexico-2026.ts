export interface Inputs {
  banco_seleccionado: 'bbva' | 'citibanamex' | 'banorte' | 'santander' | 'hsbc' | 'nu' | 'stori' | 'klar';
  retiros_atm_ajeno: number;
  transferencias_nacionales: number;
  consultas_saldo: number;
  servicios_adicionales?: string[];
  saldo_promedio?: number;
  depositos_mensuales: number;
}

export interface Outputs {
  comision_manejo_cuenta: number;
  comision_retiros: number;
  comision_transferencias: number;
  comision_consultas: number;
  comision_servicios_adic: number;
  comision_depositos: number;
  total_comisiones_mes: number;
  total_anual: number;
  beneficiario_exencion: string;
  ranking_competitivo: string;
}

export function compute(i: Inputs): Outputs {
  // Tarifas 2026 por banco (fuente: sitios web oficiales + CONDUSEF)
  const tarifas: Record<string, {
    manejo: number;
    retiro_atm_ajeno: number;
    transferencia: number;
    consulta_saldo: number;
    deposito_efectivo: number;
    saldo_exencion: number;
  }> = {
    bbva: {
      manejo: 0,
      retiro_atm_ajeno: 9.5,
      transferencia: 0,
      consulta_saldo: 3.5,
      deposito_efectivo: 0,
      saldo_exencion: 100000
    },
    citibanamex: {
      manejo: 100,
      retiro_atm_ajeno: 12,
      transferencia: 0,
      consulta_saldo: 5,
      deposito_efectivo: 0,
      saldo_exencion: 150000
    },
    banorte: {
      manejo: 80,
      retiro_atm_ajeno: 15,
      transferencia: 0,
      consulta_saldo: 5,
      deposito_efectivo: 0,
      saldo_exencion: 120000
    },
    santander: {
      manejo: 50,
      retiro_atm_ajeno: 10,
      transferencia: 0,
      consulta_saldo: 3,
      deposito_efectivo: 0,
      saldo_exencion: 100000
    },
    hsbc: {
      manejo: 120,
      retiro_atm_ajeno: 15,
      transferencia: 0,
      consulta_saldo: 6,
      deposito_efectivo: 0,
      saldo_exencion: 150000
    },
    nu: {
      manejo: 0,
      retiro_atm_ajeno: 0,
      transferencia: 0,
      consulta_saldo: 0,
      deposito_efectivo: 0,
      saldo_exencion: 0
    },
    stori: {
      manejo: 0,
      retiro_atm_ajeno: 0,
      transferencia: 0,
      consulta_saldo: 0,
      deposito_efectivo: 0,
      saldo_exencion: 0
    },
    klar: {
      manejo: 0,
      retiro_atm_ajeno: 0,
      transferencia: 0,
      consulta_saldo: 0,
      deposito_efectivo: 0,
      saldo_exencion: 0
    }
  };

  const tarifa = tarifas[i.banco_seleccionado];
  const saldoPromedio = i.saldo_promedio || 50000;
  
  // Calcular exención por saldo
  let comision_manejo = saldoPromedio >= tarifa.saldo_exencion ? 0 : tarifa.manejo;
  
  // Calcular comisiones por servicio
  const comision_retiros = i.retiros_atm_ajeno * tarifa.retiro_atm_ajeno;
  const comision_transferencias = i.transferencias_nacionales * tarifa.transferencia;
  const comision_consultas = i.consultas_saldo * tarifa.consulta_saldo;
  const comision_depositos = i.depositos_mensuales * tarifa.deposito_efectivo;
  
  // Servicios adicionales
  let comision_servicios_adic = 0;
  if (i.servicios_adicionales && i.servicios_adicionales.length > 0) {
    if (i.servicios_adicionales.includes('chequera')) {
      comision_servicios_adic += 35; // Costo promedio talonario
    }
    if (i.servicios_adicionales.includes('estado_cuenta')) {
      comision_servicios_adic += 10; // Algunos bancos cobran
    }
  }
  
  // Totales
  const total_comisiones_mes = 
    comision_manejo +
    comision_retiros +
    comision_transferencias +
    comision_consultas +
    comision_depositos +
    comision_servicios_adic;
  
  const total_anual = Math.round(total_comisiones_mes * 12 * 100) / 100;
  
  // Determinar si aplica exención
  let beneficiario_exencion = 'No aplica exención';
  if (saldoPromedio >= tarifa.saldo_exencion && tarifa.saldo_exencion > 0) {
    beneficiario_exencion = `Exención de comisión de manejo por saldo ≥$${tarifa.saldo_exencion.toLocaleString('es-MX')}`;
  }
  if (i.banco_seleccionado === 'nu' || i.banco_seleccionado === 'stori' || i.banco_seleccionado === 'klar') {
    beneficiario_exencion = 'Banco digital: $0 comisiones en retiros, transferencias SPEI y consultas';
  }
  
  // Ranking: comparar con otros bancos para mismo perfil
  const gastosOtrosBancos: Record<string, number> = {};
  Object.keys(tarifas).forEach(banco => {
    const t = tarifas[banco];
    const manejoTemp = saldoPromedio >= t.saldo_exencion ? 0 : t.manejo;
    const totalTemp = 
      manejoTemp +
      (i.retiros_atm_ajeno * t.retiro_atm_ajeno) +
      (i.transferencias_nacionales * t.transferencia) +
      (i.consultas_saldo * t.consulta_saldo) +
      (i.depositos_mensuales * t.deposito_efectivo);
    gastosOtrosBancos[banco] = totalTemp;
  });
  
  const ranking = Object.entries(gastosOtrosBancos)
    .sort((a, b) => a[1] - b[1])
    .map(([banco, gasto], idx) => {
      const posicion = idx + 1;
      const bancosNombre: Record<string, string> = {
        nu: 'NU',
        stori: 'Stori',
        klar: 'Klar',
        bbva: 'BBVA',
        santander: 'Santander',
        citibanamex: 'Citibanamex',
        banorte: 'Banorte',
        hsbc: 'HSBC'
      };
      return `${posicion}. ${bancosNombre[banco]} - $${Math.round(gasto * 100) / 100} MXN/mes`;
    })
    .join(' | ');
  
  const ranking_competitivo = `Ranking mensual según perfil:\n${ranking}`;
  
  return {
    comision_manejo_cuenta: Math.round(comision_manejo * 100) / 100,
    comision_retiros: Math.round(comision_retiros * 100) / 100,
    comision_transferencias: Math.round(comision_transferencias * 100) / 100,
    comision_consultas: Math.round(comision_consultas * 100) / 100,
    comision_servicios_adic: Math.round(comision_servicios_adic * 100) / 100,
    comision_depositos: Math.round(comision_depositos * 100) / 100,
    total_comisiones_mes: Math.round(total_comisiones_mes * 100) / 100,
    total_anual: total_anual,
    beneficiario_exencion: beneficiario_exencion,
    ranking_competitivo: ranking_competitivo
  };
}
