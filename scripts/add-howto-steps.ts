/**
 * Genera howToSteps para cada calc JSON que no lo tenga.
 * Los pasos describen cómo usar la calculadora en lenguaje natural argentino.
 *
 * Uso:
 *   node --experimental-strip-types scripts/add-howto-steps.ts
 *
 * Idempotente: no pisa howToSteps existentes.
 */

import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const CALCS_DIR = join(process.cwd(), 'src/content/calcs');

interface Field {
  id: string;
  label: string;
  type: string;
  help?: string;
  placeholder?: string;
  prefix?: string;
  suffix?: string;
  options?: Array<{ value: string; label: string }>;
}

interface HowToStep {
  name: string;
  text: string;
}

interface Calc {
  slug: string;
  title: string;
  h1: string;
  description: string;
  category: string;
  fields: Field[];
  howToSteps?: HowToStep[];
  [key: string]: any;
}

/** Generar el verbo de acción según el tipo de campo */
function actionVerb(field: Field): string {
  switch (field.type) {
    case 'select':
      return 'Seleccioná';
    case 'checkbox':
      return 'Marcá';
    case 'radio':
      return 'Elegí';
    case 'range':
      return 'Ajustá';
    case 'date':
      return 'Elegí';
    default:
      return 'Ingresá';
  }
}

/** Generar una descripción amigable del campo */
function friendlyFieldDesc(field: Field): string {
  const label = field.label.toLowerCase();

  // Si tiene help text, usarlo como base para la descripción
  if (field.help) {
    // Quitar punto final si lo tiene, para evitar doble punto
    const h = field.help.replace(/\.\s*$/, '');
    return h.charAt(0).toLowerCase() + h.slice(1);
  }

  // Para selects, mencionar que hay opciones
  if (field.type === 'select' && field.options && field.options.length > 0) {
    const optLabels = field.options.slice(0, 3).map(o => o.label);
    const suffix = field.options.length > 3 ? ', entre otras' : '';
    return `las opciones disponibles son: ${optLabels.join(', ')}${suffix}`;
  }

  // Para números con prefijo $ = es un monto
  if (field.type === 'number' && field.prefix === '$') {
    return `el monto en pesos`;
  }

  // Para números con sufijo % = porcentaje
  if (field.type === 'number' && field.suffix === '%') {
    return `el valor en porcentaje`;
  }

  return `el valor de ${label}`;
}

/** Nombre del paso para un campo */
function stepNameForField(field: Field): string {
  const verb = actionVerb(field);
  // Limpiar paréntesis con unidades del label para el nombre corto
  const cleanLabel = field.label
    .replace(/\s*\(.*?\)\s*/g, ' ')
    .trim();
  return `${verb} ${cleanLabel.charAt(0).toLowerCase()}${cleanLabel.slice(1)}`;
}

/** Texto del paso para un campo */
function stepTextForField(field: Field): string {
  const verb = actionVerb(field);
  const label = field.label;
  const desc = friendlyFieldDesc(field);

  if (field.type === 'select') {
    return `${verb} ${label.charAt(0).toLowerCase()}${label.slice(1)} del menú desplegable. ${desc.charAt(0).toUpperCase()}${desc.slice(1)}.`;
  }

  if (field.type === 'checkbox') {
    return `${verb} la casilla de ${label.charAt(0).toLowerCase()}${label.slice(1)} si corresponde a tu situación.`;
  }

  if (field.type === 'number') {
    const placeholder = field.placeholder ? ` (ej: ${field.prefix || ''}${field.placeholder}${field.suffix || ''})` : '';
    return `${verb} ${label.charAt(0).toLowerCase()}${label.slice(1)}${placeholder}. Es ${desc}.`;
  }

  return `${verb} ${label.charAt(0).toLowerCase()}${label.slice(1)}. Es ${desc}.`;
}

/** Generar los pasos completos para una calculadora */
function generateSteps(calc: Calc): HowToStep[] {
  const steps: HowToStep[] = [];

  // Paso 1: Acceder a la calculadora (solo si hay muchos campos, sino directo al grano)
  // En lugar de eso, vamos directo a los campos — más útil para el schema.

  // Pasos por campo (máx 3 campos para los pasos, los más importantes)
  const fieldsForSteps = calc.fields.slice(0, 3);

  for (const field of fieldsForSteps) {
    steps.push({
      name: stepNameForField(field),
      text: stepTextForField(field),
    });
  }

  // Si hay más de 3 campos, agrupar los restantes
  if (calc.fields.length > 3) {
    const remaining = calc.fields.slice(3);
    const remainingLabels = remaining.map(f => f.label.toLowerCase()).join(', ');
    steps.push({
      name: 'Completá los datos restantes',
      text: `Completá los campos adicionales: ${remainingLabels}. Estos valores complementan el cálculo principal.`,
    });
  }

  // Paso "Calcular"
  steps.push({
    name: 'Hacé click en Calcular',
    text: `Presioná el botón "Calcular" para obtener el resultado. La calculadora procesa los datos al instante.`,
  });

  // Paso "Revisar resultados"
  steps.push({
    name: 'Revisá los resultados',
    text: `Revisá los resultados que aparecen debajo del formulario. Podés modificar cualquier dato y volver a calcular.`,
  });

  return steps;
}

// --- Main ---
const files = readdirSync(CALCS_DIR).filter(f => f.endsWith('.json'));
let updated = 0;
let skipped = 0;

for (const file of files) {
  const filePath = join(CALCS_DIR, file);
  const raw = readFileSync(filePath, 'utf-8');
  const calc: Calc = JSON.parse(raw);

  // Idempotente: no pisar howToSteps existentes
  if (calc.howToSteps && calc.howToSteps.length > 0) {
    skipped++;
    continue;
  }

  if (!calc.fields || calc.fields.length === 0) {
    skipped++;
    continue;
  }

  const steps = generateSteps(calc);
  calc.howToSteps = steps;

  // Escribir preservando formato (2 spaces indent, trailing newline)
  writeFileSync(filePath, JSON.stringify(calc, null, 2) + '\n', 'utf-8');
  updated++;
}

console.log(`Done. Updated: ${updated}, Skipped: ${skipped}, Total: ${files.length}`);
