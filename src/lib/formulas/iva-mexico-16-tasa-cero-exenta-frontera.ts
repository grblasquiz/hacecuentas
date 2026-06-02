export interface Inputs {
  precio_sin_iva: number;
  tipo_bien: 'general' | 'alimento_basico' | 'medicina' | 'exportacion' | 'servicio_medico' | 'servicio_educativo' | 'otro_exento';
  ubicacion: 'interior' | 'frontera_norte' | 'frontera_sur';
  modo_calculo: 'directo' | 'inverso';
}

export interface Outputs {
  tasa_aplicable: number;
  monto_iva: number;
  precio_con_iva: number;
  precio_sin_iva_resultado: number;
  desglose: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // Tasas IVA México 2026 - SAT
  const tasaGeneral = 0.16;           // 16% - Tasa estándar
  const tasaCero = 0.0;               // 0% - Alimentos, medicinas, exportación
  const tasaFrontera = 0.08;          // 8% - Región fronteriza norte/sur
  const tasaExenta = 0.0;             // Exento - servicios médicos/educativos

  // Determinar tasa aplicable según tipo de bien y ubicación
  let tasaAplicable = tasaGeneral;
  let tipoIVA = 'Tasa general 16%';

  if (i.tipo_bien === 'alimento_basico' || i.tipo_bien === 'medicina' || i.tipo_bien === 'exportacion') {
    tasaAplicable = tasaCero;
    tipoIVA = 'Tasa 0% (alimento básico, medicina o exportación)';
  } else if (i.tipo_bien === 'servicio_medico' || i.tipo_bien === 'servicio_educativo' || i.tipo_bien === 'otro_exento') {
    tasaAplicable = tasaExenta;
    tipoIVA = 'IVA exento (servicios médicos/educativos)';
  } else if (i.tipo_bien === 'general' && (i.ubicacion === 'frontera_norte' || i.ubicacion === 'frontera_sur')) {
    tasaAplicable = tasaFrontera;
    tipoIVA = 'Tasa reducida 8% (región fronteriza)';
  }

  let montoIva = 0;
  let precioConIva = 0;
  let precioSinIvaResultado = 0;

  if (i.modo_calculo === 'directo') {
    // Cálculo directo: precio sin IVA → con IVA
    precioSinIvaResultado = i.precio_sin_iva;
    montoIva = i.precio_sin_iva * tasaAplicable;
    precioConIva = i.precio_sin_iva + montoIva;
  } else {
    // Cálculo inverso: precio con IVA → sin IVA
    // precio_con_iva = precio_sin_iva * (1 + tasa)
    // precio_sin_iva = precio_con_iva / (1 + tasa)
    const multiplicador = 1 + tasaAplicable;
    precioSinIvaResultado = i.precio_sin_iva / multiplicador;
    montoIva = i.precio_sin_iva - precioSinIvaResultado;
    precioConIva = i.precio_sin_iva;
  }

  // Redondeo a 2 decimales para pesos mexicanos
  montoIva = Math.round(montoIva * 100) / 100;
  precioConIva = Math.round(precioConIva * 100) / 100;
  precioSinIvaResultado = Math.round(precioSinIvaResultado * 100) / 100;

  // Desglose descriptivo
  const desglose = `${tipoIVA} | Ubicación: ${i.ubicacion === 'interior' ? 'Interior' : i.ubicacion === 'frontera_norte' ? 'Frontera norte' : 'Frontera sur'} | Tipo bien: ${i.tipo_bien}`;

  const tasaPct = Math.round(tasaAplicable * 10000) / 100;
  const fmtMXN = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const chart = (montoIva > 0 && precioSinIvaResultado > 0) ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Precio sin IVA', value: precioSinIvaResultado },
      { label: `IVA ${tasaPct}%`, value: montoIva },
    ],
    prefix: '$',
    centerValue: fmtMXN(precioConIva),
    centerLabel: 'Precio con IVA',
    ariaLabel: 'Composición del precio: precio sin IVA más IVA',
  } : undefined;

  let insight: any;
  if (precioSinIvaResultado > 0 || precioConIva > 0) {
    if (tasaAplicable === 0) {
      insight = {
        title: 'Sin IVA por pagar',
        text: `Este caso es **${tipoIVA}**: no se cobra IVA, por lo que el precio se mantiene en **${fmtMXN(precioConIva)}**.`,
        tone: 'good' as const,
        icon: '🇲🇽',
      };
    } else {
      insight = {
        title: 'Desglose del IVA',
        text: i.modo_calculo === 'inverso'
          ? `Del precio de **${fmtMXN(precioConIva)}**, **${fmtMXN(montoIva)}** son IVA al **${tasaPct}%** y **${fmtMXN(precioSinIvaResultado)}** es el precio sin IVA${tasaAplicable === 0.08 ? ' (tasa fronteriza reducida)' : ''}.`
          : `Sobre **${fmtMXN(precioSinIvaResultado)}** se suma un IVA del **${tasaPct}%** (${fmtMXN(montoIva)})${tasaAplicable === 0.08 ? ', tasa fronteriza reducida,' : ''} dejando el precio final en **${fmtMXN(precioConIva)}**.`,
        tone: 'neutral' as const,
        icon: '🇲🇽',
      };
    }
  }

  return {
    tasa_aplicable: tasaPct, // En porcentaje
    monto_iva: montoIva,
    precio_con_iva: precioConIva,
    precio_sin_iva_resultado: precioSinIvaResultado,
    desglose: desglose,
    _chart: chart,
    _insight: insight
  };
}
