export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Biberones necesarios en el primer año
 *
 * Basado en las tablas de alimentación de la AAP (HealthyChildren.org),
 * CDC y Johns Hopkins Medicine. Las tomas diarias varían por mes y tipo
 * de alimentación.
 *
 * Fuentes:
 * - AAP / HealthyChildren.org: https://www.healthychildren.org/Spanish/ages-stages/baby/formula-feeding/Paginas/Amount-and-Schedule-of-Formula-Feedings.aspx
 * - CDC: https://www.cdc.gov/infant-toddler-nutrition/formula-feeding/how-much-and-how-often.html
 * - Johns Hopkins Medicine: https://www.hopkinsmedicine.org/health/wellness-and-prevention/feeding-guide-for-the-first-year
 */

// Tomas diarias promedio por mes según el tipo de alimentación
// Fuente: AAP / CDC / Johns Hopkins Medicine
const TOMAS_FORMULA: number[] = [
  10, // mes 1  (0-1 mes): 8-12 tomas/día, promedio 10
  8,  // mes 2  (1-2 meses): 7-9
  7,  // mes 3  (2-3 meses): 6-8
  6,  // mes 4  (3-4 meses)
  5,  // mes 5  (4-5 meses): 5-7
  5,  // mes 6  (5-6 meses)
  5,  // mes 7  (6-7 meses): complementación, 4-6
  4,  // mes 8  (7-8 meses)
  4,  // mes 9  (8-9 meses)
  4,  // mes 10 (9-10 meses): 3-5
  3,  // mes 11 (10-11 meses)
  3,  // mes 12 (11-12 meses)
];

// Para lactancia mixta: aproximadamente la mitad de las tomas son en biberón
const FACTOR_MIXTA = 0.5;

// Para lactancia materna con extracción ocasional (sacaleches)
// El biberón se usa principalmente para extracciones guardadas (~2-3/día los primeros 6 meses)
const TOMAS_EXTRACCION: number[] = [
  2, 2, 2, 2, 2, 2, // meses 1-6: extracciones 2/día
  1, 1, 1, 1, 1, 1, // meses 7-12: menos extracciones al introducir sólidos
];

const DIAS_MES = 30.44; // promedio días por mes

function tomasPorTipo(tipo: string): number[] {
  switch (tipo) {
    case 'formula':
      return TOMAS_FORMULA;
    case 'mixta':
      return TOMAS_FORMULA.map((t) => Math.round(t * FACTOR_MIXTA));
    case 'extraccion':
      return TOMAS_EXTRACCION;
    default:
      return TOMAS_FORMULA;
  }
}

function calcularBiberonesPhysicos(tipo: string, tomasAnio: number): number {
  // Cantidad de biberones físicos (unidades) a tener en casa
  // Criterio: rotar sin tener que lavar en cada toma (lavado 1-2x/día)
  // Fuente: Kaiya Baby / Bobbie / recomendaciones pediátricas
  if (tipo === 'formula') return 8;   // 8 unidades para fórmula exclusiva
  if (tipo === 'mixta') return 5;     // 5 unidades para mixta
  return 3;                            // 3 unidades para extracción ocasional
}

export function biberonesNecesariosPrimeraInfancia(i: Inputs): Outputs {
  const tipoAlimentacion = String(i.tipo_alimentacion || 'formula');
  const mesesPlanificados = Math.min(12, Math.max(1, Number(i.meses_planificados) || 12));

  const tomas = tomasPorTipo(tipoAlimentacion);

  // Total de tomas (biberones dados) en el período planificado
  let totalTomasAnio = 0;
  for (let m = 0; m < mesesPlanificados; m++) {
    totalTomasAnio += tomas[m] * DIAS_MES;
  }
  const totalRedondeado = Math.round(totalTomasAnio);

  // Biberones físicos (unidades a comprar)
  const biberonesComprar = calcularBiberonesPhysicos(tipoAlimentacion, totalRedondeado);

  // Tetinas de reemplazo (se cambian cada 2-3 meses por desgaste/seguridad)
  const tetinasEstimadas = Math.ceil(mesesPlanificados / 2) * Math.ceil(biberonesComprar / 2);

  // Promedio diario durante el período
  const promedioTomaDiario = Math.round(
    tomas.slice(0, mesesPlanificados).reduce((s, v) => s + v, 0) / mesesPlanificados
  );

  const tipoLabel: Record<string, string> = {
    formula: 'fórmula exclusiva',
    mixta: 'lactancia mixta',
    extraccion: 'lactancia materna con extracción',
  };

  const label = tipoLabel[tipoAlimentacion] ?? tipoAlimentacion;

  // ---- Insight ----
  let insightText = '';
  if (tipoAlimentacion === 'formula') {
    insightText =
      `En ${mesesPlanificados} meses de **${label}** tu bebé tomará alrededor de **${totalRedondeado.toLocaleString('es-AR')} biberones**. ` +
      `Comprá entre **${biberonesComprar} biberones** físicos (para rotar sin lavar cada vez) y repone tetinas cada 2-3 meses.`;
  } else if (tipoAlimentacion === 'mixta') {
    insightText =
      `Con **${label}** se estiman **${totalRedondeado.toLocaleString('es-AR')} biberones** en ${mesesPlanificados} meses. ` +
      `Con **${biberonesComprar} unidades** físicas es suficiente para rotar cómodamente.`;
  } else {
    insightText =
      `Con **${label}**, los biberones se usan principalmente para guardar extracciones. ` +
      `Estimás unas **${totalRedondeado.toLocaleString('es-AR')} sesiones de biberón** en ${mesesPlanificados} meses. ` +
      `Con **${biberonesComprar} biberones** te alcanza.`;
  }

  const _insight = {
    title: 'Estimación de biberones',
    text: insightText,
    tone: 'positive',
    icon: '🍼',
  };

  const __lang = String(i.__lang || 'es');
  if (__lang === 'en') {
    const labelEn: Record<string, string> = {
      formula: 'exclusive formula',
      mixta: 'mixed feeding',
      extraccion: 'breastfeeding with pumping',
    };
    const labelE = labelEn[tipoAlimentacion] ?? tipoAlimentacion;
    _insight.title = 'Bottle estimate';
    _insight.text =
      `Over ${mesesPlanificados} months of **${labelE}**, your baby will need around ` +
      `**${totalRedondeado.toLocaleString('en-US')} bottle feedings** total. ` +
      `Have **${biberonesComprar} physical bottles** on hand to rotate without constant washing.`;
  }

  return {
    total_tomas: totalRedondeado.toString(),
    biberones_comprar: biberonesComprar.toString(),
    tetinas_estimadas: tetinasEstimadas.toString(),
    promedio_diario: promedioTomaDiario.toString(),
    _insight,
  };
}
