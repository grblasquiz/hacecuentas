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
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).aplicar_sobretasa = (i as any).aplicar_sobretasa === true || (i as any).aplicar_sobretasa === 'true';
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

  const total_redondeado = Math.round(contribucion_anual);
  const c1 = Math.round(cuota);
  const c2 = Math.round(cuota);
  const c3 = Math.round(cuota);
  const c4 = Math.round(contribucion_anual - Math.round(cuota) * 3);
  const mensual = Math.round(contribucion_mensual);

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const nombreTipo = i.tipo_inmueble === 'residencial' ? 'residencial'
    : i.tipo_inmueble === 'no_residencial' ? 'no residencial (comercial)' : 'agrícola';

  const _insight = {
    title: 'Tu contribución territorial 2026',
    text: `Pagás **${fmt(total_redondeado)}** al año por tu inmueble ${nombreTipo} `
      + `(tarifa **${tarifa_efectiva.toFixed(3)}%** sobre el avalúo fiscal), `
      + `repartidos en **4 cuotas** de ~${fmt(c1)} (abril, junio, septiembre y noviembre). `
      + `Eso equivale a unos **${fmt(mensual)}** por mes que conviene reservar.`
      + (i.aplicar_sobretasa ? ' Incluye la **sobretasa municipal** del 0,075%.' : ''),
    tone: 'neutral',
    icon: '🏠'
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Cuota 1 (abril)', value: c1 },
      { label: 'Cuota 2 (junio)', value: c2 },
      { label: 'Cuota 3 (septiembre)', value: c3 },
      { label: 'Cuota 4 (noviembre)', value: c4 }
    ],
    prefix: '$',
    centerValue: fmt(total_redondeado),
    centerLabel: 'Total anual',
    ariaLabel: `Contribución anual de ${fmt(total_redondeado)} dividida en 4 cuotas trimestrales de aproximadamente ${fmt(c1)} cada una.`
  };

  return {
    tarifa_anual_efectiva: parseFloat(tarifa_efectiva.toFixed(3)),
    contribucion_anual_total: total_redondeado,
    cuota_primera: c1,
    cuota_segunda: c2,
    cuota_tercera: c3,
    cuota_cuarta: c4,
    contribucion_mensual_promedio: mensual,
    _insight,
    _chart
  };
}
