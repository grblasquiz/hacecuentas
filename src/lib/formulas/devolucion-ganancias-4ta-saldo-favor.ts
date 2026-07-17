/**
 * Devolución de Ganancias 4ta categoría — saldo a favor de la liquidación anual.
 *
 * ⚠️ ESTIMACIÓN ORIENTATIVA. La liquidación anual real (F.1357) la hace el
 * empleador/ARCA con tu SIRADIG. Esto sirve para anticipar si te va a quedar
 * saldo a favor (devolución) o a pagar.
 *
 * Lógica: en el año te retuvieron un monto (suma de las retenciones de cada
 * recibo). Al cierre se calcula el impuesto ANUAL determinado sobre tu ganancia
 * neta. Si te retuvieron de más → saldo a favor (te lo devuelven); si de menos →
 * saldo a pagar.
 *
 *   Bruto anual        = sueldo bruto mensual × (meses + aguinaldo)
 *   Aportes (17%)      = jubilación 11% + PAMI 3% + obra social 3%
 *   Ganancia neta      = bruto − aportes − (GNI + deducción especial) − deducciones SIRADIG
 *   Impuesto anual     = escala del art. 94 (importada de _ganancias-escala) sobre la ganancia neta
 *   Saldo              = retenciones sufridas − impuesto anual determinado
 *
 * Importa la escala y el mínimo no imponible de la fuente única
 * (src/lib/formulas/_ganancias-escala.ts), nunca hardcodeados.
 */

import { MNI_MENSUAL_BASE, aplicarEscalaMensual } from './_ganancias-escala.ts';

export interface Inputs {
  sueldoBrutoMensual: number;
  mesesTrabajados?: number;      // default 12
  retencionesSufridas: number;   // total retenido en el año (de los recibos / F.1357)
  deduccionesSiradig?: number;   // total anual de deducciones cargadas (alquiler, prepaga, hijos, cónyuge, etc.)
}

export interface Outputs {
  saldo: string;
  hayDevolucion: string;
  impuestoAnualDeterminado: string;
  retencionesSufridas: string;
  gananciaNetaImponible: string;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

const APORTES = 0.17; // 11% jubilación + 3% PAMI + 3% obra social
const fmt = (n: number): string => '$' + Math.round(n).toLocaleString('es-AR');

export function compute(i: Inputs): Outputs {
  const brutoMensual = Number(i.sueldoBrutoMensual) || 0;
  const meses = Math.max(1, Math.min(13, Number(i.mesesTrabajados) || 12));
  const retenciones = Math.max(0, Number(i.retencionesSufridas) || 0);
  const deduccionesSiradig = Math.max(0, Number(i.deduccionesSiradig) || 0);

  if (brutoMensual <= 0) throw new Error('Ingresá tu sueldo bruto mensual.');

  // Bruto anual: meses trabajados + aguinaldo proporcional (1 sueldo extra al año completo).
  const aguinaldo = brutoMensual * (meses / 12);
  const brutoAnual = brutoMensual * meses + aguinaldo;
  const aportesAnual = brutoAnual * APORTES;
  const netoAnual = brutoAnual - aportesAnual;

  // Mínimo no imponible combinado (GNI + deducción especial empleado), anualizado
  // desde la fuente única mensual. Soltero sin cargas de base; las cargas van en SIRADIG.
  const mniAnual = MNI_MENSUAL_BASE * 12;

  const gananciaNeta = Math.max(0, netoAnual - mniAnual - deduccionesSiradig);

  // Impuesto anual: la escala del módulo es mensual; anual = escala(neta/12) × 12
  // (equivalente porque los tramos anuales son 12× los mensuales).
  const impuestoAnual = gananciaNeta > 0
    ? aplicarEscalaMensual(gananciaNeta / 12).impuesto * 12
    : 0;

  const saldo = retenciones - impuestoAnual; // >0 → devolución
  const hayDevolucion = saldo > 0;

  const _insight = {
    title: hayDevolucion ? `Te devuelven ${fmt(saldo)}` : saldo < 0 ? `Te queda a pagar ${fmt(-saldo)}` : 'Sin saldo',
    text: hayDevolucion
      ? `Te retuvieron **${fmt(retenciones)}** en el año y el impuesto anual determinado es **${fmt(impuestoAnual)}**: te quedó un **saldo a favor de ${fmt(saldo)}**, que ARCA te devuelve en la liquidación anual (F.1357), habitualmente entre febrero y junio. Cargá bien tus deducciones en SIRADIG para maximizarlo. **Estimación orientativa.**`
      : saldo < 0
        ? `El impuesto anual determinado (**${fmt(impuestoAnual)}**) supera lo que te retuvieron (**${fmt(retenciones)}**): quedaría un **saldo a pagar de ${fmt(-saldo)}**. Revisá si te falta cargar deducciones en SIRADIG. **Estimación orientativa.**`
        : `Lo retenido coincide con el impuesto determinado: no hay saldo a favor ni a pagar. **Estimación orientativa.**`,
    tone: hayDevolucion ? 'good' : 'warn',
    icon: '💸',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Retenido en el año', 'Impuesto determinado'],
    values: [Math.round(retenciones), Math.round(impuestoAnual)],
    prefix: '$',
    ariaLabel: `Retenciones sufridas ${fmt(retenciones)} frente al impuesto anual determinado ${fmt(impuestoAnual)}. La diferencia es el saldo a favor o a pagar.`,
  };

  return {
    saldo: (saldo >= 0 ? '' : '−') + fmt(Math.abs(saldo)).replace('$', '$'),
    hayDevolucion: hayDevolucion ? `Sí — saldo a favor de ${fmt(saldo)}` : saldo < 0 ? `No — saldo a pagar de ${fmt(-saldo)}` : 'Sin saldo',
    impuestoAnualDeterminado: fmt(impuestoAnual),
    retencionesSufridas: fmt(retenciones),
    gananciaNetaImponible: fmt(gananciaNeta),
    detalle: `Neto anual ${fmt(netoAnual)} − MNI ${fmt(mniAnual)} − SIRADIG ${fmt(deduccionesSiradig)} = base ${fmt(gananciaNeta)}. Impuesto ${fmt(impuestoAnual)} vs retenido ${fmt(retenciones)} → saldo ${saldo >= 0 ? 'a favor' : 'a pagar'} ${fmt(Math.abs(saldo))}.`,
    _insight,
    _chart,
  };
}
