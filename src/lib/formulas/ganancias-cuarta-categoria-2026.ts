import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  aplicarEscalaMensual,
} from './_ganancias-escala';

/** Impuesto a las Ganancias 4ta categoría Argentina 2026
 *  Ley 20.628 — Empleados en relación de dependencia, reforma Ley 27.743 (Bases).
 *
 *  MNI + Deducción Especial, cargas de familia diferenciadas (cónyuge / hijo) y la
 *  escala del Art. 94 LIG vienen de `_ganancias-escala.ts`, que el fetcher de ARCA
 *  auto-actualiza por semestre. Sin valores hardcodeados ni escala propia. */

export interface Inputs {
  sueldoBrutoMensual: number;
  cargasFamiliares: number;
  conyuge: string;
  hijos: number;
  deduccionesEspeciales: number;
}

export interface Outputs {
  sueldoNetoSegSocial: number;
  gananciaAnual: number;
  deduccionesTotal: number;
  gananciaNetaSujetaImpuesto: number;
  impuestoAnual: number;
  impuestoMensual: number;
  tasaEfectiva: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function gananciasCuartaCategoria2026(i: Inputs): Outputs {
  const sueldoBruto = Number(i.sueldoBrutoMensual);
  const tieneConyuge = i.conyuge === 'si' || i.conyuge === 'true';
  const hijos = Math.max(0, Number(i.hijos) || 0);
  const deduccEsp = Number(i.deduccionesEspeciales) || 0;

  if (!sueldoBruto || sueldoBruto <= 0) throw new Error('Ingresá tu sueldo bruto mensual');

  // Aportes seg. social 17% (Jub 11 + OS 3 + INSSJP 3) con tope en la base imponible
  // máxima (Ley 24.241). Para sueldos altos el aporte se congela en el tope.
  const aportesSegSocial = Math.min(sueldoBruto, BASE_IMPONIBLE_MAXIMA_APORTES) * 0.17;
  const sueldoNetoSegSocial = sueldoBruto - aportesSegSocial;

  // Ganancia anual (13 sueldos con SAC)
  const gananciaAnual = sueldoNetoSegSocial * 13;

  // Deducciones anuales = montos mensuales de ARCA × 12
  // (MNI_MENSUAL_BASE ya combina GNI + Deducción Especial apartado 1).
  const deduccionFamiliaMensual =
    (tieneConyuge ? INCREMENTO_CONYUGE_MENSUAL : 0) + hijos * INCREMENTO_HIJO_MENSUAL;
  const deduccionesTotal = (MNI_MENSUAL_BASE + deduccionFamiliaMensual) * 12 + deduccEsp;

  const gananciaNetaSujetaImpuesto = Math.max(0, gananciaAnual - deduccionesTotal);
  // Escala progresiva Art. 94 LIG (expresada en términos mensuales): el impuesto
  // anual exacto = aplicarEscalaMensual(base/12) × 12 (topes y acumulados escalan ×12).
  const impuestoAnual = aplicarEscalaMensual(gananciaNetaSujetaImpuesto / 12).impuesto * 12;
  const impuestoMensual = impuestoAnual / 12;
  const tasaEfectiva = gananciaAnual > 0 ? (impuestoAnual / gananciaAnual) * 100 : 0;

  const formula = `Impuesto = escala($${Math.round(gananciaAnual).toLocaleString()} - $${Math.round(deduccionesTotal).toLocaleString()}) = $${Math.round(impuestoAnual).toLocaleString()}/año`;
  const explicacion = gananciaNetaSujetaImpuesto <= 0
    ? `Con un sueldo bruto de $${sueldoBruto.toLocaleString()}/mes, tus deducciones ($${Math.round(deduccionesTotal).toLocaleString()}) superan tu ganancia neta ($${Math.round(gananciaAnual).toLocaleString()}). No pagás Ganancias.`
    : `Sueldo bruto: $${sueldoBruto.toLocaleString()}/mes. Aportes seg. social (17%): $${Math.round(aportesSegSocial).toLocaleString()}. Ganancia anual (13 sueldos): $${Math.round(gananciaAnual).toLocaleString()}. Deducciones: $${Math.round(deduccionesTotal).toLocaleString()} (MNI + especial${tieneConyuge ? ' + cónyuge' : ''}${hijos > 0 ? ` + ${hijos} hijo(s)` : ''}). Ganancia sujeta a impuesto: $${Math.round(gananciaNetaSujetaImpuesto).toLocaleString()}. Impuesto anual: $${Math.round(impuestoAnual).toLocaleString()} ($${Math.round(impuestoMensual).toLocaleString()}/mes). Tasa efectiva: ${tasaEfectiva.toFixed(2)}%.`;

  const netoDespuesImpuesto = Math.max(0, gananciaAnual - impuestoAnual);
  const insight = impuestoAnual > 0
    ? {
        title: 'Cuánto te llevás vs. cuánto va a Ganancias',
        text: `De tu ganancia anual, **$${Math.round(impuestoAnual).toLocaleString('es-AR')}** (**${tasaEfectiva.toFixed(1)}%** efectivo) se van en Ganancias: unos **$${Math.round(impuestoMensual).toLocaleString('es-AR')}/mes**. Sumar familiares a cargo o deducciones especiales baja esta cifra.`,
        tone: 'warn' as const,
        icon: '🧾',
      }
    : {
        title: 'No tributás Ganancias',
        text: `Tus deducciones (**$${Math.round(deduccionesTotal).toLocaleString('es-AR')}**) superan tu ganancia neta anual (**$${Math.round(gananciaAnual).toLocaleString('es-AR')}**), así que el impuesto es **$0**.`,
        tone: 'good' as const,
        icon: '✅',
      };

  const chart = impuestoAnual > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Queda en mano', value: Math.round(netoDespuesImpuesto) },
      { label: 'Impuesto Ganancias', value: Math.round(impuestoAnual) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(gananciaAnual).toLocaleString('es-AR'),
    centerLabel: 'Ganancia anual',
    ariaLabel: 'Composición de la ganancia anual: lo que queda en mano vs el impuesto a las Ganancias',
  } : undefined;

  return {
    sueldoNetoSegSocial: Math.round(sueldoNetoSegSocial),
    gananciaAnual: Math.round(gananciaAnual),
    deduccionesTotal: Math.round(deduccionesTotal),
    gananciaNetaSujetaImpuesto: Math.round(gananciaNetaSujetaImpuesto),
    impuestoAnual: Math.round(impuestoAnual),
    impuestoMensual: Math.round(impuestoMensual),
    tasaEfectiva: Number(tasaEfectiva.toFixed(2)),
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
