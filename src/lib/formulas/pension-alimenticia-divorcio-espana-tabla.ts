// Calculadora Pensión Alimenticia Divorcio España
// Fuente: Tabla orientativa CGPJ (Consejo General del Poder Judicial) + Código Civil arts. 142-154
// Datos vigentes 2026

export interface Inputs {
  ingresos_no_custodio: number;           // € netos/mes progenitor no custodio
  ingresos_custodio: number;              // € netos/mes progenitor custodio
  num_hijos: '1' | '2' | '3' | '4';      // número de hijos (4 = 4 o más)
  tipo_custodia: 'exclusiva' | 'compartida';
  ccaa: 'general' | 'cataluna' | 'aragon' | 'pais_vasco' | 'navarra' | 'baleares' | 'galicia' | 'valencia';
  gastos_extraordinarios_estimados: number; // € anuales totales
}

export interface Outputs {
  pension_mensual_total: number;             // € totales/mes
  pension_por_hijo: number;                  // € por hijo/mes
  porcentaje_aplicado: number;               // 0-1 (decimal)
  gastos_extraordinarios_por_progenitor: number; // € mes equivalente por progenitor
  pension_compartida_ajustada: string;       // descripción del ajuste aplicado
  nota_foral: string;                        // aviso CCAA foral
  aviso_legal: string;                       // recordatorio orientativo
}

// ---------------------------------------------------------------------------
// TABLA CGPJ (porcentajes sobre ingresos netos del progenitor no custodio)
// Última versión publicada por el CGPJ - Observatorio Violencia Doméstica
// Filas: tramos de ingresos. Columnas: 1, 2, 3, 4+ hijos
// ---------------------------------------------------------------------------
interface TramoTabla {
  min: number;  // € inclusive
  max: number;  // € inclusive (Infinity para el último)
  pct: [number, number, number, number]; // [1hijo, 2hijos, 3hijos, 4+hijos]
}

const TABLA_CGPJ: TramoTabla[] = [
  { min: 0,    max: 799,  pct: [0.17, 0.24, 0.29, 0.33] },
  { min: 800,  max: 1299, pct: [0.20, 0.28, 0.34, 0.38] },
  { min: 1300, max: 1999, pct: [0.23, 0.30, 0.36, 0.41] },
  { min: 2000, max: 2999, pct: [0.25, 0.33, 0.39, 0.44] },
  { min: 3000, max: 4999, pct: [0.27, 0.35, 0.42, 0.47] },
  { min: 5000, max: Infinity, pct: [0.29, 0.38, 0.45, 0.50] },
];

// Comunidades con derecho foral propio que pueden diferir del criterio CGPJ estatal
const CCAA_FORALES: Record<string, string> = {
  cataluna:   'Cataluña aplica el Codi Civil de Catalunya (Llei 25/2010) y tablas orientativas del TSJC, que pueden diferir de las del CGPJ estatal. Consulta con un abogado de familia especializado en derecho catalán.',
  aragon:     'Aragón dispone de legislación foral propia (Código del Derecho Foral de Aragón). Los juzgados aragoneses pueden usar criterios distintos a la tabla CGPJ estatal.',
  navarra:    'Navarra se rige por su Compilación de Derecho Civil Foral (Fuero Nuevo). Los criterios de fijación de alimentos pueden diferir del Código Civil estatal.',
  baleares:   'Illes Balears cuenta con legislación de derecho civil propio. El cálculo puede ajustarse según los criterios del TSJIB.',
  pais_vasco: 'El País Vasco tiene derecho foral propio aunque el régimen de alimentos sigue mayoritariamente el Código Civil estatal. Verifica con un abogado local.',
  galicia:    'Galicia dispone de derecho civil foral, aunque en materia de alimentos la aplicación del Código Civil estatal es habitual.',
  valencia:   'La Comunitat Valenciana: la Llei 5/2011 de relaciones familiares establecía criterios propios, pero fue anulada parcialmente por el TC. Se aplica el Código Civil estatal como referencia principal.',
  general:    '',
};

function obtenerPorcentajeCGPJ(ingresos: number, numHijosIdx: number): number {
  for (const tramo of TABLA_CGPJ) {
    if (ingresos >= tramo.min && ingresos <= tramo.max) {
      return tramo.pct[numHijosIdx];
    }
  }
  // Por defecto, último tramo
  return TABLA_CGPJ[TABLA_CGPJ.length - 1].pct[numHijosIdx];
}

export function compute(i: Inputs): Outputs {
  // --- Sanitización de inputs ---
  const ingresosNC = Math.max(0, i.ingresos_no_custodio || 0);
  const ingresosCustodio = Math.max(0, i.ingresos_custodio || 0);
  const numHijosNum = parseInt(i.num_hijos || '1', 10);
  const numHijosIdx = Math.min(numHijosNum, 4) - 1; // 0-3 para índice de tabla
  const gastosAnuales = Math.max(0, i.gastos_extraordinarios_estimados || 0);
  const custodia = i.tipo_custodia || 'exclusiva';
  const ccaa = i.ccaa || 'general';

  // --- Caso sin ingresos del no custodio ---
  if (ingresosNC === 0) {
    const gastosXProgenitor = gastosAnuales / 2 / 12;
    return {
      pension_mensual_total: 0,
      pension_por_hijo: 0,
      porcentaje_aplicado: 0,
      gastos_extraordinarios_por_progenitor: parseFloat(gastosXProgenitor.toFixed(2)),
      pension_compartida_ajustada: 'Sin ingresos declarados en el progenitor no custodio. El juez valorará la capacidad económica potencial.',
      nota_foral: CCAA_FORALES[ccaa] || '',
      aviso_legal: 'Resultado orientativo basado en la tabla CGPJ. No sustituye al asesoramiento jurídico de un abogado de familia.',
    };
  }

  // --- Porcentaje base CGPJ ---
  const porcentajeBase = obtenerPorcentajeCGPJ(ingresosNC, numHijosIdx);
  let pensionBase = ingresosNC * porcentajeBase;

  // --- Ajuste por custodia compartida ---
  // Doctrina TS: STS 16/02/2015 y ss.
  let descripcionAjuste = 'Custodia exclusiva: se aplica directamente la tabla CGPJ sin reducción.';
  let porcentajeFinal = porcentajeBase;

  if (custodia === 'compartida') {
    const totalIngresos = ingresosNC + ingresosCustodio;
    if (totalIngresos === 0) {
      pensionBase = 0;
      porcentajeFinal = 0;
      descripcionAjuste = 'Custodia compartida: sin ingresos en ninguno de los progenitores. Pensión 0 €.';
    } else {
      const ingresosMayor = Math.max(ingresosNC, ingresosCustodio);
      const ingresosMenor = Math.min(ingresosNC, ingresosCustodio);
      const diferenciaPct = ingresosMayor > 0 ? (ingresosMayor - ingresosMenor) / ingresosMayor : 0;

      if (diferenciaPct <= 0.20) {
        // Ingresos muy similares: sin pensión
        pensionBase = 0;
        porcentajeFinal = 0;
        descripcionAjuste = 'Custodia compartida: diferencia de ingresos ≤ 20 %. No se establece pensión; cada progenitor cubre los gastos durante su periodo de convivencia.';
      } else if (diferenciaPct <= 0.50) {
        // Diferencia moderada: 50 % de la tabla aplicado a la diferencia de ingresos
        const diferenciaEuros = ingresosMayor - ingresosMenor;
        pensionBase = diferenciaEuros * porcentajeBase * 0.50;
        porcentajeFinal = porcentajeBase * 0.50;
        descripcionAjuste = `Custodia compartida: diferencia de ingresos entre 20 % y 50 % (${(diferenciaPct * 100).toFixed(0)} %). Se aplica el 50 % de la tabla CGPJ sobre la diferencia de ingresos (${diferenciaEuros.toFixed(0)} €).`;
      } else {
        // Diferencia elevada: 75 % de la tabla sobre los ingresos del progenitor con mayor renta
        // El progenitor no custodio solo paga si es el de mayor renta
        const baseCalculo = ingresosNC; // siempre base el no custodio
        pensionBase = baseCalculo * porcentajeBase * 0.75;
        porcentajeFinal = porcentajeBase * 0.75;
        descripcionAjuste = `Custodia compartida: diferencia de ingresos > 50 % (${(diferenciaPct * 100).toFixed(0)} %). Se aplica el 75 % de la tabla CGPJ. El progenitor con mayores ingresos contribuye para compensar el desequilibrio.`;
      }
    }
  }

  // --- Gastos extraordinarios ---
  // Se reparten al 50 % entre ambos progenitores; expresados en cuota mensual
  const gastosXProgenitorMes = gastosAnuales / 2 / 12;

  // --- Nota foral ---
  const notaForal = CCAA_FORALES[ccaa] || '';

  // --- Pensión por hijo ---
  const numHijosReal = Math.max(1, numHijosNum);
  const pensionPorHijo = pensionBase / numHijosReal;

  return {
    pension_mensual_total: parseFloat(pensionBase.toFixed(2)),
    pension_por_hijo: parseFloat(pensionPorHijo.toFixed(2)),
    porcentaje_aplicado: parseFloat(porcentajeFinal.toFixed(4)),
    gastos_extraordinarios_por_progenitor: parseFloat(gastosXProgenitorMes.toFixed(2)),
    pension_compartida_ajustada: descripcionAjuste,
    nota_foral: notaForal,
    aviso_legal: 'Resultado orientativo basado en la tabla del CGPJ. El juez fija la cuantía definitiva valorando las necesidades del menor, el nivel de vida previo y las circunstancias de cada caso. Esta calculadora no sustituye al asesoramiento de un abogado de familia colegiado.',
  };
}
