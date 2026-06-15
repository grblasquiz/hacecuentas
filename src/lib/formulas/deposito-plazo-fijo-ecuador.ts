/**
 * Calculadora de depósito a plazo fijo (póliza de acumulación) — ECUADOR 2026.
 *
 * Ecuador está dolarizado: todos los montos se expresan en dólares estadounidenses (USD, "$").
 * El rendimiento de una póliza/depósito a plazo fijo se calcula con la TASA EFECTIVA ANUAL
 * pactada, capitalizando sobre base 360 días (convención financiera ecuatoriana).
 *
 *   factor      = (1 + tasa)^(plazoDias / 360)
 *   montoFinal  = capital × factor
 *   interesBruto = montoFinal − capital
 *
 * Tasas pasivas referenciales (Banco Central del Ecuador, junio 2026):
 *   - Referencial efectiva promedio: 5,29%
 *   - 30-60 días: 4,31% · 61-90: 4,58% · 91-120: 4,71% · 121-180: 4,73% · 181-360: 5,36% · 360+: 6,45%
 *   - Promedio que pagan: bancos privados ~5,01% vs cooperativas ~6,92%
 *   fuente: Banco Central del Ecuador (Tasa Pasiva Referencial) / El Universo / Expreso, junio 2026
 *     https://contenido.bce.fin.ec/documentos/informacioneconomica/indicadores/monetario/indTasaPasiva.html
 *
 * Retención en la fuente sobre rendimientos financieros: desde el 1-mar-2026 el SRI aplica una
 * retención del 3% (antes 2%) sobre los intereses pagados por instituciones financieras a
 * personas naturales (Resol. NAC-DGERCGC26-00000009, publicada 27-feb-2026). La entidad la
 * retiene y declara; el inversor la usa como crédito tributario en su impuesto a la renta.
 *
 * IMPORTANTE — exoneración por plazo (LRTI Art. 9 num. 15.1): los rendimientos de depósitos a
 * plazo fijo / pólizas emitidos a 180 días calendario o más y mantenidos ≥180 días están
 * EXONERADOS del impuesto a la renta y, por tanto, NO sufren retención en la fuente. La
 * retención del 3% sólo recae sobre depósitos a menos de 180 días.
 *   fuente: SRI (Resol. NAC-DGERCGC26-00000009) y LRTI Art. 9 num. 15.1, 2026
 *     https://www.sri.gob.ec/retenciones-en-la-fuente
 *
 * Seguro de depósitos (COSEDE): cubre cuentas de ahorro, corriente y pólizas a plazo fijo
 * hasta USD 32.000 por depositante y por entidad en bancos privados/públicos, mutualistas y
 * cooperativas del segmento 1 (montos menores en cooperativas de segmentos 2-5). NO cubre los
 * intereses devengados.
 *   fuente: COSEDE — Conoce tu monto de cobertura, 2026
 *     https://www.cosede.gob.ec/conoce-tu-monto-de-cobertura/
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

// Cobertura máxima del seguro de depósitos COSEDE — bancos/mutualistas y cooperativas seg. 1.
// fuente: COSEDE, https://www.cosede.gob.ec/conoce-tu-monto-de-cobertura/, 2026
const COSEDE_COBERTURA_MAXIMA = 32000;

// Retención en la fuente sobre rendimientos financieros (personas naturales).
// Desde 1-mar-2026: 3% (Resol. NAC-DGERCGC26-00000009, antes 2%).
// fuente: SRI, https://www.sri.gob.ec/retenciones-en-la-fuente, 2026
const RETENCION_RENDIMIENTOS_DEFAULT = 3; // %

// Plazo mínimo (días calendario) para la exoneración del IR sobre rendimientos financieros.
// Depósitos/pólizas a 180 días o más → rendimientos exentos → 0 retención (LRTI Art. 9 num. 15.1).
const PLAZO_EXONERACION_DIAS = 180;

export interface Inputs {
  capital: number;        // monto a depositar / invertir (USD)
  tasaEfectiva: number;   // tasa efectiva anual en % (ej. 6.45)
  plazoDias: number;      // plazo del depósito en días (ej. 90, 180, 360, 720)
  retencion?: number;     // % de retención en la fuente sobre el interés (default 2%)
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const tasaEfectiva = Number(i.tasaEfectiva) || 0;
  const plazoDias = Number(i.plazoDias) || 0;
  // El campo numérico opcional llega como '' desde el form → tratar ''/null/undefined como default.
  const retencionRaw = i.retencion;
  const retencion =
    retencionRaw === '' || retencionRaw === null || retencionRaw === undefined || !Number.isFinite(Number(retencionRaw))
      ? RETENCION_RENDIMIENTOS_DEFAULT
      : Number(retencionRaw);

  if (capital <= 0) throw new Error('Ingresá el monto a depositar (USD)');
  if (tasaEfectiva <= 0) throw new Error('Ingresá la tasa efectiva anual del depósito (%)');
  if (plazoDias < 1) throw new Error('Ingresá el plazo del depósito en días (mínimo 1)');

  const tasaDecimal = tasaEfectiva / 100;
  // Exoneración por plazo: depósitos/pólizas a ≥180 días → rendimientos exentos del IR → 0 retención.
  const exoneradoPorPlazo = plazoDias >= PLAZO_EXONERACION_DIAS;
  const retencionAplicada = exoneradoPorPlazo ? 0 : Math.max(0, retencion);
  const retDecimal = retencionAplicada / 100;

  // Capitalización efectiva sobre base 360 días (convención financiera ecuatoriana).
  const factor = Math.pow(1 + tasaDecimal, plazoDias / 360);
  const montoFinal = capital * factor;
  const interesBruto = montoFinal - capital;
  const retencionMonto = interesBruto * retDecimal;          // retención en la fuente sobre el interés (sólo <180 días)
  const interesNeto = interesBruto - retencionMonto;
  const totalRecibido = capital + interesNeto;               // capital + interés neto al vencimiento
  const rendimientoPeriodo = (interesNeto / capital) * 100;  // % neto del período
  const interesMensualEq = interesNeto / (plazoDias / 30);   // interés neto promedio por mes

  // Cobertura del seguro de depósitos COSEDE (sobre el capital depositado, sin intereses).
  const cubiertoPorCOSEDE = Math.min(capital, COSEDE_COBERTURA_MAXIMA);
  const excedeCOSEDE = capital > COSEDE_COBERTURA_MAXIMA;
  const montoSobrecubierto = excedeCOSEDE ? capital - COSEDE_COBERTURA_MAXIMA : 0;

  // Descripción del tratamiento fiscal del rendimiento según el plazo.
  const fraseFiscal = exoneradoPorPlazo
    ? `Al ser un plazo de **${plazoDias} días (≥180)**, el rendimiento está **exonerado del impuesto a la renta** (LRTI Art. 9 num. 15.1): **no hay retención en la fuente**`
    : `Al ser un plazo de **${plazoDias} días (menos de 180)**, el rendimiento **no está exonerado** y sufre la **retención en la fuente del ${retencionAplicada}%** (${fmtUSDec(retencionMonto)})`;

  const _insight = excedeCOSEDE
    ? {
        title: 'Tu capital supera la cobertura del seguro de depósitos',
        text: `A una tasa efectiva de **${tasaEfectiva}%** por **${plazoDias} días**, tus **${fmtUSDec(capital)}** rinden **${fmtUSDec(interesNeto)}** netos y al vencimiento recibís **${fmtUSDec(totalRecibido)}**. ${fraseFiscal}. Pero tu capital supera el tope del **seguro de depósitos COSEDE (${fmtUSDec(COSEDE_COBERTURA_MAXIMA)} por persona y por entidad)**: **${fmtUSDec(montoSobrecubierto)}** quedarían sin cobertura. Conviene **repartir el ahorro en varias entidades** para asegurarlo todo.`,
        tone: 'warn',
        icon: '🛡️',
      }
    : {
        title: 'Qué ganás con esta póliza a plazo fijo',
        text: `A una tasa efectiva de **${tasaEfectiva}%** por **${plazoDias} días**, tus **${fmtUSDec(capital)}** ganan **${fmtUSDec(interesNeto)}** netos (${fmtUSDec(interesBruto)} brutos − ${fmtUSDec(retencionMonto)} de retención). ${fraseFiscal}. Al vencimiento recibís **${fmtUSDec(totalRecibido)}**: un **${rendimientoPeriodo.toFixed(2)}%** del período. Tu capital está **100% cubierto por el seguro de depósitos COSEDE** (tope ${fmtUSDec(COSEDE_COBERTURA_MAXIMA)} por persona y entidad).`,
        tone: 'good',
        icon: '🐖',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital depositado', value: Math.round(capital * 100) / 100 },
      { label: 'Interés neto ganado', value: Math.round(interesNeto * 100) / 100 },
    ].filter((s) => s.value > 0),
    prefix: '$',
    centerValue: fmtUSDec(totalRecibido),
    centerLabel: 'Total al vencimiento',
    ariaLabel: `Total al vencimiento de ${fmtUSDec(totalRecibido)}: capital de ${fmtUSDec(capital)} más interés neto de ${fmtUSDec(interesNeto)} en ${plazoDias} días con tasa efectiva ${tasaEfectiva}%.`,
  };

  return {
    totalRecibido: fmtUSDec(totalRecibido),
    interesBruto: fmtUSDec(interesBruto),
    retencionFuente: exoneradoPorPlazo
      ? `$0,00 — exonerado por plazo ≥180 días (LRTI Art. 9 num. 15.1)`
      : fmtUSDec(retencionMonto) + ` (${retencionAplicada}% sobre el interés, plazo <180 días)`,
    interesNeto: fmtUSDec(interesNeto),
    montoFinalBruto: fmtUSDec(montoFinal),
    rendimientoPeriodo: rendimientoPeriodo.toFixed(2) + '% neto del período',
    interesMensualEq: fmtUSDec(interesMensualEq) + '/mes (promedio)',
    coberturaCOSEDE: excedeCOSEDE
      ? `⚠️ ${fmtUSDec(montoSobrecubierto)} sobre el tope de ${fmtUSDec(COSEDE_COBERTURA_MAXIMA)} quedan sin cobertura`
      : `✅ Capital 100% cubierto (tope ${fmtUSDec(COSEDE_COBERTURA_MAXIMA)} por persona y entidad)`,
    cubiertoPorCOSEDE: fmtUSDec(cubiertoPorCOSEDE),
    detalle: exoneradoPorPlazo
      ? `Capital ${fmtUSDec(capital)} a tasa efectiva ${tasaEfectiva}% por ${plazoDias} días → interés bruto ${fmtUSDec(interesBruto)}. Plazo ≥180 días: rendimiento exonerado del IR, sin retención. Interés neto ${fmtUSDec(interesNeto)}. Total a recibir: ${fmtUSDec(totalRecibido)}.`
      : `Capital ${fmtUSDec(capital)} a tasa efectiva ${tasaEfectiva}% por ${plazoDias} días → interés bruto ${fmtUSDec(interesBruto)} − retención ${fmtUSDec(retencionMonto)} (${retencionAplicada}%, plazo <180 días) = interés neto ${fmtUSDec(interesNeto)}. Total a recibir: ${fmtUSDec(totalRecibido)}.`,
    _insight,
    _chart,
  };
}
