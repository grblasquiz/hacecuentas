export interface Inputs {
  modalidad: 'red' | 'cilindro';
  consumo_m3: number;
  tamaño_cilindro: '5' | '11' | '15' | '45';
  region: string;
  consumo_anual_cilindros: number;
}

export interface Outputs {
  costo_mensual_red: number;
  costo_mensual_cilindro: number;
  diferencia_mensual: number;
  ahorro_anual: number;
  recomendacion: string;
  punto_equilibrio_m3: number;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Chile - SII/CNE/Metrogas/distribuidoras
  const IVA = 0.19;
  
  // Tarifa red domiciliaria (Metrogas) 2026
  // Fuente: SII, Metrogas S.A. - valores referenciales por región
  const tarifasRedPorRegion: { [key: string]: { cargoFijo: number; precioM3: number } } = {
    'metropolitana': { cargoFijo: 15200, precioM3: 600 },
    'valparaiso': { cargoFijo: 16400, precioM3: 648 },
    'libertador_bernardo_ohiggins': { cargoFijo: 15800, precioM3: 612 },
    'maule': { cargoFijo: 17200, precioM3: 672 },
    'ñuble': { cargoFijo: 17600, precioM3: 684 },
    'biobio': { cargoFijo: 17800, precioM3: 696 },
    'araucania': { cargoFijo: 18200, precioM3: 708 },
    'los_rios': { cargoFijo: 18600, precioM3: 720 },
    'los_lagos': { cargoFijo: 19400, precioM3: 744 },
    'aysén': { cargoFijo: 22800, precioM3: 852 },
    'magallanes': { cargoFijo: 21200, precioM3: 804 },
    'arica_parinacota': { cargoFijo: 16800, precioM3: 660 },
    'tarapaca': { cargoFijo: 16200, precioM3: 636 },
    'antofagasta': { cargoFijo: 15600, precioM3: 624 },
    'atacama': { cargoFijo: 15400, precioM3: 618 },
    'coquimbo': { cargoFijo: 15200, precioM3: 600 }
  };
  
  const tarifaRed = tarifasRedPorRegion[i.region] || tarifasRedPorRegion['metropolitana'];
  
  // Cálculo costo mensual red
  const costoVariableRed = i.consumo_m3 * tarifaRed.precioM3;
  const subtotalRed = tarifaRed.cargoFijo + costoVariableRed;
  const costoMensualRed = Math.round(subtotalRed * (1 + IVA));
  
  // Precios cilindro 2026 - promedio nacional (Lipigas, Abastible, Gasco)
  // Fuente: distribuidoras, CNE 2026
  const preciosCilindro: { [key: string]: number } = {
    '5': 8500,
    '11': 16200,
    '15': 21800,
    '45': 58500
  };
  
  const precioCilindro = preciosCilindro[i.tamaño_cilindro];
  const m3PorCilindro: { [key: string]: number } = {
    '5': 2.6,
    '11': 5.8,
    '15': 7.9,
    '45': 23.7
  };
  
  const m3Cilindro = m3PorCilindro[i.tamaño_cilindro];
  
  // Cilindros necesarios por mes
  const cilindrosPorMes = i.consumo_m3 / m3Cilindro;
  
  // Costo mensual promedio cilindro
  const costoCilindroMensual = (cilindrosPorMes * precioCilindro);
  const costoMensualCilindro = Math.round(costoCilindroMensual * (1 + IVA));
  
  // Diferencia y ahorro anual
  const diferenciaMensual = costoMensualRed - costoMensualCilindro;
  const ahorroAnual = Math.round(Math.abs(diferenciaMensual) * 12);
  
  // Punto de equilibrio m³
  const precioM3PromedioCilindro = (precioCilindro / m3Cilindro);
  const puntoEquilibrio = tarifaRed.cargoFijo / (tarifaRed.precioM3 - precioM3PromedioCilindro);
  const puntoEquilibrioRedondeado = Math.round(puntoEquilibrio * 10) / 10;
  
  // Recomendación
  let recomendacion = '';
  let mensajeAhorro = '';
  
  if (costoMensualRed < costoMensualCilindro) {
    recomendacion = `Red domiciliaria (Metrogas). Ahorras $${(diferenciaMensual).toLocaleString('es-CL')} mensual.`;
    mensajeAhorro = `Cambiar a red te genera ahorro $${ahorroAnual.toLocaleString('es-CL')}/año.`;
  } else {
    recomendacion = `Cilindro ${i.tamaño_cilindro} kg. Ahorras $${Math.abs(diferenciaMensual).toLocaleString('es-CL')} mensual.`;
    mensajeAhorro = `Mantener cilindro te genera ahorro $${ahorroAnual.toLocaleString('es-CL')}/año.`;
  }
  
  if (i.consumo_m3 > puntoEquilibrioRedondeado) {
    recomendacion += ` A tu consumo de ${i.consumo_m3} m³/mes, red es más eficiente (punto equilibrio: ${puntoEquilibrioRedondeado} m³).`;
  } else if (i.consumo_m3 < puntoEquilibrioRedondeado) {
    recomendacion += ` A tu consumo bajo de ${i.consumo_m3} m³/mes, cilindro es viable (punto equilibrio: ${puntoEquilibrioRedondeado} m³).`;
  }
  
  return {
    costo_mensual_red: costoMensualRed,
    costo_mensual_cilindro: costoMensualCilindro,
    diferencia_mensual: diferenciaMensual,
    ahorro_anual: ahorroAnual,
    recomendacion: recomendacion,
    punto_equilibrio_m3: puntoEquilibrioRedondeado
  };
}
