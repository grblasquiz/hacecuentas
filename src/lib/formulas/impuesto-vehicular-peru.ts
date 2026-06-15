/**
 * Impuesto al Patrimonio Vehicular — Perú.
 * Grava la propiedad de autos, camionetas, station wagons, camiones, buses, ómnibus y
 * tracto camiones con antigüedad no mayor a 3 años desde su primera inscripción registral.
 *
 * Reglas (TUO Ley de Tributación Municipal, DS 156-2004-EF, arts. 30-37):
 *  - Tasa: 1% de la base imponible.
 *  - Base imponible: valor de adquisición/importación/ingreso al patrimonio, que en ningún caso
 *    puede ser menor a la Tabla de Valores Referenciales que aprueba anualmente el MEF.
 *    Para 2026: RM 008-2026-EF/15 (15-ene-2026).
 *  - Monto mínimo: no puede ser inferior al 1,5% de la UIT vigente al 1° de enero.
 *    UIT 2026 = S/ 5.500 (DS 301-2025-EF) → mínimo S/ 82,50.
 *  - Se paga durante 3 años, contados desde el año siguiente a la primera inscripción.
 *  - Lo administra el SAT (o la municipalidad provincial). Vence el último día hábil de febrero;
 *    fraccionable en 4 cuotas trimestrales (feb/may/ago/nov).
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// 1,5% de la UIT — piso del impuesto. Fuente: art. 33 TUO Ley Trib. Municipal (DS 156-2004-EF).
const TASA_IMPUESTO = 0.01;            // 1% de la base imponible
const PISO_UIT = 0.015;                // 1,5% de la UIT como monto mínimo
const ANTIGUEDAD_MAX = 3;              // años: el impuesto se paga 3 años

export interface Inputs {
  valorVehiculo: number;     // valor de adquisición o de tabla referencial MEF, lo mayor (S/)
  anioInscripcion?: number;  // año de la primera inscripción en Registro de Propiedad Vehicular
  fraccionado?: string;      // 'si' = ver cuota trimestral (4 cuotas); 'no' = al contado
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const valor = Number(i.valorVehiculo) || 0;
  if (valor <= 0) throw new Error('Ingresá el valor del vehículo (de adquisición o de la tabla referencial del MEF)');

  const uit = PERU_2026.uit;                     // S/ 5.500 (2026)
  const anioActual = PERU_2026.anio;             // 2026
  const montoMinimo = uit * PISO_UIT;            // 1,5% UIT = S/ 82,50

  // Antigüedad: opcional. Si la dan, validamos si el vehículo todavía paga el impuesto.
  const anioInsc = Number(i.anioInscripcion) || 0;
  let aniosDesdeInscripcion: number | null = null;
  let afecto = true;       // por defecto asumimos que está afecto (el usuario ya quiere calcular)
  let aniosRestantes: number | null = null;
  let recienInscripto = false; // inscripto en el año en curso: aún no paga (empieza el año siguiente)
  if (anioInsc > 1990 && anioInsc <= anioActual + 1) {
    aniosDesdeInscripcion = anioActual - anioInsc;
    // Se paga RECIÉN el año siguiente al de inscripción y por 3 ejercicios:
    // años de pago = inscripción+1 .. inscripción+3 (TUO Ley Trib. Municipal, art. 30).
    // Ej.: inscripto 2025 → paga 2026, 2027 y 2028. Afecto si 1 ≤ (añoActual − inscripción) ≤ 3.
    afecto = aniosDesdeInscripcion >= 1 && aniosDesdeInscripcion <= ANTIGUEDAD_MAX;
    recienInscripto = aniosDesdeInscripcion <= 0; // inscripto este año o el próximo: todavía no afecto
    // Años de pago que restan (incluido el actual). Inscripto 2025 en 2026 → restan 3 (2026/27/28).
    aniosRestantes = afecto ? Math.max(0, ANTIGUEDAD_MAX - aniosDesdeInscripcion + 1) : 0;
  }

  // Cálculo del impuesto: 1% de la base, con piso de 1,5% UIT (solo si está afecto).
  const impuestoTeorico = valor * TASA_IMPUESTO;
  const aplicaPiso = afecto && impuestoTeorico < montoMinimo;
  const impuestoAnual = afecto ? Math.max(impuestoTeorico, montoMinimo) : 0;
  const cuotaTrimestral = impuestoAnual / 4;
  const fraccionado = String(i.fraccionado || 'no') === 'si';

  // --- Insight ---
  let _insight: any;
  if (recienInscripto) {
    _insight = {
      title: `Tu vehículo recién empieza a pagar en ${anioInsc + 1}`,
      text: `Con primera inscripción en **${anioInsc}**, todavía **no te corresponde** pagar el Impuesto al Patrimonio Vehicular en ${anioActual}. Se paga **a partir del año siguiente** a la inscripción y por 3 ejercicios: **${anioInsc + 1}, ${anioInsc + 2} y ${anioInsc + 3}**. El impuesto anual será de **${fmtPEN(impuestoTeorico < montoMinimo ? montoMinimo : impuestoTeorico)}**.`,
      tone: 'info',
      icon: '🗓️',
    };
  } else if (!afecto) {
    _insight = {
      title: 'Tu vehículo ya no paga impuesto vehicular',
      text: `Con primera inscripción en **${anioInsc}**, tu vehículo tiene **${aniosDesdeInscripcion} año(s)** y supera el límite de 3 años. El Impuesto al Patrimonio Vehicular **solo se paga durante 3 años** desde el año siguiente a la inscripción. **Ya no te corresponde pagarlo.**`,
      tone: 'good',
      icon: '✅',
    };
  } else if (aplicaPiso) {
    _insight = {
      title: 'Pagás el monto mínimo (1,5% de la UIT)',
      text: `El 1% de **${fmtPEN(valor)}** da **${fmtPEN(impuestoTeorico)}**, pero por ley el impuesto **nunca puede ser menor a 1,5% de la UIT = ${fmtPEN(montoMinimo)}**. Por eso pagás el piso: **${fmtPEN(impuestoAnual)}** al año${aniosRestantes !== null ? ` (te quedan ${aniosRestantes} año(s) de pago)` : ''}.`,
      tone: 'info',
      icon: '🚙',
    };
  } else {
    _insight = {
      title: `Impuesto vehicular ${anioActual}: ${fmtPEN(impuestoAnual)}`,
      text: `Es el **1% del valor del vehículo** (${fmtPEN(valor)}). Vence el **último día hábil de febrero**; podés pagarlo al contado o en **4 cuotas trimestrales** de ${fmtPEN(cuotaTrimestral)}${aniosRestantes !== null ? `. Te quedan **${aniosRestantes} año(s)** de pago` : ''}.`,
      tone: 'info',
      icon: '🚙',
    };
  }

  // --- Chart ---
  const _chart = afecto
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Valor del vehículo', value: Math.round(valor) },
          { label: 'Impuesto anual (1%)', value: Math.round(impuestoAnual) },
        ].filter((s) => s.value > 0),
        prefix: 'S/ ',
        centerValue: fmtPEN(impuestoAnual),
        centerLabel: 'Impuesto anual',
        ariaLabel: `Impuesto al patrimonio vehicular de ${fmtPEN(impuestoAnual)} al año sobre un valor de ${fmtPEN(valor)}.`,
      }
    : {
        type: 'bar',
        bars: [{ label: 'Impuesto a pagar', value: 0 }],
        prefix: 'S/ ',
        ariaLabel: recienInscripto
          ? `El vehículo recién se inscribió en ${anioInsc}: empieza a pagar el año siguiente.`
          : 'El vehículo superó los 3 años de antigüedad: no paga impuesto.',
      };

  const out: Outputs = {
    impuestoAnual: fmtPEN(impuestoAnual),
    cuotaTrimestral: afecto ? fmtPEN(cuotaTrimestral) : fmtPEN(0),
    baseImponible: fmtPEN(valor),
    montoMinimo: fmtPEN(montoMinimo),
    detalle: recienInscripto
      ? `Inscripto en ${anioInsc}: aún no paga en ${anioActual}. El impuesto empieza en ${anioInsc + 1} (3 ejercicios: ${anioInsc + 1}, ${anioInsc + 2} y ${anioInsc + 3}).`
      : !afecto
      ? `Vehículo de ${aniosDesdeInscripcion} años: superó el límite de 3 años, no está afecto.`
      : aplicaPiso
        ? `1% de ${fmtPEN(valor)} = ${fmtPEN(impuestoTeorico)}, menor al mínimo legal → se paga el piso de 1,5% UIT = ${fmtPEN(impuestoAnual)}.`
        : `1% de ${fmtPEN(valor)} = ${fmtPEN(impuestoAnual)} al año${fraccionado ? ` · 4 cuotas de ${fmtPEN(cuotaTrimestral)}` : ' · pago al contado hasta fin de febrero'}.`,
    _insight,
    _chart,
  };
  if (aniosRestantes !== null) out.aniosRestantes = `${aniosRestantes} año(s)`;
  return out;
}
