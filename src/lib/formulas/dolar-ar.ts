/**
 * Calculadora de dólar Argentina
 * Convierte USD → ARS según cotización (blue, MEP, CCL, oficial, tarjeta)
 *
 * Nota: las cotizaciones se cargan client-side desde /api/dolar
 * o desde dolarapi.com (proxy en Cloudflare Worker recomendado)
 */

export interface DolarInputs {
  monto: number;
  tipo: string; // usd_a_ars | ars_a_usd
}

export interface DolarOutputs {
  blue: string;
  mep: string;
  ccl: string;
  oficial: string;
  tarjeta: string;
  cripto: string;
  _insight?: any;
}

// Cache de cotizaciones (se llena al cargar la página)
let cotizacionesCache: Record<string, number> | null = null;

async function getCotizaciones(): Promise<Record<string, number>> {
  if (cotizacionesCache) return cotizacionesCache;
  try {
    const res = await fetch('https://dolarapi.com/v1/dolares');
    const data = await res.json();
    const map: Record<string, number> = {};
    data.forEach((d: any) => {
      map[d.casa] = d.venta;
    });
    cotizacionesCache = map;
    return map;
  } catch {
    // Fallback con valores estimados si falla la API
    return {
      blue: 1540,
      bolsa: 1529, // MEP
      contadoconliqui: 1587,
      oficial: 1515,
      tarjeta: 1970, // oficial × 1,30: percepción 30% que subsiste sólo para turismo/transporte en pesos (PAÍS derogado; percepción sobre consumo directo eliminada 02/01/2026)
      cripto: 1581,
    };
  }
}

export function dolarAR(inputs: DolarInputs): DolarOutputs {
  const monto = Number(inputs.monto) || 0;
  const tipo = (inputs.tipo as string) || 'usd_a_ars';

  // Como la fórmula es sync, leemos del cache (se pobló al cargar página)
  const cot = cotizacionesCache || {
    blue: 1450,
    bolsa: 1380,
    contadoconliqui: 1420,
    oficial: 1080,
    tarjeta: 1404, // oficial × 1,30 (tarjeta turismo en pesos); consumo directo se liquida al oficial
    cripto: 1440,
  };

  const fmt = (value: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0,
    }).format(value);
  };

  const fmtUsd = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Brecha blue/oficial y premium tarjeta sobre la cotización cargada
  const brechaBlue = cot.oficial > 0 ? (cot.blue / cot.oficial - 1) * 100 : 0;

  if (tipo === 'usd_a_ars') {
    const difBlueOficial = monto * (cot.blue - cot.oficial);
    const _insight = {
      title: 'Cuánto cambia según el dólar',
      text: monto > 0
        ? `Tus **US$ ${monto.toLocaleString('es-AR')}** valen **${fmt(monto * cot.oficial)}** al oficial pero **${fmt(monto * cot.blue)}** al blue: **${fmt(difBlueOficial)}** de diferencia (brecha **${brechaBlue.toFixed(0)}%**). Con tarjeta saltan a ${fmt(monto * cot.tarjeta)}.`
        : `El blue está **${brechaBlue.toFixed(0)}%** sobre el oficial. El dólar tarjeta es el más caro de todos.`,
      tone: brechaBlue >= 30 ? 'warn' : 'neutral',
      icon: '💵',
    };
    return {
      blue: fmt(monto * cot.blue),
      mep: fmt(monto * cot.bolsa),
      ccl: fmt(monto * cot.contadoconliqui),
      oficial: fmt(monto * cot.oficial),
      tarjeta: fmt(monto * cot.tarjeta),
      cripto: fmt(monto * cot.cripto),
      _insight,
    };
  } else {
    const usdOficial = monto / cot.oficial;
    const usdBlue = monto / cot.blue;
    const _insight = {
      title: 'Cuántos dólares te llevás',
      text: monto > 0
        ? `Con **${fmt(monto)}** comprás **US$ ${usdOficial.toFixed(2)}** al oficial, pero solo **US$ ${usdBlue.toFixed(2)}** al blue: te quedan **US$ ${(usdOficial - usdBlue).toFixed(2)}** menos por la brecha del **${brechaBlue.toFixed(0)}%**.`
        : `Por la brecha del **${brechaBlue.toFixed(0)}%**, el mismo monto en pesos rinde bastante menos en dólares al blue que al oficial.`,
      tone: brechaBlue >= 30 ? 'warn' : 'neutral',
      icon: '💵',
    };
    return {
      blue: fmtUsd(monto / cot.blue),
      mep: fmtUsd(monto / cot.bolsa),
      ccl: fmtUsd(monto / cot.contadoconliqui),
      oficial: fmtUsd(monto / cot.oficial),
      tarjeta: fmtUsd(monto / cot.tarjeta),
      cripto: fmtUsd(monto / cot.cripto),
      _insight,
    };
  }
}

// Pre-cargar cotizaciones al importar el módulo (client-side)
if (typeof window !== 'undefined') {
  getCotizaciones();
}
