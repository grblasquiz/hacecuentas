/**
 * Genera tablas de referencia data-driven (information-gain crawlable) + ejemplos
 * resueltos para 3 calcs del top-10, computando TODO de las fórmulas reales
 * (anti-fabricación). Idempotente: preserva tablas/ejemplos hand-authored y sólo
 * escribe si cambió.
 *
 * Uso: node --experimental-strip-types scripts/gen-top10-tables.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { gananciasSueldo } from '../src/lib/formulas/ganancias-sueldo.ts';
import { MNI_MENSUAL_BASE } from '../src/lib/formulas/_ganancias-escala.ts';
import { artIndemnizacionTablaIncapacidadPermanente as artCalc } from '../src/lib/formulas/art-indemnizacion-tabla-incapacidad-permanente.ts';

const REVIEW_DATE = '2026-06-25';
const CALCS = 'src/content/calcs';
const $ = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
const pctS = (n: number) => n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + '%';

/** Patch idempotente de un JSON de calc: reemplaza reftables/ejemplos generados
 *  (por prefijo de título) preservando los hand-authored, y bumpea lastReviewed. */
function patchCalc(slug: string, genTables: any[], genExamples: any[], genTitlePrefixes: string[], extra?: (c: any) => void) {
  const p = path.join(CALCS, slug + '.json');
  const raw = fs.readFileSync(p, 'utf8');
  const c = JSON.parse(raw);
  const keep = (arr: any[]) => arr.filter((t) => !genTitlePrefixes.some((pre) => (t.title || '').startsWith(pre)));
  c.referenceTables = [...genTables, ...keep(c.referenceTables || [])];
  // Estos calcs tenían solvedExamples vacío → reemplazamos (idempotente, no merge).
  if (genExamples.length) c.solvedExamples = genExamples;
  c.lastReviewed = REVIEW_DATE;
  if (extra) extra(c);
  const next = JSON.stringify(c, null, 2) + '\n';
  if (next !== raw) { fs.writeFileSync(p, next); console.log(`[${slug}] OK — ${genTables.length} tablas, ${genExamples.length} ejemplos.`); }
  else console.log(`[${slug}] sin cambios.`);
}

// ─────────────────────────── 1) GANANCIAS SUELDO ───────────────────────────
{
  const situaciones: Array<[string, boolean, number]> = [
    ['Soltero/a sin hijos', false, 0],
    ['Casado/a (cónyuge a cargo)', true, 0],
    ['Soltero/a + 1 hijo', false, 1],
    ['Soltero/a + 2 hijos', false, 2],
    ['Casado/a + 2 hijos', true, 2],
  ];
  const umbralRows = situaciones.map(([label, conyuge, hijos]) => {
    const o = gananciasSueldo({ brutoMensual: 20_000_000, conyuge, hijos, otrasDeducciones: 0 });
    return [label, $(o.mniTotalMensual), $(o.umbralMensual)];
  });
  const tablaUmbral = {
    title: '¿Desde qué sueldo bruto pagás Ganancias en 2026?',
    caption: 'Sueldo bruto mensual a partir del cual empieza la retención de Ganancias (4ª categoría), según tu situación familiar. Período julio-diciembre 2026.',
    headers: ['Situación familiar', 'Mínimo no imponible + deducciones', 'Pagás Ganancias desde'],
    rows: umbralRows,
    highlightCol: 2,
    note: `Cálculo: (MNI ${$(MNI_MENSUAL_BASE)} + deducciones por familia) ÷ 0,83 (los aportes son el 17% del bruto). Si cargás alquiler, prepaga u otras deducciones en SIRADIG, el umbral sube. Valores ARCA del 1er semestre 2026.`,
  };

  const niveles = [2_500_000, 3_000_000, 3_500_000, 4_000_000, 5_000_000, 7_000_000, 10_000_000];
  const simRows = niveles.map((b) => {
    const o = gananciasSueldo({ brutoMensual: b, conyuge: false, hijos: 0, otrasDeducciones: 0 });
    const enMano = Math.max(0, Math.round(o.netoDeAportesMensual) - o.retencionMensual);
    return [$(b), o.retencionMensual > 0 ? $(o.retencionMensual) : '$0', $(enMano), o.retencionMensual > 0 ? pctS(o.alicuotaEfectiva) : '0,00%'];
  });
  const tablaSim = {
    title: 'Cuánto te retiene Ganancias por nivel de sueldo (soltero, 2026)',
    caption: 'Retención mensual estimada de Ganancias para un trabajador soltero sin hijos ni deducciones adicionales. Enero-junio 2026.',
    headers: ['Sueldo bruto', 'Retención mensual', 'Sueldo en mano (aprox.)', 'Alícuota efectiva'],
    rows: simRows,
    highlightCol: 1,
    note: 'En mano = bruto − aportes (17%) − retención de Ganancias, sin contar obra social ni otros descuentos. La alícuota efectiva es sobre el bruto anual (incluye SAC). Cargá tus deducciones reales en la calculadora para tu caso exacto.',
  };

  // Ejemplos resueltos (computados)
  const ej1 = gananciasSueldo({ brutoMensual: 4_000_000, conyuge: false, hijos: 0, otrasDeducciones: 0 });
  const ej2 = gananciasSueldo({ brutoMensual: 5_000_000, conyuge: true, hijos: 2, otrasDeducciones: 0 });
  const examples = [
    {
      title: 'Soltero con sueldo bruto de $4.000.000 (2026)',
      steps: [
        `**Bruto mensual**: $4.000.000. **Aportes (17%)**: ${$(ej1.aportesMensuales)} → **neto de aportes** ${$(ej1.netoDeAportesMensual)}.`,
        `**Deducciones**: solo el mínimo no imponible ${$(MNI_MENSUAL_BASE)} (soltero, sin hijos).`,
        `**Base imponible mensual**: ${$(ej1.netoDeAportesMensual)} − ${$(ej1.mniTotalMensual)} = **${$(ej1.baseImponibleMensual)}**.`,
        `**Retención de Ganancias**: aplicando la escala del art. 94 LIG = **${$(ej1.retencionMensual)}/mes** (alícuota efectiva ${pctS(ej1.alicuotaEfectiva)}).`,
      ],
      result: `Un soltero con $4.000.000 brutos paga aproximadamente **${$(ej1.retencionMensual)} por mes** de Ganancias y queda con cerca de **${$(Math.max(0, Math.round(ej1.netoDeAportesMensual) - ej1.retencionMensual))}** en mano (antes de obra social).`,
    },
    {
      title: 'Casado con 2 hijos y sueldo bruto de $5.000.000 (2026)',
      steps: [
        `**Bruto mensual**: $5.000.000. **Aportes (17%)**: ${$(ej2.aportesMensuales)} → neto ${$(ej2.netoDeAportesMensual)}.`,
        `**Deducciones por familia**: cónyuge + 2 hijos = ${$(ej2.deduccionFamiliaresMensual)}, sumadas al MNI dan ${$(ej2.mniTotalMensual)}.`,
        `**Base imponible**: ${$(ej2.netoDeAportesMensual)} − ${$(ej2.mniTotalMensual)} = **${$(ej2.baseImponibleMensual)}**.`,
        `**Retención**: **${$(ej2.retencionMensual)}/mes** (alícuota efectiva ${pctS(ej2.alicuotaEfectiva)}).`,
      ],
      result: `Con las mismas remuneraciones, las cargas de familia bajan la retención: este caso paga **${$(ej2.retencionMensual)}/mes** vs. los ${$(gananciasSueldo({ brutoMensual: 5_000_000, conyuge: false, hijos: 0, otrasDeducciones: 0 }).retencionMensual)} que pagaría un soltero con el mismo sueldo.`,
    },
  ];

  patchCalc('ganancias-sueldo', [tablaUmbral, tablaSim], examples, ['¿Desde qué sueldo bruto pagás Ganancias', 'Cuánto te retiene Ganancias por nivel']);
}

// ─────────────────────────── 2) ART — INDEMNIZACIÓN ───────────────────────────
{
  const VIB = 1_500_000, EDAD = 40;
  const baremo: Array<[number, string]> = [
    [10, '10% — hernia discal leve'],
    [15, '15% — hernia discal con limitación'],
    [25, '25% — limitación de columna lumbar'],
    [42, '42% — pérdida de visión de un ojo'],
    [50, '50% — parcial con derecho a prestaciones'],
    [65, '65% — amputación de mano'],
    [100, '100% — incapacidad total'],
  ];
  const rows = baremo.map(([p, label]) => {
    const o = artCalc({ sueldoBrutoMensual: VIB, edadTrabajador: EDAD, porcentajeIncapacidad: p });
    return [label, $(o.indemnizacionBaseLRT), $(o.adicional20Ley26773), $(o.indemnizacionUnica)];
  });
  const tabla = {
    title: 'Indemnización ART estimada por porcentaje de incapacidad',
    caption: 'Indemnización por Incapacidad Laboral Permanente (art. 14 Ley 24.557) para un VIB de $1.500.000 y 40 años. Fórmula: 53 × VIB × (65 ÷ edad) × % incapacidad, más el 20% de la Ley 26.773.',
    headers: ['% incapacidad (ejemplo de baremo)', 'Base art. 14 LRT', 'Adicional 20% (Ley 26.773)', 'Total estimado'],
    rows,
    highlightCol: 3,
    note: 'A menor edad la indemnización sube (el factor 65/edad es mayor): a 28 años los montos serían ~43% más altos; a 55 años, ~27% más bajos. El % de incapacidad lo determina la Comisión Médica según el baremo (Decreto 659/96). El monto nunca puede ser inferior al piso mínimo de la Resolución SRT vigente. El 20% no aplica en accidentes in itinere.',
  };

  const e1 = artCalc({ sueldoBrutoMensual: 1_500_000, edadTrabajador: 38, porcentajeIncapacidad: 25 });
  const e2 = artCalc({ sueldoBrutoMensual: 1_800_000, edadTrabajador: 28, porcentajeIncapacidad: 100 });
  const examples = [
    {
      title: 'Hernia discal con 25% de incapacidad, 38 años, sueldo $1.500.000',
      steps: [
        `**Datos**: VIB (sueldo bruto) $1.500.000 · edad 38 · incapacidad 25%.`,
        `**Factor edad** = 65 ÷ 38 = **1,7105**.`,
        `**Base art. 14** = 53 × $1.500.000 × 1,7105 × 0,25 = **${$(e1.indemnizacionBaseLRT)}**.`,
        `**Adicional 20% (Ley 26.773)** = **${$(e1.adicional20Ley26773)}**.`,
      ],
      result: `Le corresponde una indemnización única de aproximadamente **${$(e1.indemnizacionUnica)}**. Es incapacidad parcial (<50%): pago único, sin renta. Verificá que no quede por debajo del piso mínimo SRT vigente.`,
    },
    {
      title: 'Sordera bilateral total (100%), 28 años, sueldo $1.800.000',
      steps: [
        `**Datos**: VIB $1.800.000 · edad 28 · incapacidad 100% (total).`,
        `**Factor edad** = 65 ÷ 28 = **2,3214** (joven → factor alto).`,
        `**Base art. 14** = 53 × $1.800.000 × 2,3214 × 1,00 = **${$(e2.indemnizacionBaseLRT)}**.`,
        `**Adicional 20%** = **${$(e2.adicional20Ley26773)}** → total **${$(e2.indemnizacionUnica)}**.`,
      ],
      result: `Con incapacidad total, le corresponde aproximadamente **${$(e2.indemnizacionUnica)}** y puede optar entre pago único o renta vitalicia (art. 15 LRT). La edad joven eleva mucho la indemnización.`,
    },
  ];

  patchCalc(
    'calculadora-art-indemnizacion-tabla-incapacidad-laboral-permanente',
    [tabla], examples, ['Indemnización ART estimada por porcentaje'],
    (c) => { if (c.dataUpdate) { c.dataUpdate.frequency = 'biannual'; c.dataUpdate.lastUpdated = REVIEW_DATE; } },
  );
}
