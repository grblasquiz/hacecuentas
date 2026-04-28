export interface Inputs {
  banco_seleccionado: 'mach' | 'tenpo' | 'chita' | 'itau_digital' | 'mercado_pago';
  transferencias_mensuales: number;
  compras_tarjeta_mensual: number;
  retiros_atm_mensual: number;
  giros_internacional_anual: number;
  depositos_mensuales: number;
  saldo_promedio: number;
  gasto_mensual_usd: number;
  activo_cashback: 'si' | 'no';
  apertura_cuenta: 'rapida_digital' | 'presencial';
}

export interface Outputs {
  comisiones_anuales: number;
  beneficios_anuales: number;
  costo_neto_anual: number;
  ranking_bancos: string;
  ahorro_vs_mejor: number;
  puntuacion_general: number;
  recomendacion: string;
}

interface BancoConfig {
  nombre: string;
  costo_transferencia: number;
  retiros_gratis_mes: number;
  costo_retiro_excedente: number;
  costo_deposito: number;
  comision_giro_pct: number;
  comision_giro_fija: number;
  cashback_pct: number;
  tasa_cambio_recargo_pct: number;
  punto_credit_pct: number;
}

const bancos: Record<string, BancoConfig> = {
  mach: {
    nombre: 'Mach (BCI)',
    costo_transferencia: 0,
    retiros_gratis_mes: 5,
    costo_retiro_excedente: 500,
    costo_deposito: 0,
    comision_giro_pct: 0.5,
    comision_giro_fija: 0,
    cashback_pct: 0.8,
    tasa_cambio_recargo_pct: -0.2,
    punto_credit_pct: 0
  },
  tenpo: {
    nombre: 'Tenpo',
    costo_transferencia: 0,
    retiros_gratis_mes: 999,
    costo_retiro_excedente: 0,
    costo_deposito: 0,
    comision_giro_pct: 1.0,
    comision_giro_fija: 8000,
    cashback_pct: 0.4,
    tasa_cambio_recargo_pct: 1.0,
    punto_credit_pct: 0
  },
  chita: {
    nombre: 'Chita',
    costo_transferencia: 0,
    retiros_gratis_mes: 0,
    costo_retiro_excedente: 1500,
    costo_deposito: 0,
    comision_giro_pct: 1.5,
    comision_giro_fija: 12000,
    cashback_pct: 0.3,
    tasa_cambio_recargo_pct: 1.5,
    punto_credit_pct: 0
  },
  itau_digital: {
    nombre: 'Banco Itaú Digital',
    costo_transferencia: 0,
    retiros_gratis_mes: 3,
    costo_retiro_excedente: 2000,
    costo_deposito: 0,
    comision_giro_pct: 0.7,
    comision_giro_fija: 10000,
    cashback_pct: 0.1,
    tasa_cambio_recargo_pct: 0.8,
    punto_credit_pct: 0.1
  },
  mercado_pago: {
    nombre: 'Mercado Pago',
    costo_transferencia: 0,
    retiros_gratis_mes: 0,
    costo_retiro_excedente: 1000,
    costo_deposito: 0,
    comision_giro_pct: 2.0,
    comision_giro_fija: 15000,
    cashback_pct: 1.5,
    tasa_cambio_recargo_pct: 1.2,
    punto_credit_pct: 0
  }
};

function calcularCostosBank(
  config: BancoConfig,
  inputs: Inputs
): { comisiones: number; beneficios: number } {
  // Comisiones anuales
  const comisiones_transferencias = inputs.transferencias_mensuales * 12 * config.costo_transferencia;
  
  const retiros_excedentes = Math.max(
    0,
    (inputs.retiros_atm_mensual - config.retiros_gratis_mes) * 12
  );
  const comisiones_retiros = retiros_excedentes * config.costo_retiro_excedente;
  
  const comisiones_depositos = inputs.depositos_mensuales * 12 * config.costo_deposito;
  
  // Giros internacionales (asume $2M promedio por giro)
  const monto_giro_promedio = 2000000;
  const comisiones_giros =
    inputs.giros_internacional_anual *
    (monto_giro_promedio * (config.comision_giro_pct / 100) + config.comision_giro_fija);
  
  const comisiones_totales =
    comisiones_transferencias +
    comisiones_retiros +
    comisiones_depositos +
    comisiones_giros;
  
  // Beneficios anuales
  let beneficios = 0;
  
  if (inputs.activo_cashback === 'si') {
    // Cashback en compras débito
    const compras_anual = inputs.compras_tarjeta_mensual * 12;
    const monto_promedio_compra = 35000; // estimado
    const monto_total_compras = compras_anual * monto_promedio_compra;
    beneficios += monto_total_compras * (config.cashback_pct / 100);
    
    // Puntos credit (si aplica)
    beneficios += monto_total_compras * (config.punto_credit_pct / 100) * 0.001; // valor punto ~$1
  }
  
  // Beneficio/penalidad en cambio USD
  if (inputs.gasto_mensual_usd > 0) {
    const valor_usd_aproximado = 900; // referencial 2026
    const monto_usd_anual = inputs.gasto_mensual_usd * 12 * valor_usd_aproximado;
    
    if (config.tasa_cambio_recargo_pct < 0) {
      // Ahorro (Mach)
      beneficios += monto_usd_anual * Math.abs(config.tasa_cambio_recargo_pct / 100);
    } else {
      // Costo adicional (penalización ya en comisiones, pero reflejamos)
      beneficios -= monto_usd_anual * (config.tasa_cambio_recargo_pct / 100);
    }
  }
  
  return {
    comisiones: Math.max(0, comisiones_totales),
    beneficios: Math.max(0, beneficios)
  };
}

export function compute(inputs: Inputs): Outputs {
  // Calcular para todos los bancos
  const resultados = Object.entries(bancos).map(([slug, config]) => {
    const { comisiones, beneficios } = calcularCostosBank(config, inputs);
    const costo_neto = comisiones - beneficios;
    
    // Puntuación (0-100)
    let puntuacion = 100;
    
    // Penalización por costo neto
    if (inputs.saldo_promedio > 0) {
      const tasa_costo = (costo_neto / inputs.saldo_promedio) * 1000;
      puntuacion -= Math.min(40, tasa_costo * 2);
    }
    
    // Bonus por apertura digital
    if (inputs.apertura_cuenta === 'rapida_digital') {
      puntuacion += 15;
    }
    
    // Bonus por internacionalización si usa USD
    if (inputs.gasto_mensual_usd > 100 && config.tasa_cambio_recargo_pct <= 0) {
      puntuacion += 10;
    }
    
    // Bonus por retiros gratis si retira seguido
    if (inputs.retiros_atm_mensual > 5 && config.retiros_gratis_mes > 5) {
      puntuacion += 8;
    }
    
    puntuacion = Math.max(0, Math.min(100, puntuacion));
    
    return {
      slug,
      nombre: config.nombre,
      comisiones,
      beneficios,
      costo_neto,
      puntuacion
    };
  });
  
  // Ordenar por costo neto (menor primero)
  const ranking_ordenado = resultados.sort((a, b) => a.costo_neto - b.costo_neto);
  
  // Banco seleccionado
  const banco_actual = resultados.find(r => r.slug === inputs.banco_seleccionado) || resultados[0];
  
  // Mejor opción
  const mejor = ranking_ordenado[0];
  const ahorro_vs_mejor = banco_actual.costo_neto - mejor.costo_neto;
  
  // Generar ranking textual
  const ranking_texto = ranking_ordenado
    .slice(0, 5)
    .map(
      (r, idx) =>
        `${idx + 1}. **${r.nombre}**: $${r.costo_neto.toLocaleString('es-CL', { maximumFractionDigits: 0 })} neto (puntuación: ${r.puntuacion.toFixed(0)})`
    )
    .join('\\n');
  
  // Generar recomendación
  let recomendacion = '';
  
  if (inputs.transferencias_mensuales > 20) {
    recomendacion = '**Perfil transferencias frecuentes**: Todos los bancos digitales están optimizados para ti. Diferencia marginal en costos. Elige por interfaz o integraciones laborales.';
  } else if (inputs.retiros_atm_mensual > 8) {
    recomendacion = `**Perfil alto retiro efectivo**: ${mejor.nombre} es tu opción porque minimiza costo de retiros. Tenpo es gratis ilimitado, Mach + 5 gratis/mes.`;
  } else if (inputs.gasto_mensual_usd > 300) {
    recomendacion = '**Perfil internacionalizado**: Mach es la opción si necesitas cambio USD frecuente (recargo negativo = ahorro). Para depósitos/transferencias USD, evalúa también Tenpo.';
  } else if (inputs.activo_cashback === 'si') {
    recomendacion = `**Perfil cashback activo**: ${mejor.nombre} maximiza tus recompensas. Mercado Pago ofrece 1,5% pero requiere más actividad en su ecosistema.`;
  } else {
    recomendacion = `**Perfil usuario promedio**: ${mejor.nombre} es tu banco digital más barato. Sin transferencias frecuentes ni retiros, el costo es marginal para los cinco.`;
  }
  
  return {
    comisiones_anuales: banco_actual.comisiones,
    beneficios_anuales: banco_actual.beneficios,
    costo_neto_anual: banco_actual.costo_neto,
    ranking_bancos: ranking_texto,
    ahorro_vs_mejor: Math.max(0, ahorro_vs_mejor),
    puntuacion_general: Math.round(banco_actual.puntuacion),
    recomendacion
  };
}
