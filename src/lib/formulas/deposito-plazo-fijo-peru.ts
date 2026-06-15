/**
 * Calculadora de depósito a plazo fijo — PERÚ 2026.
 *
 * El rendimiento de un depósito a plazo fijo en Perú se publica como TREA
 * (Tasa de Rendimiento Efectivo Anual): la SBS la define como el rendimiento
 * NETO anualizado a 360 días (intereses menos los costos/comisiones del producto).
 * Es el número obligatorio en depósitos y permite comparar entidades de forma justa.
 *   - Fuente TREA: SBS (Res. SBS N° 3274-2017) / Scotiabank Perú "¿Qué es la TREA?", https://www.scotiabank.com.pe/blog/que-es-trea-como-calcularla, 2026
 *
 * Fórmula (capitalización efectiva, base 360 días — convención peruana):
 *   factor       = (1 + TREA)^(plazoDias / 360)
 *   montoFinal   = capital × factor
 *   interes      = montoFinal − capital
 *
 * Cobertura del Fondo de Seguro de Depósitos (FSD): protege depósitos de ahorro,
 * a plazo y CTS hasta un Monto Máximo de Cobertura (MMC) por persona y por entidad.
 *   - MMC jun–ago 2026: S/ 122 000 (se actualiza cada trimestre según el IPM).
 *   - Fuente: FSD, https://fsd.org.pe/cobertura/, 2026
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Monto Máximo de Cobertura del FSD — trimestre junio–agosto 2026.
// Se reajusta cada trimestre por el Índice de Precios al por Mayor (IPM).
// fuente: FSD, https://fsd.org.pe/cobertura/, 2026
const FSD_COBERTURA_MAXIMA = 122000;

// IGV (18%) sobre el interés ganado — los depósitos a plazo de personas naturales
// NO pagan impuesto a la renta ni IGV sobre los intereses; el rendimiento es libre.
// (Solo se modela informativamente; no se descuenta del rendimiento.)

export interface Inputs {
  capital: number;       // monto a depositar (S/)
  trea: number;          // Tasa de Rendimiento Efectivo Anual en % (ej. 5.5)
  plazoDias: number;     // plazo del depósito en días (ej. 90, 180, 360, 720)
}

export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const capital = Number(i.capital) || 0;
  const trea = Number(i.trea) || 0;
  const plazoDias = Number(i.plazoDias) || 0;

  if (capital <= 0) throw new Error('Ingresá el monto a depositar (S/)');
  if (trea <= 0) throw new Error('Ingresá la TREA del depósito (% anual)');
  if (plazoDias < 1) throw new Error('Ingresá el plazo del depósito en días (mínimo 1)');

  const treaDecimal = trea / 100;

  // Capitalización efectiva sobre base 360 días (convención SBS/peruana).
  const factor = Math.pow(1 + treaDecimal, plazoDias / 360);
  const montoFinal = capital * factor;
  const interesGanado = montoFinal - capital;
  const rendimientoPeriodo = (interesGanado / capital) * 100; // % del período
  const interesMensualEq = interesGanado / (plazoDias / 30);   // interés promedio por mes

  // Cobertura del FSD: hasta el MMC por persona y por entidad.
  const cubiertoPorFSD = Math.min(montoFinal, FSD_COBERTURA_MAXIMA);
  const excedeFSD = montoFinal > FSD_COBERTURA_MAXIMA;
  const montoSobrecubierto = excedeFSD ? montoFinal - FSD_COBERTURA_MAXIMA : 0;

  // Insight según si el monto final queda dentro o fuera de la cobertura del FSD.
  const _insight = excedeFSD
    ? {
        title: 'Tu depósito supera la cobertura del FSD',
        text: `A una TREA de **${trea}%** por **${plazoDias} días**, tus **${fmtPEN(capital)}** se convierten en **${fmtPEN(montoFinal)}** (ganás **${fmtPEN(interesGanado)}**). Pero el monto final supera el tope del **Fondo de Seguro de Depósitos (S/ 122 000 por persona y por entidad)**: **${fmtPEN(montoSobrecubierto)}** quedarían sin cobertura. Conviene **repartir el ahorro en varias entidades** para que todo quede asegurado.`,
        tone: 'warn',
        icon: '🛡️',
      }
    : {
        title: 'Qué ganás con este plazo fijo',
        text: `A una TREA de **${trea}%** por **${plazoDias} días**, tus **${fmtPEN(capital)}** se convierten en **${fmtPEN(montoFinal)}**: ganás **${fmtPEN(interesGanado)}** de interés (**${rendimientoPeriodo.toFixed(2)}%** del período). El depósito está **100% cubierto por el Fondo de Seguro de Depósitos** (tope S/ 122 000 por persona y entidad).`,
        tone: 'good',
        icon: '🐖',
      };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Capital depositado', value: Math.round(capital) },
      { label: 'Interés ganado', value: Math.round(interesGanado) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(montoFinal),
    centerLabel: 'Monto final',
    ariaLabel: `Monto final de ${fmtPEN(montoFinal)}: capital de ${fmtPEN(capital)} más interés ganado de ${fmtPEN(interesGanado)} en ${plazoDias} días con TREA ${trea}%.`,
  };

  return {
    montoFinal: fmtPEN(montoFinal),
    interesGanado: fmtPEN(interesGanado),
    rendimientoPeriodo: rendimientoPeriodo.toFixed(2) + '% del período',
    interesMensualEq: fmtPEN(interesMensualEq) + '/mes (promedio)',
    cubiertoPorFSD: fmtPEN(cubiertoPorFSD),
    coberturaFSD: excedeFSD
      ? `⚠️ ${fmtPEN(montoSobrecubierto)} sobre el tope de ${fmtPEN(FSD_COBERTURA_MAXIMA)} quedan sin cobertura`
      : `✅ 100% cubierto (tope ${fmtPEN(FSD_COBERTURA_MAXIMA)} por persona y entidad)`,
    detalle: `Capital ${fmtPEN(capital)} a TREA ${trea}% por ${plazoDias} días → monto final ${fmtPEN(montoFinal)} (interés ${fmtPEN(interesGanado)}).`,
    _insight,
    _chart,
  };
}
