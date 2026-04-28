export interface Inputs {
  valor_herencia: number;
  parentesco: 'grupo1' | 'grupo2' | 'grupo3' | 'grupo4';
  ccaa: string;
  edad_heredero: number;
}

export interface Outputs {
  reduccion_aplicada: number;
  base_liquidable: number;
  cuota_integra: number;
  coeficiente_multiplicador: number;
  cuota_antes_bonificacion: number;
  bonificacion_ccaa: number;
  cuota_a_pagar: number;
  tipo_efectivo: number;
  aviso: string;
}

// ---------------------------------------------------------------------------
// Tarifa progresiva estatal — art. 21 Ley 29/1987 (valores vigentes 2026)
// ---------------------------------------------------------------------------
const TRAMOS_ESTATALES: Array<{ hasta: number; cuotaPrevia: number; tipo: number }> = [
  { hasta:    7993.46, cuotaPrevia:       0,     tipo: 7.65 },
  { hasta:   15980.91, cuotaPrevia:     611.50,  tipo: 8.50 },
  { hasta:   23968.36, cuotaPrevia:    1290.43,  tipo: 9.35 },
  { hasta:   31955.81, cuotaPrevia:    2037.26,  tipo: 10.20 },
  { hasta:   39943.26, cuotaPrevia:    2851.98,  tipo: 11.05 },
  { hasta:   47930.72, cuotaPrevia:    3734.59,  tipo: 11.90 },
  { hasta:   55918.17, cuotaPrevia:    4685.10,  tipo: 12.75 },
  { hasta:   63905.62, cuotaPrevia:    5703.50,  tipo: 13.60 },
  { hasta:   71893.07, cuotaPrevia:    6789.79,  tipo: 14.45 },
  { hasta:   79880.52, cuotaPrevia:    7943.98,  tipo: 15.30 },
  { hasta:  119757.67, cuotaPrevia:    9166.06,  tipo: 16.15 },
  { hasta:  159634.83, cuotaPrevia:   15606.22,  tipo: 18.70 },
  { hasta:  239389.13, cuotaPrevia:   23063.25,  tipo: 21.25 },
  { hasta:  398777.54, cuotaPrevia:   40011.04,  tipo: 25.50 },
  { hasta:  797555.08, cuotaPrevia:   80655.08,  tipo: 29.75 },
  { hasta: Infinity,   cuotaPrevia:  199291.40,  tipo: 34.00 },
];

function tarifaEstatal(base: number): number {
  if (base <= 0) return 0;
  for (let i = 0; i < TRAMOS_ESTATALES.length; i++) {
    const tramo = TRAMOS_ESTATALES[i];
    const limiteInferior = i === 0 ? 0 : TRAMOS_ESTATALES[i - 1].hasta;
    if (base <= tramo.hasta) {
      return tramo.cuotaPrevia + (base - limiteInferior) * (tramo.tipo / 100);
    }
  }
  // Último tramo
  const ultimo = TRAMOS_ESTATALES[TRAMOS_ESTATALES.length - 1];
  const penultimo = TRAMOS_ESTATALES[TRAMOS_ESTATALES.length - 2];
  return ultimo.cuotaPrevia + (base - penultimo.hasta) * (ultimo.tipo / 100);
}

// ---------------------------------------------------------------------------
// Coeficientes multiplicadores mínimos (patrimonio preexistente ≤ 402.678,11€)
// art. 22 Ley 29/1987
// ---------------------------------------------------------------------------
const COEF_MIN: Record<string, number> = {
  grupo1: 1.0000,
  grupo2: 1.0000,
  grupo3: 1.5882,
  grupo4: 2.0000,
};

// ---------------------------------------------------------------------------
// Reducciones estatales base — art. 20 Ley 29/1987 (2026)
// Grupo I: 15.956,87 € + 3.990,72 € × (20 − edad) para menores de 21
// Grupo II: 15.956,87 €
// Grupo III: 7.993,46 €
// Grupo IV: 0 €
// ---------------------------------------------------------------------------
function reduccionEstatal(parentesco: string, edad: number): number {
  switch (parentesco) {
    case 'grupo1': {
      const aniosRestantes = Math.max(0, 20 - Math.floor(edad));
      return 15956.87 + 3990.72 * aniosRestantes;
    }
    case 'grupo2': return 15956.87;
    case 'grupo3': return 7993.46;
    default:       return 0;
  }
}

// ---------------------------------------------------------------------------
// Configuración autonómica 2026
// Cada entrada: { reduccionGrupo12, reduccionGrupo34, bonifGrupo12, bonifGrupo34, nota }
// reduccion*: reducción adicional en base imponible (sobre la estatal) en €
// bonif*: porcentaje de bonificación sobre la cuota (0-1)
// ---------------------------------------------------------------------------
interface CCAACfg {
  reduccionGrupo12: number;  // reducción adicional en base (€)
  reduccionGrupo34: number;
  bonifGrupo12: number;      // bonificación sobre cuota (fracción 0-1)
  bonifGrupo34: number;
  nota: string;
}

const CCAA_CFG: Record<string, CCAACfg> = {
  // Fuente: normativa autonómica vigente a 2026-04-28
  andalucia: {
    reduccionGrupo12: 1000000,  // reducción de 1M€ para grupos I-II (Decreto-Ley 1/2022 Andalucía)
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,         // bonificación 99% sobre cuota
    bonifGrupo34: 0,
    nota: 'Andalucía: reducción de 1.000.000€ para Grupos I y II; bonificación 99% sobre cuota (Decreto-Ley 1/2022).'
  },
  aragon: {
    reduccionGrupo12: 500000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.65,
    bonifGrupo34: 0,
    nota: 'Aragón: reducción 500.000€ Grupos I-II; bonificación 65% cuota (Ley de Tributos Cedidos Aragón 2023).'
  },
  asturias: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 0,
    bonifGrupo34: 0,
    nota: 'Asturias: sin bonificación autonómica relevante. Se aplica tarifa estatal con reducciones mínimas.'
  },
  baleares: {
    reduccionGrupo12: 25000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0,            // Baleares tiene tarifa reducida propia; se aproxima sin bonificación adicional
    bonifGrupo34: 0,
    nota: 'Baleares: tarifa autonómica reducida propia. Resultado es aproximación; consultar normativa balear vigente.'
  },
  canarias: {
    reduccionGrupo12: 55918.87,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.999,        // bonificación 99,9% Grupos I-II
    bonifGrupo34: 0,
    nota: 'Canarias: bonificación del 99,9% para Grupos I y II (Ley Tributos Cedidos Canarias).'
  },
  cantabria: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 1.0,          // bonificación 100%
    bonifGrupo34: 0,
    nota: 'Cantabria: bonificación del 100% para Grupos I y II. Cuota efectiva cero.'
  },
  castilla_la_mancha: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 1.0,
    bonifGrupo34: 0,
    nota: 'Castilla-La Mancha: bonificación del 100% para Grupos I y II. Cuota efectiva cero.'
  },
  castilla_leon: {
    reduccionGrupo12: 400000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,
    bonifGrupo34: 0,
    nota: 'Castilla y León: reducción 400.000€ Grupos I-II; bonificación 99% cuota (Ley 9/2019).'
  },
  cataluna: {
    reduccionGrupo12: 100000,   // reducción base 100.000€ hijos ≥21 / cónyuge; Cataluña usa tarifa propia pero aproximamos con estatal + reducción
    reduccionGrupo34: 0,
    bonifGrupo12: 0.0,          // Cataluña: bonificación en cuota muy baja para patrimonios altos; se aproxima a 0
    bonifGrupo34: 0,
    nota: 'Cataluña: reducción de 100.000€ para Grupos I-II; tarifa autonómica propia. Resultado es aproximación. Consultar Agència Tributària de Catalunya.'
  },
  extremadura: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,
    bonifGrupo34: 0,
    nota: 'Extremadura: bonificación 99% para Grupos I y II (Ley 5/2023 Hacienda Extremeña).'
  },
  galicia: {
    reduccionGrupo12: 1000000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,
    bonifGrupo34: 0,
    nota: 'Galicia: reducción de 1.000.000€ para Grupos I y II; bonificación 99% cuota (Lei 13/2023).'
  },
  la_rioja: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,
    bonifGrupo34: 0,
    nota: 'La Rioja: bonificación 99% cuota Grupos I y II (Ley Tributaria La Rioja 2021).'
  },
  madrid: {
    reduccionGrupo12: 500000,   // Madrid: reducción 500.000€ por heredero en Grupos I-II
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,         // bonificación 99% cuota
    bonifGrupo34: 0,
    nota: 'Madrid: reducción de 500.000€ para Grupos I y II + bonificación 99% sobre la cuota (Ley 7/2005 CCAA Madrid).'
  },
  murcia: {
    reduccionGrupo12: 0,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.99,
    bonifGrupo34: 0,
    nota: 'Murcia: bonificación 99% cuota para Grupos I y II (Ley Tributos Cedidos Murcia).'
  },
  navarra: {
    reduccionGrupo12: 250000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0,
    bonifGrupo34: 0,
    nota: 'Navarra: régimen foral propio. Resultado es aproximación con escala estatal. Consultar Hacienda Foral de Navarra para cálculo exacto.'
  },
  pais_vasco: {
    reduccionGrupo12: 400000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0,
    bonifGrupo34: 0,
    nota: 'País Vasco: régimen foral propio con tipos y reducciones distintos. Resultado es aproximación. Consultar Hacienda Foral correspondiente (Álava, Bizkaia o Gipuzkoa).'
  },
  valencia: {
    reduccionGrupo12: 100000,
    reduccionGrupo34: 0,
    bonifGrupo12: 0.75,
    bonifGrupo34: 0,
    nota: 'Comunitat Valenciana: reducción 100.000€ Grupos I-II; bonificación 75% cuota (Ley 13/1997 CV).'
  },
};

const CCAA_DEFAULT: CCAACfg = {
  reduccionGrupo12: 0,
  reduccionGrupo34: 0,
  bonifGrupo12: 0,
  bonifGrupo34: 0,
  nota: 'CCAA no reconocida. Se aplica únicamente la escala estatal sin bonificación autonómica.'
};

// ---------------------------------------------------------------------------
export function compute(i: Inputs): Outputs {
  const valorHerencia = Math.max(0, i.valor_herencia || 0);
  const parentesco = i.parentesco || 'grupo2';
  const ccaa = (i.ccaa || '').toLowerCase();
  const edad = Math.max(0, Math.min(99, i.edad_heredero || 35));

  const cfg: CCAACfg = CCAA_CFG[ccaa] ?? CCAA_DEFAULT;

  // --- Reducción estatal base ---
  const redEstatal = reduccionEstatal(parentesco, edad);

  // --- Reducción adicional autonómica ---
  const esGrupo12 = parentesco === 'grupo1' || parentesco === 'grupo2';
  const redAdicionalCCAA = esGrupo12 ? cfg.reduccionGrupo12 : cfg.reduccionGrupo34;

  // La reducción total no puede superar el valor de la herencia
  const reduccionTotal = Math.min(valorHerencia, redEstatal + redAdicionalCCAA);

  // --- Base liquidable ---
  const baseLiquidable = Math.max(0, valorHerencia - reduccionTotal);

  // --- Cuota íntegra estatal ---
  const cuotaIntegra = tarifaEstatal(baseLiquidable);

  // --- Coeficiente multiplicador (mínimo, patrimonio ≤ 402.678,11€) ---
  const coef = COEF_MIN[parentesco] ?? 2.0;
  const cuotaAntesBoif = cuotaIntegra * coef;

  // --- Bonificación autonómica ---
  const pctBonif = esGrupo12 ? cfg.bonifGrupo12 : cfg.bonifGrupo34;
  const bonificacion = cuotaAntesBoif * pctBonif;
  const cuotaFinal = Math.max(0, cuotaAntesBoif - bonificacion);

  // --- Tipo efectivo sobre herencia bruta ---
  const tipoEfectivo = valorHerencia > 0 ? (cuotaFinal / valorHerencia) * 100 : 0;

  return {
    reduccion_aplicada:        Math.round(reduccionTotal * 100) / 100,
    base_liquidable:           Math.round(baseLiquidable * 100) / 100,
    cuota_integra:             Math.round(cuotaIntegra * 100) / 100,
    coeficiente_multiplicador: Math.round(coef * 10000) / 10000,
    cuota_antes_bonificacion:  Math.round(cuotaAntesBoif * 100) / 100,
    bonificacion_ccaa:         Math.round(bonificacion * 100) / 100,
    cuota_a_pagar:             Math.round(cuotaFinal * 100) / 100,
    tipo_efectivo:             Math.round(tipoEfectivo * 100) / 100,
    aviso: cfg.nota,
  };
}
