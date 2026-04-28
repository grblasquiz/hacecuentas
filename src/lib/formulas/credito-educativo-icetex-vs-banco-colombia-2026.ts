export interface Inputs {
  tipo_credito: string;
  monto_credito: number;
  tasa_anual: number;
  plazo_meses: number;
  meses_periodo_estudio: number;
  modalidad_pago_estudio: string;
  estrato: string;
  zona_residencia: string;
}

export interface Outputs {
  tasa_aplicada: number;
  cuota_mensual_estudio: number;
  pago_total_estudio: number;
  capital_acumulado_estudio: number;
  cuota_mensual_postgrado: number;
  pago_total_postgrado: number;
  interes_total: number;
  costo_total_credito: number;
  ahorro_vs_banco: number;
  requisitos: string;
  beneficios_especiales: string;
  tabla_amortizacion_resumen: string;
}

export function compute(i: Inputs): Outputs {
  // Determinar tasa aplicada según institución y perfil
  let tasa_anual = i.tasa_anual;
  let tasa_mensual = 0;
  let requisitos = "";
  let beneficios_especiales = "";
  
  // ICETEX Pregrado
  if (i.tipo_credito === "icetex_pregrado") {
    // Subsidio por zona (DIAN/MinEducación 2026)
    if (i.zona_residencia === "rural") {
      // Zona rural: 0-1.5%
      if (i.estrato === "1" || i.estrato === "2") {
        tasa_anual = 0.0; // 0% para estrato 1-2 rural
      } else if (i.estrato === "3" || i.estrato === "4") {
        tasa_anual = 0.75; // 0.75% estrato 3-4 rural
      } else {
        tasa_anual = 1.5; // 1.5% estrato 5-6 rural
      }
    } else if (i.zona_residencia === "frontera") {
      // Zona fronteriza: 0.5-2%
      if (i.estrato === "1" || i.estrato === "2") {
        tasa_anual = 0.5;
      } else if (i.estrato === "3" || i.estrato === "4") {
        tasa_anual = 1.25;
      } else {
        tasa_anual = 2.0;
      }
    } else {
      // Zona urbana: 2-5%
      if (i.estrato === "1" || i.estrato === "2") {
        tasa_anual = 2.0;
      } else if (i.estrato === "3" || i.estrato === "4") {
        tasa_anual = 2.5;
      } else {
        tasa_anual = 5.0; // máximo estrato 5-6
      }
    }
    requisitos = "• Aceptación en programa acreditado SNIES\n• Ciudadanía colombiana\n• Perfil de elegibilidad ICETEX\n• Renta familiar según puntaje SABER 11\n• Estar matriculado en institución certificada";
    beneficios_especiales = "• 6 meses gracia post-grado sin pago\n• Moratoria por desempleo hasta 24 meses\n• Condonación parcial (casos extremos)\n• Acceso a fondos de solidaridad";
  }
  
  // ICETEX Posgrado
  if (i.tipo_credito === "icetex_posgrado") {
    if (i.zona_residencia === "rural") {
      tasa_anual = 2.0; // 2% posgrado rural
    } else if (i.zona_residencia === "frontera") {
      tasa_anual = 2.5;
    } else {
      tasa_anual = 3.5; // 3-5% posgrado urbano según estrato
      if (i.estrato === "1" || i.estrato === "2") {
        tasa_anual = 3.0;
      } else if (i.estrato === "5" || i.estrato === "6") {
        tasa_anual = 5.0;
      }
    }
    requisitos = "• Aceptación en maestría/doctorado acreditado\n• Cédula profesional vigente\n• Experiencia laboral mínima 2 años (maestría)\n• Perfil investigativo (doctorado)";
    beneficios_especiales = "• Posible condonación por investigación o sector estratégico\n• Ampliación de plazo hasta 25 años\n• Descuento en tasa para doctorado en STEM";
  }
  
  // ICETEX Técnico/Tecnólogo
  if (i.tipo_credito === "icetex_tecnico") {
    tasa_anual = 0.5; // 0-2% técnico (subsidiado)
    if (i.estrato === "5" || i.estrato === "6") {
      tasa_anual = 2.0;
    } else if (i.estrato === "3" || i.estrato === "4") {
      tasa_anual = 1.0;
    }
    requisitos = "• Aceptación en programa técnico/tecnólogo SENA o similares\n• Máximo $30M de crédito\n• No tener crédito ICETEX vigente";
    beneficios_especiales = "• Tasa más baja del portafolio\n• Enfoque en sectores productivos\n• Vinculación laboral asegurada en algunos programas";
  }
  
  // BANCO BBVA
  if (i.tipo_credito === "banco_bbva") {
    // Tasa BBVA: 12-18% (DTF + spread 4-6%)
    // DTF 2026 estimado 8-12%, spread 6%
    tasa_anual = 14.5; // promedio 2026
    if (i.estrato === "5" || i.estrato === "6") {
      tasa_anual = 12.5; // mejor perfil
    } else {
      tasa_anual = 16.5; // otros estratos
    }
    requisitos = "• Mayoría de edad (18+)\n• Codeudor con capacidad de pago\n• Aval solidario o hipotecario\n• Estar matriculado en universidad acreditada\n• Cuota inicial: hasta 100% del semestre";
    beneficios_especiales = "• Desembolsos semestrales automáticos\n• Seguro de vida (cobertura por deceso/incapacidad)\n• Acceso a tasas preferenciales por empleador";
  }
  
  // BANCOLOMBIA
  if (i.tipo_credito === "banco_bancolombia") {
    tasa_anual = 15.0; // 13-17% bancolombia
    if (i.estrato >= "5") {
      tasa_anual = 13.5;
    } else {
      tasa_anual = 16.5;
    }
    requisitos = "• Cliente Bancolombia o apertura de cuenta\n• Codeudor principal\n• Aval bancario o hipotecario\n• Ingresos verificables\n• Estar en institución acreditada SNIES";
    beneficios_especiales = "• Desembolsos anuales o por semestre\n• Cobertura de seguro de vida\n• Posibilidad de refinanciamiento post-grado\n• Reducciones por puntaje crediticio";
  }
  
  // SUFI
  if (i.tipo_credito === "sufi") {
    tasa_anual = 13.5; // 12-15% SUFI
    requisitos = "• Aval solidario: grupo de 4-6 personas\n• Estar matriculado en carrera formal\n• Todos los avalistas con ingresos comprobables\n• Edad 18-50 años\n• Residencia en municipios donde opera SUFI";
    beneficios_especiales = "• Sin intermediarios bancarios\n• Aval solidario vs avalista individual\n• Desembolsos directos a institución educativa\n• Capacitación financiera incluida\n• Oportunidades de reinversión educativa";
  }
  
  // Fundación Mario Santo Domingo
  if (i.tipo_credito === "fundacion_mario_santo_domingo") {
    tasa_anual = 4.5; // 2-8% fundación (altamente subsidiada)
    if (i.estrato === "1" || i.estrato === "2") {
      tasa_anual = 2.0;
    } else {
      tasa_anual = 6.0;
    }
    requisitos = "• Vulnerabilidad socioeconómica acreditada\n• Mérito académico (SABER 11 > percentil 70)\n• Aceptación en universidad acreditada\n• Entrevista psicosocial\n• Becas complementarias disponibles";
    beneficios_especiales = "• Tasas muy subsidiadas (2-8%)\n• Apoyo complementario: mentoria, becas parciales\n• Posibles condonaciones por desempeño\n• Red de beneficiarios y empleadores\n• Cupos limitados (selección rigurosa)";
  }
  
  // Su Mejor Inversión
  if (i.tipo_credito === "fundacion_su_mejor_inversion") {
    tasa_anual = 5.0; // 3-7% Su Mejor Inversión
    if (i.estrato <= "3") {
      tasa_anual = 3.0;
    } else {
      tasa_anual = 6.0;
    }
    requisitos = "• Residente en Colombia 5+ años\n• Proyecto educativo viable\n• Viabilidad crediticia acreditada\n• Aceptación programa educativo\n• Entrevista evaluación integral";
    beneficios_especiales = "• Cofinanciamiento educativo + crédito\n• Tutoría académica y laboral\n• Red de empleadores confirmados\n• Plazos flexibles hasta 25 años\n• Subsidios adicionales por desempeño";
  }
  
  tasa_mensual = tasa_anual / 100 / 12;
  
  // Cálculos período de estudio
  let capital_acumulado_estudio = i.monto_credito;
  let cuota_mensual_estudio = 0;
  let pago_total_estudio = 0;
  
  if (i.modalidad_pago_estudio === "sin_pago") {
    // Capitalización de intereses (típico ICETEX)
    cuota_mensual_estudio = 0;
    // Acumular interés compuesto
    for (let mes = 1; mes <= i.meses_periodo_estudio; mes++) {
      capital_acumulado_estudio = capital_acumulado_estudio * (1 + tasa_mensual);
    }
    pago_total_estudio = 0;
  } else if (i.modalidad_pago_estudio === "solo_interes") {
    // Pago solo de intereses (bancos típico)
    cuota_mensual_estudio = i.monto_credito * tasa_mensual;
    pago_total_estudio = cuota_mensual_estudio * i.meses_periodo_estudio;
    capital_acumulado_estudio = i.monto_credito; // capital no cambia
  } else if (i.modalidad_pago_estudio === "cuota_reducida") {
    // Cuota al 50% (esquema mixto)
    // Usar fórmula francesa con plazo total, pero aplicar 50% durante estudio
    const i_mes = tasa_mensual;
    const factor = (i_mes * Math.pow(1 + i_mes, i.plazo_meses)) / (Math.pow(1 + i_mes, i.plazo_meses) - 1);
    const cuota_completa = i.monto_credito * factor;
    cuota_mensual_estudio = cuota_completa * 0.5;
    
    // Calcular saldo después de período estudio con cuota reducida
    let saldo = i.monto_credito;
    for (let mes = 1; mes <= i.meses_periodo_estudio; mes++) {
      const interes_mes = saldo * i_mes;
      saldo = saldo + interes_mes - cuota_mensual_estudio;
    }
    capital_acumulado_estudio = Math.max(saldo, 0);
    pago_total_estudio = cuota_mensual_estudio * i.meses_periodo_estudio;
  }
  
  // Cálculos período post-grado (repago normal)
  const meses_postgrado = i.plazo_meses - i.meses_periodo_estudio;
  const i_mes = tasa_mensual;
  
  let cuota_mensual_postgrado = 0;
  let pago_total_postgrado = 0;
  let interes_total = 0;
  
  if (capital_acumulado_estudio > 0 && meses_postgrado > 0) {
    // Fórmula francesa para post-grado
    const factor = (i_mes * Math.pow(1 + i_mes, meses_postgrado)) / (Math.pow(1 + i_mes, meses_postgrado) - 1);
    cuota_mensual_postgrado = capital_acumulado_estudio * factor;
    pago_total_postgrado = cuota_mensual_postgrado * meses_postgrado;
  }
  
  // Interés total pagado
  const costo_total_credito = pago_total_estudio + pago_total_postgrado;
  interes_total = costo_total_credito - i.monto_credito;
  
  // Ahorro vs banco (comparar con BBVA 14.5% si no es banco)
  let ahorro_vs_banco = 0;
  if (!i.tipo_credito.includes("banco") && i.tipo_credito !== "sufi") {
    // Calcular equivalente en banco BBVA
    const i_banco = 0.145 / 12; // 14.5% anual
    let capital_acum_banco = i.monto_credito;
    
    if (i.modalidad_pago_estudio === "sin_pago") {
      for (let mes = 1; mes <= i.meses_periodo_estudio; mes++) {
        capital_acum_banco = capital_acum_banco * (1 + i_banco);
      }
    } else {
      // banco: solo interés
      capital_acum_banco = i.monto_credito;
    }
    
    const factor_banco = (i_banco * Math.pow(1 + i_banco, meses_postgrado)) / (Math.pow(1 + i_banco, meses_postgrado) - 1);
    const cuota_banco = capital_acum_banco * factor_banco;
    const pago_banco = cuota_banco * meses_postgrado;
    const pago_interes_banco = meses_postgrado > 0 ? (i.monto_credito * i_banco * i.meses_periodo_estudio) : 0;
    const costo_total_banco = pago_interes_banco + pago_banco;
    
    ahorro_vs_banco = Math.max(0, costo_total_banco - costo_total_credito);
  }
  
  // Tabla de amortización simplificada (primeras 12 cuotas post-grado)
  let tabla = "Primeras 12 cuotas post-grado:\n";
  tabla += "Cuota | Saldo Inicial | Interés | Abono Capital | Saldo Final\n";
  tabla += "-----|--------------|---------|---------------|-----------\n";
  
  let saldo_amort = capital_acumulado_estudio;
  for (let m = 1; m <= Math.min(12, meses_postgrado); m++) {
    const interes_cuota = saldo_amort * i_mes;
    const abono_capital = cuota_mensual_postgrado - interes_cuota;
    const saldo_nuevo = Math.max(0, saldo_amort - abono_capital);
    
    tabla += `${m} | $${Math.round(saldo_amort).toLocaleString("es-CO")} | $${Math.round(interes_cuota).toLocaleString("es-CO")} | $${Math.round(abono_capital).toLocaleString("es-CO")} | $${Math.round(saldo_nuevo).toLocaleString("es-CO")}\n`;
    saldo_amort = saldo_nuevo;
  }
  
  if (meses_postgrado > 12) {
    tabla += `... (${meses_postgrado - 12} cuotas más) ...\n`;
  }
  
  return {
    tasa_aplicada: tasa_anual,
    cuota_mensual_estudio: Math.round(cuota_mensual_estudio),
    pago_total_estudio: Math.round(pago_total_estudio),
    capital_acumulado_estudio: Math.round(capital_acumulado_estudio),
    cuota_mensual_postgrado: Math.round(cuota_mensual_postgrado),
    pago_total_postgrado: Math.round(pago_total_postgrado),
    interes_total: Math.round(interes_total),
    costo_total_credito: Math.round(costo_total_credito),
    ahorro_vs_banco: Math.round(ahorro_vs_banco),
    requisitos: requisitos,
    beneficios_especiales: beneficios_especiales,
    tabla_amortizacion_resumen: tabla
  };
}
