/**
 * Impuesto al rodaje de vehículos (Ecuador) — impuesto municipal anual a los
 * vehículos motorizados, según el avalúo registrado en el SRI.
 *
 * Tabla del Art. 539 del COOTAD (Código Orgánico de Organización Territorial,
 * Autonomía y Descentralización): tramos fijos sobre el avalúo del vehículo.
 * El avalúo lo fija el SRI; el cobro lo administra el GAD municipal del cantón
 * donde está matriculado el vehículo.
 *
 * Fuente: COOTAD Art. 538–539 (texto legal, R.O.S. 166, 21-I-2014). Base
 * imponible = avalúo registrado en el SRI. Tabla verificada 2026 contra el
 * texto legal del COOTAD (CPCCS/Lexis Finder) — el tramo $30.001–$40.000 es
 * $50, no $35 (error de transcripción en algunas notas de prensa).
 * El avalúo se consulta en el SRI (https://www.sri.gob.ec/impuestos-vehiculares).
 * Ecuador está dolarizado → moneda USD ("$").
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Tabla Art. 539 COOTAD — tramos sobre el avalúo del vehículo (USD).
// `desde` es el piso del tramo (inclusive). Definir los tramos por su piso
// evita "huecos" entre topes enteros y centavos del avalúo (p. ej. $1.000,50).
// fuente: COOTAD Art. 539 (texto legal, R.O.S. 166, 21-I-2014), verificado 2026
export const TABLA_RODAJE_COOTAD = [
  { desde: 0,        hasta: 1000,     tarifa: 0 },   // exento (avalúo ≤ $1.000)
  { desde: 1000.01,  hasta: 4000,     tarifa: 5 },
  { desde: 4000.01,  hasta: 8000,     tarifa: 10 },
  { desde: 8000.01,  hasta: 12000,    tarifa: 15 },
  { desde: 12000.01, hasta: 16000,    tarifa: 20 },
  { desde: 16000.01, hasta: 20000,    tarifa: 25 },
  { desde: 20000.01, hasta: 30000,    tarifa: 30 },
  { desde: 30000.01, hasta: 40000,    tarifa: 50 },
  { desde: 40000.01, hasta: Infinity, tarifa: 70 },
] as const;

/** Devuelve el tramo del Art. 539 que corresponde a un avalúo dado.
 *  Elige el tramo de mayor `desde` cuyo piso no supere el avalúo, de modo que
 *  cualquier valor (incluidos centavos) caiga siempre en un tramo. */
function tramoRodaje(avaluo: number) {
  let elegido = TABLA_RODAJE_COOTAD[0];
  for (const t of TABLA_RODAJE_COOTAD) {
    if (avaluo >= t.desde) elegido = t;
  }
  return elegido;
}

export interface Inputs {
  avaluo: number;        // avalúo del vehículo registrado en el SRI (USD)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const avaluo = Number(i.avaluo);
  if (!Number.isFinite(avaluo) || avaluo <= 0) {
    throw new Error('Ingresá el avalúo del vehículo registrado en el SRI (mayor a 0)');
  }

  const tramo = tramoRodaje(avaluo);
  const impuesto = tramo.tarifa;
  const exento = impuesto === 0;

  // Rango del tramo en texto legible (el último es "en adelante"). Mostramos el
  // piso redondeado al dólar convencional ($1.001…) en vez de los centavos
  // internos que usamos para evitar huecos entre tramos.
  const desdeTxt = fmtUSDec(Math.ceil(tramo.desde));
  const hastaTxt = tramo.hasta === Infinity ? 'en adelante' : fmtUSDec(tramo.hasta);
  const rangoTxt = `${desdeTxt} – ${hastaTxt}`;

  // Peso del impuesto sobre el avalúo (referencia, no es una tasa real: el
  // impuesto es de monto fijo por tramo, no porcentual).
  const pesoSobreAvaluo = (impuesto / avaluo) * 100;

  const _insight = exento
    ? {
        title: 'Tu vehículo está exento',
        text: `Con un avalúo de **${fmtUSDec(avaluo)}** (tramo ${rangoTxt}), tu vehículo **no paga impuesto al rodaje**: el Art. 539 del COOTAD exime a los vehículos avaluados hasta $1.000. Igual debés matricularlo y pagar los demás rubros (matrícula, SPPAT, impuesto a la propiedad del vehículo, multas).`,
        tone: 'positive',
        icon: '🛣️',
      }
    : {
        title: 'Tu impuesto al rodaje',
        text: `Con un avalúo de **${fmtUSDec(avaluo)}** (tramo ${rangoTxt}), pagás **${fmtUSDec(impuesto)}** de impuesto al rodaje al año, según la tabla fija del Art. 539 del COOTAD. Equivale al **${pesoSobreAvaluo.toFixed(2)}%** del avalúo. Este rubro se suma a la matrícula, el SPPAT y el impuesto a la propiedad del vehículo.`,
        tone: 'neutral',
        icon: '🛣️',
      };

  // Comparación visual del impuesto del vehículo del usuario vs. los topes de
  // la escala (mínimo cobrado y máximo).
  const _chart = {
    type: 'bar',
    segments: [
      { label: 'Tu vehículo', value: impuesto },
      { label: 'Tramo mínimo ($5)', value: 5 },
      { label: 'Tope máximo ($70)', value: 70 },
    ],
    ariaLabel: `Impuesto al rodaje de tu vehículo: ${fmtUSDec(impuesto)}. Mínimo de la escala $5, tope máximo $70.`,
  };

  return {
    impuestoRodaje: fmtUSDec(impuesto),
    tramo: rangoTxt,
    tarifaTramo: fmtUSDec(impuesto),
    exento: exento ? 'Sí (avalúo ≤ $1.000)' : 'No',
    detalle: exento
      ? `Avalúo ${fmtUSDec(avaluo)} → tramo ${rangoTxt}: exento del impuesto al rodaje (Art. 539 COOTAD).`
      : `Avalúo ${fmtUSDec(avaluo)} → tramo ${rangoTxt}: impuesto al rodaje = ${fmtUSDec(impuesto)} al año (Art. 539 COOTAD).`,
    _insight,
    _chart,
  };
}
