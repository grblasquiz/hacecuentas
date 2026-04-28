export interface Inputs {
  monto_premio: number;
  tipo_juego: 'baloto' | 'loteria_nacional' | 'loteria_departamental' | 'otros_juegos';
  uvt_2026: number;
}

export interface Outputs {
  uvt_48_pesos: number;
  supera_umbral: string;
  retension_17: number;
  premio_neto: number;
  ganancia_ocasional: number;
  impuesto_complementario: number;
  total_impuesto: number;
  tasa_efectiva: number;
  obligacion_declaracion: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validación
  const uvt_2026 = i.uvt_2026 || 50652; // DIAN 2026
  const umbral_uvt = 48; // Ley, Decreto 624/1989
  const retencion_porcentaje = 0.17; // 17% - retención obligatoria
  
  // Tarifa marginal estimada ganancia ocasional (aprox. 37% sin otros ingresos, máx. 39% con otros)
  const tarifa_marginal_base = 0.37; // Reforma tributaria 2022
  
  // Cálculo del umbral en pesos
  const uvt_48_pesos = umbral_uvt * uvt_2026;
  
  // Validar monto positivo
  const monto = i.monto_premio > 0 ? i.monto_premio : 0;
  
  // Determinar si supera umbral
  const supera = monto > uvt_48_pesos;
  const supera_umbral = supera ? 'Sí, aplica retención' : 'No, bajo umbral';
  
  // Retención en la fuente (solo si supera umbral)
  const retension_17 = supera ? Math.round(monto * retencion_porcentaje) : 0;
  
  // Premio neto a recibir
  const premio_neto = monto - retension_17;
  
  // Ganancia ocasional (gravable, solo si supera umbral)
  const ganancia_ocasional = supera ? monto : 0;
  
  // Impuesto complementario estimado
  // = (Ganancia ocasional × Tarifa marginal) − Retención ya pagada
  // Nota: si no hay otros ingresos y ganancia ocasional es único ingreso,
  // la tarifa marginal es aproximadamente 37%. Con otros ingresos sube hasta 39%.
  // Esta calculadora asume tarifa base 37% (caso común: ganador sin otros ingresos).
  let impuesto_complementario = 0;
  if (supera) {
    const impuesto_definitivo = Math.round(ganancia_ocasional * tarifa_marginal_base);
    impuesto_complementario = Math.max(0, impuesto_definitivo - retension_17);
  }
  
  // Total impuesto (retención + complementario)
  const total_impuesto = retension_17 + impuesto_complementario;
  
  // Tasa efectiva de impuesto
  const tasa_efectiva = monto > 0 ? Math.round((total_impuesto / monto) * 10000) / 100 : 0;
  
  // Obligación de declaración
  let obligacion_declaracion = 'No obligado (bajo umbral)';
  if (supera) {
    obligacion_declaracion = 'Sí, obligado. Declarar formulario 210 (Ganancia ocasional)';
  }
  
  return {
    uvt_48_pesos: Math.round(uvt_48_pesos),
    supera_umbral,
    retension_17,
    premio_neto,
    ganancia_ocasional,
    impuesto_complementario,
    total_impuesto,
    tasa_efectiva,
    obligacion_declaracion
  };
}
