export interface Inputs {
  precio_sin_iva: number;
  tarifa_iva: 0 | 5 | 19;
  es_autorretenedor: boolean;
  modo_inverso: boolean;
}

export interface Outputs {
  iva_calculado: number;
  precio_total: number;
  precio_sin_iva_inverso: number | null;
  retencion_iva: number;
  neto_a_pagar: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Fuente: DIAN - Tarifas IVA 2026
  const TARIFA_GENERAL = 19;
  const TARIFA_REDUCIDA = 5;
  const TARIFA_CERO = 0;
  const RETENCION_IVA_AUTORRETENEDOR = 1.0; // 100%

  let iva_calculado = 0;
  let precio_total = 0;
  let precio_sin_iva_inverso: number | null = null;
  let retencion_iva = 0;
  let neto_a_pagar = 0;

  if (i.modo_inverso) {
    // Modo inverso: usuario ingresa precio CON IVA, calculamos base
    // Formula: Base = Total / (1 + Tarifa/100)
    const divisor = 1 + i.tarifa_iva / 100;
    precio_sin_iva_inverso = i.precio_sin_iva / divisor;
    iva_calculado = i.precio_sin_iva - precio_sin_iva_inverso;
    precio_total = i.precio_sin_iva; // El input ya es el total
  } else {
    // Modo normal: usuario ingresa precio SIN IVA
    // Formula: IVA = Base × (Tarifa / 100)
    iva_calculado = i.precio_sin_iva * (i.tarifa_iva / 100);
    precio_total = i.precio_sin_iva + iva_calculado;
  }

  // Retención en la fuente para autorretenedores
  if (i.es_autorretenedor) {
    retencion_iva = iva_calculado * RETENCION_IVA_AUTORRETENEDOR;
    // Neto a pagar = Precio total - Retención
    neto_a_pagar = precio_total - retencion_iva;
  } else {
    retencion_iva = 0;
    neto_a_pagar = precio_total;
  }

  const r2 = (n: number) => Math.round(n * 100) / 100;
  const rIva = r2(iva_calculado);
  const rTotal = r2(precio_total);
  const rBaseInv = precio_sin_iva_inverso ? r2(precio_sin_iva_inverso) : null;
  const rRet = r2(retencion_iva);
  const rNeto = r2(neto_a_pagar);

  // Base imponible según el modo
  const baseImponible = i.modo_inverso ? (rBaseInv ?? 0) : r2(i.precio_sin_iva);
  const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  const hayIva = rIva > 0;

  let _insight: any;
  if (!hayIva) {
    _insight = {
      title: 'Operación a tarifa 0%',
      text: `A tarifa **0%** no se suma IVA: el precio queda en **${cop(rTotal)}**. Recordá que un bien a 0% (exento) sí da derecho a descontar el IVA de tus insumos, a diferencia de uno excluido.`,
      tone: 'neutral',
      icon: '🧾',
    };
  } else if (i.es_autorretenedor) {
    _insight = {
      title: 'IVA y autorretención',
      text: `El IVA es **${cop(rIva)}** (tarifa ${i.tarifa_iva}%), pero como **autorretenedor** retenés el 100% (${cop(rRet)}): el neto a pagar baja a **${cop(rNeto)}**. Ese IVA retenido lo declarás y enterás vos a la DIAN.`,
      tone: 'warn',
      icon: '🧾',
    };
  } else if (i.modo_inverso) {
    _insight = {
      title: 'Cuánto IVA viene incluido',
      text: `De los **${cop(rTotal)}** con IVA, la base real es **${cop(baseImponible)}** y **${cop(rIva)}** corresponden al IVA (${i.tarifa_iva}%). Facturá esa base para no inflar tu ingreso gravable.`,
      tone: 'neutral',
      icon: '🧾',
    };
  } else {
    _insight = {
      title: 'Cuánto IVA agregás al precio',
      text: `Sobre la base de **${cop(baseImponible)}** sumás **${cop(rIva)}** de IVA (${i.tarifa_iva}%), así que cobrás **${cop(rTotal)}**. Ese IVA lo recaudás para la DIAN: no es ingreso tuyo.`,
      tone: 'neutral',
      icon: '🧾',
    };
  }

  const out: Outputs = {
    iva_calculado: rIva,
    precio_total: rTotal,
    precio_sin_iva_inverso: rBaseInv,
    retencion_iva: rRet,
    neto_a_pagar: rNeto,
    _insight,
  };

  // Donut: el precio total se descompone en base + IVA (sólo si hay IVA)
  const ivaSlice = r2(rTotal - baseImponible);
  if (hayIva && baseImponible > 0 && ivaSlice > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Base', value: baseImponible },
        { label: `IVA ${i.tarifa_iva}%`, value: ivaSlice },
      ],
      prefix: '$',
      centerValue: cop(rTotal),
      centerLabel: 'Total',
      ariaLabel: `Descomposición del precio: base ${cop(baseImponible)} más IVA ${cop(ivaSlice)}, total ${cop(rTotal)}.`,
    };
  }

  return out;
}
