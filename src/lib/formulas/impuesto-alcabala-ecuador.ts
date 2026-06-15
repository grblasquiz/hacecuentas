/**
 * Impuesto de Alcabala (Ecuador) — transferencia de dominio de inmuebles.
 *
 * Base legal: COOTAD (Código Orgánico de Organización Territorial, Autonomía y
 * Descentralización).
 *  - Art. 527: objeto del impuesto (actos de transferencia de dominio de inmuebles).
 *  - Art. 532: base imponible = mayor entre el valor contractual y el avalúo catastral.
 *  - Art. 533: rebajas por reventa del mismo inmueble dentro de 3 años (40% / 30% / 20%)
 *              y permutas (cada parte paga sobre el 75% del valor).
 *  - Art. 534: exenciones (Estado, BCE, IESS, vivienda de interés social, etc.).
 *  - Art. 535: tarifa = 1% sobre la base imponible.
 * Adicional del Consejo Provincial: 10% del impuesto de alcabala municipal
 *   (equivale al 0,10% de la base). Lo recauda la prefectura/consejo provincial.
 * fuente: COOTAD Art. 527/532/533/534/535, https://calendariotributario.org/ec/en-que-consiste-impuesto-alcabala/, 2026
 *
 * Ecuador está dolarizado → todos los montos en USD ("$"), sin conversión.
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// fuente: COOTAD Art. 535, tarifa 1% sobre la base imponible. 2026
const TARIFA_ALCABALA = 0.01;
// fuente: adicional del Consejo Provincial = 10% del impuesto de alcabala municipal. 2026
const ADICIONAL_CONSEJO_PROVINCIAL = 0.10;
// fuente: COOTAD Art. 533, rebajas por reventa del mismo inmueble dentro de 3 años. 2026
const REBAJA_REVENTA: Record<string, number> = {
  ninguna: 0,
  '1': 0.40, // reventa dentro del 1.º año
  '2': 0.30, // reventa dentro del 2.º año
  '3': 0.20, // reventa dentro del 3.º año
};
// fuente: COOTAD Art. 533, permuta → cada parte paga sobre el 75% del valor (rebaja del 25%). 2026
const FACTOR_PERMUTA = 0.75;

export interface Inputs {
  /** Valor de la compraventa pactado en la escritura (USD). */
  valorCompraventa: number;
  /** Avalúo catastral municipal del inmueble (USD). Opcional. */
  avaluoCatastral?: number;
  /** Rebaja por reventa del mismo inmueble (Art. 533): 'ninguna' | '1' | '2' | '3'. */
  rebajaReventa?: string;
  /** ¿La operación es una permuta? (cada parte tributa sobre el 75% del valor). */
  esPermuta?: boolean;
  /** ¿Incluir el adicional del Consejo Provincial (10% de la alcabala)? */
  incluirAdicionalProvincial?: boolean;
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorCompraventa) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor de la compraventa del inmueble');

  // Avalúo catastral: si no se ingresa, se asume igual al valor de compraventa.
  const avaluoRaw = i.avaluoCatastral;
  const avaluo = (avaluoRaw === undefined || avaluoRaw === null || avaluoRaw === ('' as any))
    ? valor
    : Number(avaluoRaw) || 0;

  // Base imponible (Art. 532): el MAYOR entre el valor contractual y el avalúo catastral.
  let baseImponible = Math.max(valor, avaluo);

  // Permuta (Art. 533): cada parte tributa sobre el 75% del valor del inmueble.
  const esPermuta = !!i.esPermuta;
  if (esPermuta) baseImponible = baseImponible * FACTOR_PERMUTA;

  // Impuesto bruto antes de rebaja por reventa.
  const alcabalaBruta = baseImponible * TARIFA_ALCABALA;

  // Rebaja por reventa del mismo inmueble dentro de 3 años (Art. 533).
  const claveRebaja = i.rebajaReventa && i.rebajaReventa in REBAJA_REVENTA ? i.rebajaReventa : 'ninguna';
  const pctRebaja = REBAJA_REVENTA[claveRebaja];
  const montoRebaja = alcabalaBruta * pctRebaja;
  const alcabala = alcabalaBruta - montoRebaja;

  // Adicional del Consejo Provincial (10% de la alcabala municipal).
  const incluirAdicional = i.incluirAdicionalProvincial !== false; // default: incluir
  const adicionalProvincial = incluirAdicional ? alcabala * ADICIONAL_CONSEJO_PROVINCIAL : 0;

  const total = alcabala + adicionalProvincial;

  // Texto de la base imponible para el detalle.
  const usaAvaluo = avaluo > valor;
  const detalleBase = usaAvaluo
    ? `avalúo catastral ${fmtUSDec(avaluo)} (mayor que el valor de venta)`
    : `valor de venta ${fmtUSDec(valor)}`;

  const partes: string[] = [];
  partes.push(`Base imponible: ${detalleBase}${esPermuta ? ' · permuta → ×75%' : ''} = ${fmtUSDec(baseImponible)}.`);
  partes.push(`Alcabala (1%): ${fmtUSDec(alcabalaBruta)}.`);
  if (pctRebaja > 0) partes.push(`Rebaja por reventa (Art. 533, ${Math.round(pctRebaja * 100)}%): −${fmtUSDec(montoRebaja)} → ${fmtUSDec(alcabala)}.`);
  if (incluirAdicional) partes.push(`Adicional Consejo Provincial (10%): ${fmtUSDec(adicionalProvincial)}.`);

  const _insight = {
    title: 'Lo que paga el comprador',
    text: `Sobre una base de **${fmtUSDec(baseImponible)}**, el impuesto de alcabala (1%, COOTAD Art. 535) es **${fmtUSDec(alcabala)}**${incluirAdicional ? ` y el adicional del Consejo Provincial (10%) suma **${fmtUSDec(adicionalProvincial)}**` : ''}. El total a pagar al transferir el dominio es **${fmtUSDec(total)}**. Lo paga el comprador (sujeto pasivo) en el municipio donde está el inmueble.`,
    tone: 'neutral',
    icon: '📜',
  };

  const segments = [
    { label: 'Alcabala municipal (1%)', value: Math.round(alcabala * 100) / 100 },
  ];
  if (incluirAdicional) segments.push({ label: 'Adicional Consejo Provincial (10%)', value: Math.round(adicionalProvincial * 100) / 100 });

  const _chart = {
    type: 'donut',
    segments,
    ariaLabel: `Alcabala ${fmtUSDec(alcabala)}${incluirAdicional ? ` y adicional provincial ${fmtUSDec(adicionalProvincial)}` : ''}. Total ${fmtUSDec(total)}.`,
  };

  return {
    total: fmtUSDec(total),
    baseImponible: fmtUSDec(baseImponible),
    alcabala: fmtUSDec(alcabala),
    adicionalProvincial: incluirAdicional ? fmtUSDec(adicionalProvincial) : '$0,00 (no incluido)',
    rebajaAplicada: pctRebaja > 0 ? `${Math.round(pctRebaja * 100)}% (−${fmtUSDec(montoRebaja)})` : 'Sin rebaja',
    detalle: partes.join(' '),
    _insight,
    _chart,
  };
}
