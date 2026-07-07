/**
 * Alertas "avisame cuando este resultado cambie" — catálogo de calcs elegibles.
 *
 * MVP: solo calcs AR data-driven de alto valor, cuyo resultado cambia por
 * normativa (escala de Ganancias, topes/cuotas de monotributo, ICL, TNA,
 * paritaria, aportes). NO incluir calcs date-driven (cuentas regresivas) ni
 * puramente input-driven sin parámetro fiscal: darían falsos avisos o nunca
 * dispararían.
 *
 * `headlineField` = la clave del objeto `result` del compute que mostramos en
 * el mail ("tu X pasó de A a B"). El diff real se hace sobre TODO el result.
 */
import { ALERT_ELIGIBLE_GENERATED } from './eligible-generated';

export interface AlertEligible {
  slug: string;
  /** Clave del result que es "el resultado" para el copy del mail. */
  headlineField: string;
  /** Etiqueta legible del resultado. */
  headlineLabel: string;
  /** 'currency' → formatear con miles; 'text' → mostrar tal cual (ej. categoría). */
  kind: 'currency' | 'text';
}

export const ALERT_ELIGIBLE: AlertEligible[] = [
  { slug: 'sueldo-en-mano-argentina', headlineField: 'neto', headlineLabel: 'tu sueldo en mano', kind: 'currency' },
  { slug: 'calculadora-impuesto-ganancias-sueldo', headlineField: 'retencionMensual', headlineLabel: 'tu retención mensual de Ganancias', kind: 'currency' },
  { slug: 'calculadora-aguinaldo-sac', headlineField: 'aguinaldoNeto', headlineLabel: 'tu aguinaldo neto', kind: 'currency' },
  { slug: 'simulador-recibo-de-sueldo-argentina', headlineField: 'neto', headlineLabel: 'tu sueldo neto', kind: 'currency' },
  { slug: 'calculadora-sueldo-bruto-desde-neto', headlineField: 'sueldoBruto', headlineLabel: 'el bruto necesario', kind: 'currency' },
  { slug: 'calculadora-monotributo-2026', headlineField: 'categoria', headlineLabel: 'tu categoría de monotributo', kind: 'text' },
  { slug: 'simulador-monotributo-neto', headlineField: 'netoMensual', headlineLabel: 'tu neto de monotributo', kind: 'currency' },
  { slug: 'calculadora-actualizacion-alquiler-icl', headlineField: 'valorActualizado', headlineLabel: 'tu nuevo alquiler (ICL)', kind: 'currency' },
  { slug: 'calculadora-plazo-fijo', headlineField: 'montoFinal', headlineLabel: 'el monto final de tu plazo fijo', kind: 'currency' },
  { slug: 'calculadora-sueldo-empleados-comercio-cct-130-75', headlineField: 'basico', headlineLabel: 'tu básico de convenio', kind: 'currency' },
];

// Fusión: generadas (todas las calcs data-driven económicas ES, autogeneradas por
// scripts/generate-alert-eligible.mjs) + curadas. Las curadas van ÚLTIMAS → ganan
// en caso de colisión (tienen headlineLabel afinado a mano).
const BY_SLUG = new Map([...ALERT_ELIGIBLE_GENERATED, ...ALERT_ELIGIBLE].map((a) => [a.slug, a]));

export const ALERT_ELIGIBLE_SLUGS: ReadonlySet<string> = new Set(BY_SLUG.keys());

export function isAlertEligible(slug: string): boolean {
  return BY_SLUG.has(slug);
}

export function getAlertConfig(slug: string): AlertEligible | null {
  return BY_SLUG.get(slug) || null;
}
