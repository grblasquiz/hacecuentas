/**
 * Sello de frescura a NIVEL DATO.
 *
 * Problema: el badge "Actualizado <mes año>" junto al H1 es una fecha editorial
 * (lastReviewed/mtime). En calcs data-driven (monotributo, sueldo AR, BR/PE/EC/
 * CO/MX/USA, feriados) el usuario quiere saber la vigencia del DATO, no cuándo
 * se retocó el texto.
 *
 * Solución (cero churn de sitemap, solo .ts/.astro): cada tabla maestra de
 * `src/lib/data/` (y `formulas/sueldo-ar.ts`) exporta `DATA_AS_OF` (YYYY-MM-DD,
 * vigencia real del dato). Este módulo mapea formulaId → módulo de datos y
 * expone `getDataAsOf(formulaId)`. El route ES ([...slug].astro) lo usa para
 * renderizar "Datos: <fecha> · Revisado: <mes año>".
 *
 * ⚠️ Mantenimiento:
 *  - Al actualizar un dato en una tabla maestra, actualizar su DATA_AS_OF ahí
 *    (este archivo NO se toca: importa las fechas, no las duplica).
 *  - Al crear una fórmula nueva que importe una tabla maestra, agregar su
 *    formulaId a la lista de abajo. Regenerar con:
 *      cd src/lib/formulas && grep -rl "data/<modulo>" . --include="*.ts"
 *      (y grep -rlE "from ['\"]\./sueldo-ar['\"]" . para sueldo-ar)
 *  - Si una fórmula importa DOS módulos, gana la fecha MÁS VIEJA (el dato es
 *    tan fresco como su fuente más stale).
 *
 * NO usar import.meta.glob(..., '?raw') para derivar esto: globbear el código
 * de ~3.400 fórmulas infla el worker (límite 64 MiB — ya pasó).
 */

import { DATA_AS_OF as AS_OF_BRASIL } from './data/brasil-2026';
import { DATA_AS_OF as AS_OF_MONOTRIBUTO } from './data/monotributo-2026';
import { DATA_AS_OF as AS_OF_USA } from './data/usa-2026';
import { DATA_AS_OF as AS_OF_PERU } from './data/peru-2026';
import { DATA_AS_OF as AS_OF_ECUADOR } from './data/ecuador-2026';
import { DATA_AS_OF as AS_OF_COLOMBIA } from './data/colombia-2026';
import { DATA_AS_OF as AS_OF_MEXICO } from './data/mexico-2026';
import { DATA_AS_OF as AS_OF_CHILE } from './data/chile-2026';
import { DATA_AS_OF as AS_OF_FERIADOS_AR } from './data/feriados-ar-2026';
import { DATA_AS_OF as AS_OF_SUELDO_AR } from './formulas/sueldo-ar';

/** formulaIds (basename del .ts en src/lib/formulas/) por módulo de datos. */
const FORMULA_IDS_BY_MODULE: Record<string, { asOf: string; formulaIds: string[] }> = {
  'brasil-2026': {
    asOf: AS_OF_BRASIL,
    formulaIds: [
      '13-salario-liquido-bruto-clt',
      'abono-pis-pasep',
      'aposentadoria-inss-2026-tempo-contribuicao',
      'aposentadoria-inss-especial',
      'aposentadoria-inss-idade',
      'aposentadoria-inss-idade-progressiva',
      'aposentadoria-inss-pedagio-100',
      'aposentadoria-inss-pedagio-50',
      'aposentadoria-inss-pontos',
      'aposentadoria-inss-tempo-contrib',
      'aposentadoria-professor-inss',
      'auxilio-doenca-inss',
      'bpc-idoso-deficiente',
      'decimo-terceiro-proporcional',
      'decimo-terceiro-segunda-parcela',
      'ferias-1-3-empregado-clt',
      'ferias-clt-integrais',
      'ferias-proporcionais-clt',
      'inss-autonomo-individual',
      'irrf-mensal-folha',
      'mei-das-mensal-comercio',
      'mei-das-mensal-servicos',
      'mei-das-mensal-transporte',
      'pensao-por-morte-inss',
      'pj-vs-clt-comparador',
      'pro-labore-socio',
      'salario-bruto-do-liquido',
      'salario-liquido-clt-inss-irrf',
      'salario-liquido-dependentes',
      'salario-liquido-pensao',
      'salario-maternidade-inss',
      'seguro-desemprego-valor',
      'simulador-holerite-clt',
    ],
  },
  'monotributo-2026': {
    asOf: AS_OF_MONOTRIBUTO,
    formulaIds: [
      'facturacion-maxima-monotributo',
      'ganancias-monotributista-pase-regimen-general',
      'impuestos-monotributo-freelance',
      'monotributo',
      'monotributo-alta-afip-tramite-zero',
      'monotributo-categoria-2026-recategorizacion-julio',
      'monotributo-categoria-ideal',
      'monotributo-categoria-ingresos-tope',
      'monotributo-cuota-2026-todas-categorias',
      'simulador-monotributo-neto',
    ],
  },
  'usa-2026': {
    asOf: AS_OF_USA,
    formulaIds: [
      '401k-contribution-match-calculator',
      'roth-vs-traditional-ira-calculator',
    ],
  },
  'peru-2026': {
    asOf: AS_OF_PERU,
    formulaIds: [
      'afp-vs-onp-peru',
      'asignacion-familiar-peru',
      'costo-laboral-total-empleador-peru',
      'cts-peru-calculo-deposito',
      'descuento-tardanzas-faltas-peru',
      'detracciones-igv-peru',
      'essalud-aporte-peru',
      'gratificacion-julio-diciembre-peru',
      'gratificacion-trunca-peru',
      'igv-peru',
      'impuesto-renta-quinta-categoria-peru',
      'indemnizacion-despido-arbitrario-peru',
      'liquidacion-beneficios-sociales-peru',
      'renta-cuarta-categoria-honorarios-peru',
      'renta-primera-categoria-alquiler-peru',
      'rus-nuevo-regimen-unico-simplificado-peru',
      'sueldo-bruto-a-neto-peru',
      'sueldo-neto-peru',
      'utilidades-peru',
      'vacaciones-truncas-peru',
    ],
  },
  'ecuador-2026': {
    asOf: AS_OF_ECUADOR,
    formulaIds: [
      'anticipo-impuesto-renta-ecuador',
      'aporte-iess-ecuador',
      'costo-laboral-total-empleador-ecuador',
      'decimo-cuarto-sueldo-ecuador',
      'decimo-tercer-sueldo-ecuador',
      'fondos-de-reserva-ecuador',
      'horas-extra-suplementarias-ecuador',
      'impuesto-renta-ecuador',
      'indemnizacion-despido-intempestivo-ecuador',
      'iva-ecuador',
      'jubilacion-iess-ecuador',
      'liquidacion-haberes-finiquito-ecuador',
      'prestamo-quirografario-iess-ecuador',
      'retencion-fuente-dependencia-ecuador',
      'rimpe-emprendedor-ecuador',
      'salario-digno-ecuador',
      'sueldo-bruto-a-neto-ecuador',
      'sueldo-neto-ecuador',
      'utilidades-ecuador',
      'vacaciones-ecuador',
    ],
  },
  'colombia-2026': {
    asOf: AS_OF_COLOMBIA,
    formulaIds: [
      'comparendos-transito-colombia-2026',
      'costo-total-empleado-empleador-colombia-2026',
      'embargo-salario-colombia',
      'empleada-domestica-dias-colombia-2026',
      'ganancia-ocasional-venta-casa-colombia',
      'gastos-notariales-registro-compraventa-2026',
      'horas-extras-colombia-2026',
      'impuesto-predial-bogota-2026',
      'incapacidad-medica-eps-colombia',
      'obligado-declarar-renta-2026',
      'pila-independientes-colombia-2026',
      'recargo-dominical-festivo-colombia-2026',
      'recargo-nocturno-colombia-2026',
      'reduccion-jornada-42-horas-colombia-2026',
      'retencion-fuente-compras-servicios-2026',
      'salario-aprendiz-sena-2026',
      'salario-integral-colombia-2026',
      'sancion-extemporaneidad-dian-2026',
    ],
  },
  'mexico-2026': {
    asOf: AS_OF_MEXICO,
    formulaIds: [
      'costo-empleado-patron-mexico-2026',
      'costo-pasaporte-mexicano-2026',
      'imss-trabajadoras-hogar-mexico',
      'incapacidad-imss-enfermedad-general',
      'isr-acciones-bolsa-mexico-10-por-ciento',
      'isr-arrendamiento-deduccion-ciega-mexico',
      'isr-quincenal-mexico-2026',
      'isr-venta-casa-mexico-700000-udis',
      'colegiaturas-deducibles-sat-mexico',
      'imss-independientes-modalidad-10',
      'prima-riesgo-trabajo-imss-siniestralidad',
      'tope-deducciones-personales-2026-mexico',
      'pension-bienestar-2026-monto',
      'pension-imss-ley-73-mexico',
      'pension-invalidez-imss-mexico',
      'prima-dominical-dias-festivos-mexico',
      'retiro-afore-desempleo-mexico',
      'salario-diario-integrado-sdi-mexico',
    ],
  },
  'chile-2026': {
    asOf: AS_OF_CHILE,
    // Aún sin fórmulas que la importen (vertical CL en construcción).
    // Al wirear fórmulas CL a data/chile-2026, agregar sus formulaIds acá.
    formulaIds: [],
  },
  'feriados-ar-2026': {
    asOf: AS_OF_FERIADOS_AR,
    formulaIds: [
      'cuanto-falta-feriado-proximo-argentina-2026',
      'cuantos-feriados-restan-ano-argentina',
      'dias-habiles-mes-actual-feriados',
      'feriados-argentina-2026',
      'puente-feriado-fines-semana-largos-argentina-2026',
    ],
  },
  'sueldo-ar': {
    asOf: AS_OF_SUELDO_AR,
    formulaIds: [
      'aguinaldo',
      'ganancias-4ta-categoria-2026',
      'ganancias-cuarta-categoria-2026',
      'ganancias-sueldo',
      'neto-a-bruto',
      'recibo-de-sueldo-argentina',
      'sueldo-bancario-bco-nacion-provincia',
      'sueldo-camionero-fedcam-basico-adicionales',
      'sueldo-chofer-colectivo-uta-urbano',
      'sueldo-comercio-paritaria-abril-2026',
      'sueldo-docente-ademys-caba',
      'sueldo-docente-argentina-cargo-antiguedad',
      'sueldo-empleado-publico-nacional-sinep-agrupamiento',
      'sueldo-empleados-comercio-cct-130-75',
      'sueldo-gastronomico-uthgra-mozo-cocinero',
      'sueldo-minimo-afa',
      'sueldo-smata-mecanico-automotor-basico',
      'sueldo-uocra-construccion-basico-neto',
      'sueldo-uom-metalurgico-basico-neto',
    ],
  },
};

/** Mapa plano formulaId → dataAsOf (YYYY-MM-DD). Si un id aparece en 2 módulos, gana la fecha más vieja. */
const DATA_AS_OF_BY_FORMULA: Record<string, string> = {};
for (const { asOf, formulaIds } of Object.values(FORMULA_IDS_BY_MODULE)) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(asOf)) continue; // fecha malformada → no romper el build, simplemente no sellar
  for (const id of formulaIds) {
    const prev = DATA_AS_OF_BY_FORMULA[id];
    DATA_AS_OF_BY_FORMULA[id] = prev && prev < asOf ? prev : asOf;
  }
}

/**
 * Vigencia del dato para una fórmula, o null si la fórmula no está respaldada
 * por una tabla maestra con DATA_AS_OF (en ese caso el badge cae a la fecha
 * editorial de siempre).
 */
export function getDataAsOf(formulaId: string | undefined | null): string | null {
  if (!formulaId) return null;
  return DATA_AS_OF_BY_FORMULA[formulaId] ?? null;
}
