/**
 * Anticipo del impuesto de renta — Colombia (art. 807 ET).
 * Al presentar la declaración se liquida un anticipo del impuesto del año SIGUIENTE:
 *  - 25% si es el primer año que se declara, 50% el segundo, 75% del tercero en adelante.
 * Base: el contribuyente puede tomar el MENOR entre (a) el impuesto neto de renta del año, o
 *  (b) el promedio del impuesto neto de los dos últimos años (cuando hay año anterior).
 * Anticipo = (% × base) − retenciones en la fuente del año gravable.  Si da negativo → $0.
 * Moneda COP. fmtCOP de src/lib/data/colombia-2026.ts.
 */
import { fmtCOP } from '../data/colombia-2026.ts';

export interface Inputs {
  impuestoNetoActual: number | string;
  impuestoNetoAnterior?: number | string;
  retencionesAnio?: number | string;
  anioDeclarante?: string; // '1' | '2' | '3' (3 = tercero en adelante)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

const num = (v: unknown, def = 0): number => {
  if (v === '' || v === null || v === undefined) return def;
  const n = Number(v);
  return Number.isFinite(n) ? n : def;
};

export function compute(i: Inputs): Outputs {
  const impActual = num(i.impuestoNetoActual);
  if (impActual <= 0) throw new Error('Ingresá el impuesto neto de renta del año');

  const impAnterior = Math.max(0, num(i.impuestoNetoAnterior, 0));
  const retenciones = Math.max(0, num(i.retencionesAnio, 0));
  const anio = String(i.anioDeclarante ?? '3');
  const porcentaje = anio === '1' ? 0.25 : anio === '2' ? 0.50 : 0.75;

  // Base: el menor entre el impuesto del año y el promedio de los dos últimos (si hay anterior).
  const promedio = (impActual + impAnterior) / 2;
  const usaPromedio = impAnterior > 0 && promedio < impActual;
  const base = usaPromedio ? promedio : impActual;

  const anticipoBruto = porcentaje * base;
  const anticipo = Math.max(0, anticipoBruto - retenciones);
  const pctTxt = `${(porcentaje * 100).toLocaleString('es-CO')}%`;

  const _insight = {
    title: 'Tu anticipo de renta para el próximo año',
    text: `Sobre una base de **${fmtCOP(base)}** ${usaPromedio ? '(promedio de los dos últimos años, que te conviene más)' : '(impuesto neto del año)'}, el anticipo es el **${pctTxt}** = ${fmtCOP(anticipoBruto)}. Al descontar **${fmtCOP(retenciones)}** de retenciones que ya te practicaron, pagás un anticipo de **${fmtCOP(anticipo)}**${anticipo === 0 ? ' — tus retenciones ya cubren el anticipo' : ''}. Este valor se **suma** al impuesto del año en tu declaración y es un abono al impuesto del año entrante.`,
    tone: 'info' as const,
    icon: '🧮',
  };

  const _chart = anticipoBruto > 0
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Anticipo a pagar', value: Math.round(anticipo) },
          ...(retenciones > 0 ? [{ label: 'Cubierto por retenciones', value: Math.round(Math.min(retenciones, anticipoBruto)) }] : []),
        ],
        prefix: '$',
        centerValue: fmtCOP(anticipo),
        centerLabel: 'anticipo',
        ariaLabel: `Anticipo de renta ${fmtCOP(anticipo)} tras descontar ${fmtCOP(retenciones)} de retenciones.`,
      }
    : undefined;

  return {
    anticipo: fmtCOP(anticipo),
    porcentajeAplicado: `${pctTxt} (${anio === '1' ? 'primer año declarando' : anio === '2' ? 'segundo año' : 'tercer año en adelante'})`,
    baseUsada: `${fmtCOP(base)} ${usaPromedio ? '(promedio 2 años)' : '(impuesto del año)'}`,
    anticipoBruto: fmtCOP(anticipoBruto),
    menosRetenciones: fmtCOP(retenciones),
    detalle: `${pctTxt} × ${fmtCOP(base)} = ${fmtCOP(anticipoBruto)} − ${fmtCOP(retenciones)} retenciones = ${fmtCOP(anticipo)}.`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
