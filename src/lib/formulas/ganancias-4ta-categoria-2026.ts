import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
import {
  MNI_MENSUAL_BASE,
  INCREMENTO_CONYUGE_MENSUAL,
  INCREMENTO_HIJO_MENSUAL,
  aplicarEscalaMensual,
} from './_ganancias-escala';

/** Impuesto a las Ganancias 4ta categoría — Argentina 2026.
 *  Ley 20.628 (t.o. 2019), reforma Ley 27.743 — empleados en relación de dependencia.
 *
 *  MNI + Deducción Especial, cargas de familia diferenciadas (cónyuge / hijo) y la
 *  escala del Art. 94 LIG vienen de `_ganancias-escala.ts`, que el fetcher de ARCA
 *  auto-actualiza por semestre. Mismo patrón que `sueldo-ar.ts`: sin valores
 *  hardcodeados ni escala propia. */

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; }

export function ganancias4taCategoria2026(i: Inputs): Outputs {
  const b = Number(i.sueldoBruto) || 0;

  // Cargas de familia: la 1ª computa como cónyuge y el resto como hijos a cargo
  // (misma convención que sueldo-ar.ts) para usar los montos diferenciados de ARCA.
  const cargas = Math.max(0, Math.min(10, Number(i.cargasFamiliares) || 0));
  const conyuge = cargas >= 1;
  const hijos = Math.max(0, cargas - 1);

  // Aportes personales 17% (Jub 11 + OS 3 + INSSJP 3) con tope en la base imponible
  // máxima (Ley 24.241). Para sueldos altos el aporte se congela en el tope.
  const aportes = Math.min(b, BASE_IMPONIBLE_MAXIMA_APORTES) * 0.17;
  const neto = b - aportes;

  // Ganancia anual proyectada: 13 sueldos (incluye SAC).
  const ingresoAnual = neto * 13;

  // Deducciones personales anuales = montos mensuales de ARCA × 12
  // (MNI_MENSUAL_BASE ya combina GNI + Deducción Especial 4ta apartado 1).
  const deduccionFamiliaMensual =
    (conyuge ? INCREMENTO_CONYUGE_MENSUAL : 0) + hijos * INCREMENTO_HIJO_MENSUAL;
  const deduccionAnual = (MNI_MENSUAL_BASE + deduccionFamiliaMensual) * 12;

  const baseImponible = Math.max(0, ingresoAnual - deduccionAnual);

  // Escala progresiva Art. 94 LIG. La ESCALA está expresada en términos mensuales,
  // así que el impuesto anual exacto = aplicarEscalaMensual(base/12) × 12
  // (topes y acumulados escalan linealmente por 12).
  const impuestoAnual = aplicarEscalaMensual(baseImponible / 12).impuesto * 12;
  const impMensual = Math.round(impuestoAnual / 12);

  const brutoAnual = b * 13;
  const alicEf = brutoAnual > 0 ? (impuestoAnual / brutoAnual * 100).toFixed(2) : '0';
  const enMano = Math.round(neto - impMensual);
  const paga = impMensual > 0;

  const _insight = paga
    ? {
        title: 'Retención de 4ta categoría',
        text: `Con un bruto de **$${Math.round(b).toLocaleString('es-AR')}/mes**, te retienen **$${impMensual.toLocaleString('es-AR')}** por Ganancias (alícuota efectiva **${alicEf}%**). Tu sueldo en mano queda en **$${enMano.toLocaleString('es-AR')}**.`,
        tone: 'warn',
        icon: '💸',
      }
    : {
        title: 'No pagás Ganancias',
        text: `Con un bruto de **$${Math.round(b).toLocaleString('es-AR')}/mes**, tu ingreso anual no supera el mínimo no imponible más deducciones, así que tu retención es **$0** y cobrás **$${enMano.toLocaleString('es-AR')}** en mano.`,
        tone: 'good',
        icon: '✅',
      };
  const _chart = b > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Sueldo en mano', value: Math.max(0, enMano) },
      { label: 'Aportes (17%)', value: Math.round(aportes) },
      { label: 'Ganancias', value: impMensual },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(b).toLocaleString('es-AR'),
    centerLabel: 'Bruto/mes',
    ariaLabel: 'Composición del sueldo bruto mensual: en mano, aportes y retención de Ganancias',
  } : undefined;
  return { impuestoMensual:`$${impMensual.toLocaleString('es-AR')}`, alicuotaEfectiva:`${alicEf}%`, sueldoNeto:`$${enMano.toLocaleString('es-AR')}`, _insight, ...(_chart?{_chart}:{}) };
}
