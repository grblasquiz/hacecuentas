export interface Inputs {
  avaluo_fiscal: number;
  tipo_inmueble: 'residencial' | 'no_residencial' | 'agricola';
  aplicar_sobretasa: boolean;
}

export interface Outputs {
  tarifa_anual_efectiva: number;
  contribucion_anual_total: number;
  cuota_primera: number;
  cuota_segunda: number;
  cuota_tercera: number;
  cuota_cuarta: number;
  contribucion_mensual_promedio: number;
}

export function compute(i: Inputs): Outputs {
  // Tarifas base 2026 SII — vigentes para cálculo de contribuciones territoriales
  const tarifas: Record<string, number> = {
    residencial: 0.933,      // Casas, departamentos, viviendas
    no_residencial: 1.075,   // Locales, oficinas, bodegas, comercio
    agricola: 0.76           // Sitios rurales, predios agrícolas
  };

  // Sobretasa municipal opcional — fines específicos educación, seguridad, infraestructura
  const sobretasa = i.aplicar_sobretasa ? 0.075 : 0;

  // Tarifa efectiva anual para el tipo de inmueble
  const tarifa_base = tarifas[i.tipo_inmueble] || 0;
  const tarifa_efectiva = tarifa_base + sobretasa;

  // Contribución anual = Avalúo × Tarifa / 100
  const contribucion_anual = (i.avaluo_fiscal * tarifa_efectiva) / 100;

  // División en 4 cuotas iguales — abril, junio, septiembre, noviembre
  const cuota = contribucion_anual / 4;

  // Aporte mensual promedio para presupuestación
  const contribucion_mensual = contribucion_anual / 12;

  return {
    tarifa_anual_efectiva: parseFloat(tarifa_efectiva.toFixed(3)),
    contribucion_anual_total: Math.round(contribucion_anual),
    cuota_primera: Math.round(cuota),
    cuota_segunda: Math.round(cuota),
    cuota_tercera: Math.round(cuota),
    cuota_cuarta: Math.round(contribucion_anual - Math.round(cuota) * 3),
    contribucion_mensual_promedio: Math.round(contribucion_mensual)
  };
}
