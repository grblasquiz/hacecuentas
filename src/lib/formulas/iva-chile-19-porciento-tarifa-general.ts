export interface Inputs {
  monto_base: number;
  modo: 'neto_a_total' | 'total_a_neto';
  aplica_exencion: 'no' | 'salud' | 'educacion' | 'transporte' | 'exportacion';
}

export interface Outputs {
  monto_iva: number;
  precio_neto: number;
  precio_total: number;
  tasa_iva_aplicada: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constante IVA Chile 2026: 19% uniforme (SII)
  const TASA_IVA = 0.19;
  
  // Determine effective IVA rate based on exemption
  let tasa_efectiva = TASA_IVA;
  if (
    i.aplica_exencion === 'salud' ||
    i.aplica_exencion === 'educacion' ||
    i.aplica_exencion === 'transporte' ||
    i.aplica_exencion === 'exportacion'
  ) {
    tasa_efectiva = 0; // Servicios exentos: 0% IVA
  }
  
  let precio_neto: number;
  let precio_total: number;
  let monto_iva: number;
  
  if (i.modo === 'neto_a_total') {
    // Tenemos precio neto, calculamos total
    precio_neto = i.monto_base;
    monto_iva = precio_neto * tasa_efectiva;
    precio_total = precio_neto + monto_iva;
  } else {
    // Tenemos precio total, extraemos neto
    precio_total = i.monto_base;
    
    if (tasa_efectiva === 0) {
      // Si es exento, el total es el neto
      precio_neto = precio_total;
      monto_iva = 0;
    } else {
      // Fórmula inversa: precio_neto = precio_total / (1 + tasa_iva)
      precio_neto = precio_total / (1 + tasa_efectiva);
      monto_iva = precio_total - precio_neto;
    }
  }
  
  // Redondear a centenas (estándar SII en facturación)
  const redondear = (num: number): number => Math.round(num / 100) * 100;

  const rNeto = redondear(precio_neto);
  const rIva = redondear(monto_iva);
  const rTotal = redondear(precio_total);
  const clp = (n: number) => '$' + Math.round(n).toLocaleString('es-CL', { maximumFractionDigits: 0 });
  const exento = tasa_efectiva === 0;

  let _insight: any;
  if (exento) {
    _insight = {
      title: 'Operación exenta de IVA',
      text: `Por la exención, no se aplica IVA: el precio queda en **${clp(rTotal)}** sin recargo. Aclaralo en la boleta o factura como operación exenta para evitar observaciones del SII.`,
      tone: 'neutral',
      icon: '🧾',
    };
  } else if (i.modo === 'neto_a_total') {
    _insight = {
      title: 'Cuánto IVA agregás al precio',
      text: `Sobre el neto de **${clp(rNeto)}** sumás **${clp(rIva)}** de IVA (19%), así que cobrás **${clp(rTotal)}**. Ese IVA no es tuyo: lo recaudás para enterarlo al SII en el F29.`,
      tone: 'neutral',
      icon: '🧾',
    };
  } else {
    _insight = {
      title: 'Cuánto IVA viene incluido',
      text: `De los **${clp(rTotal)}** que cobrás, **${clp(rIva)}** son IVA y solo **${clp(rNeto)}** es tu ingreso neto. Facturá el neto correcto para no equivocar el débito fiscal.`,
      tone: 'neutral',
      icon: '🧾',
    };
  }

  const out: Outputs = {
    monto_iva: rIva,
    precio_neto: rNeto,
    precio_total: rTotal,
    tasa_iva_aplicada: tasa_efectiva * 100,
    _insight,
  };

  // Donut: el precio total se descompone en neto + IVA (sólo si hay IVA)
  // La porción de IVA se deriva del total para que las dos slices sumen exacto el centro.
  const ivaSlice = rTotal - rNeto;
  if (!exento && ivaSlice > 0 && rNeto > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Neto', value: rNeto },
        { label: 'IVA 19%', value: ivaSlice },
      ],
      prefix: '$',
      centerValue: clp(rTotal),
      centerLabel: 'Total',
      ariaLabel: `Descomposición del precio: neto ${clp(rNeto)} más IVA ${clp(ivaSlice)}, total ${clp(rTotal)}.`,
    };
  }

  return out;
}
