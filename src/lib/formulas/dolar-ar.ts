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
      blue: 1450,
      bolsa: 1380, // MEP
      contadoconliqui: 1420,
      oficial: 1080,
      tarjeta: 1728,
      cripto: 1440,
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
    tarjeta: 1728,
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

  if (tipo === 'usd_a_ars') {
    return {
      blue: fmt(monto * cot.blue),
      mep: fmt(monto * cot.bolsa),
      ccl: fmt(monto * cot.contadoconliqui),
      oficial: fmt(monto * cot.oficial),
      tarjeta: fmt(monto * cot.tarjeta),
      cripto: fmt(monto * cot.cripto),
    };
  } else {
    return {
      blue: fmtUsd(monto / cot.blue),
      mep: fmtUsd(monto / cot.bolsa),
      ccl: fmtUsd(monto / cot.contadoconliqui),
      oficial: fmtUsd(monto / cot.oficial),
      tarjeta: fmtUsd(monto / cot.tarjeta),
      cripto: fmtUsd(monto / cot.cripto),
    };
  }
}

// Pre-cargar cotizaciones al importar el módulo (client-side)
if (typeof window !== 'undefined') {
  getCotizaciones();
}
