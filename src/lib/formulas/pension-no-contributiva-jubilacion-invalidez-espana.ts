// Pensión No Contributiva España 2026
// Fuente: IMSERSO / Real Decreto revalorización pensiones 2026

export interface Inputs {
  tipo_pension: 'jubilacion' | 'invalidez';
  edad: number;
  grado_discapacidad: number;
  miembros_unidad: '1' | '2' | '3' | '4' | '5';
  ingresos_propios_anuales: number;
  ingresos_unidad_anuales: number;
  comunidad_autonoma: string;
}

export interface Outputs {
  elegible: string;
  limite_renta_anual: number;
  renta_computable_total: number;
  cuantia_anual_estado: number;
  cuantia_mensual_estado: number;
  complemento_ccaa: number;
  total_anual: number;
  aviso: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (IMSERSO / BOE) ---
  const CUANTIA_INTEGRA_ANUAL = 7614.42; // €/año (14 pagas)
  // Límites de renta por número de miembros de la unidad económica de convivencia
  // Fuente: IMSERSO 2026. Fórmula base: 250% cuantía íntegra + 70% por cada miembro adicional a partir del 2.º
  const LIMITES_RENTA: Record<string, number> = {
    '1': 7614.42,
    '2': 12984.08,
    '3': 18218.73,
    '4': 23453.39,
    '5': 28688.04
  };
  // Porcentaje mínimo reconocible cuando hay convivientes (25% de la cuantía íntegra)
  const PORCENTAJE_MINIMO = 0.25;
  const CUANTIA_MINIMA = CUANTIA_INTEGRA_ANUAL * PORCENTAJE_MINIMO; // 1.903,61 €

  // --- Complementos autonómicos estimados 2026 (€/año) ---
  // Son orientativos; dependen de la normativa autonómica vigente en cada ejercicio.
  const COMPLEMENTOS_CCAA: Record<string, number> = {
    ninguno: 0,
    andalucia: 0,
    aragon: 0,
    asturias: 180,
    baleares: 0,
    canarias: 0,
    cantabria: 0,
    castilla_la_mancha: 0,
    castilla_leon: 0,
    cataluna: 300,
    extremadura: 0,
    galicia: 0,
    la_rioja: 0,
    madrid: 0,
    murcia: 0,
    navarra: 400,
    pais_vasco: 500,
    valencia: 0,
    ceuta: 0,
    melilla: 0
  };

  const avisos: string[] = [];
  let elegible = true;

  // --- Validación de requisitos básicos ---
  if (i.tipo_pension === 'jubilacion') {
    if (i.edad < 65) {
      elegible = false;
      avisos.push('Para la pensión de jubilación se requieren 65 años cumplidos.');
    }
  } else if (i.tipo_pension === 'invalidez') {
    if (i.edad < 18 || i.edad > 64) {
      elegible = false;
      avisos.push('La pensión de invalidez exige tener entre 18 y 64 años.');
    }
    if (i.grado_discapacidad < 65) {
      elegible = false;
      avisos.push('Se requiere un grado de discapacidad reconocido igual o superior al 65%.');
    }
  }

  // --- Límite de renta aplicable ---
  const miembrosKey = i.miembros_unidad in LIMITES_RENTA ? i.miembros_unidad : '5';
  const limiteRentaAnual = LIMITES_RENTA[miembrosKey];

  // --- Renta computable total ---
  const ingresosPropios = Math.max(0, i.ingresos_propios_anuales || 0);
  const ingresosUnidad = Math.max(0, i.ingresos_unidad_anuales || 0);
  const rentaComputableTotal = ingresosPropios + ingresosUnidad;

  // --- Comprobación límite de renta ---
  if (rentaComputableTotal >= limiteRentaAnual && elegible) {
    elegible = false;
    avisos.push(
      `La renta computable total (${rentaComputableTotal.toFixed(2)}€) supera o iguala el límite anual de ${limiteRentaAnual.toFixed(2)}€ para ${miembrosKey} miembro(s). No se tiene derecho a la pensión.`
    );
  }

  // --- Cálculo de la cuantía proporcional ---
  let cuantiaAnualEstado = 0;

  if (elegible) {
    if (rentaComputableTotal <= 0) {
      // Sin ingresos: cuantía íntegra
      cuantiaAnualEstado = CUANTIA_INTEGRA_ANUAL;
    } else {
      // Fórmula proporcional: Cuantía = Cuantía_íntegra × (1 - R / L)
      const cuantiaCalculada = CUANTIA_INTEGRA_ANUAL * (1 - rentaComputableTotal / limiteRentaAnual);

      if (parseInt(miembrosKey) > 1) {
        // Con convivientes se aplica cuantía mínima del 25%
        cuantiaAnualEstado = Math.max(cuantiaCalculada, CUANTIA_MINIMA);
        if (cuantiaCalculada < CUANTIA_MINIMA) {
          avisos.push(
            `La cuantía calculada (${cuantiaCalculada.toFixed(2)}€) es inferior al mínimo del 25% (${CUANTIA_MINIMA.toFixed(2)}€). Se aplica la cuantía mínima.`
          );
        }
      } else {
        cuantiaAnualEstado = Math.max(cuantiaCalculada, 0);
      }
    }
    if (cuantiaAnualEstado < 1) {
      cuantiaAnualEstado = 0;
      elegible = false;
      avisos.push('La cuantía resultante es inferior a 1€ anuales; en la práctica no se reconoce derecho.');
    }
  }

  // --- Cuantía mensual (referenciada a 14 pagas) ---
  const cuantiaMensualEstado = cuantiaAnualEstado / 14;

  // --- Complemento autonómico ---
  const ccaa = i.comunidad_autonoma || 'ninguno';
  const complementoCCAA = elegible ? (COMPLEMENTOS_CCAA[ccaa] ?? 0) : 0;

  if (elegible && complementoCCAA > 0) {
    avisos.push(
      `Tu comunidad autónoma (${ccaa}) dispone de un complemento estimado de ${complementoCCAA.toFixed(2)}€/año. Consulta con tu Consejería de Servicios Sociales para confirmarlo.`
    );
  }
  if (elegible && (ccaa === 'ninguno' || complementoCCAA === 0)) {
    avisos.push('No se ha identificado un complemento autonómico específico para tu comunidad o no has seleccionado comunidad.');
  }

  // --- Total anual ---
  const totalAnual = cuantiaAnualEstado + complementoCCAA;

  // --- Texto de elegibilidad ---
  const elegibleTexto = elegible
    ? '✅ En principio cumples los requisitos básicos. Solicita confirmación oficial en el IMSERSO o Servicios Sociales.'
    : '❌ No cumples alguno de los requisitos básicos según los datos introducidos. Revisa las observaciones.';

  // --- Aviso general ---
  avisos.push(
    'Este resultado es una estimación orientativa. La resolución definitiva corresponde al IMSERSO o al organismo autonómico competente.'
  );

  return {
    elegible: elegibleTexto,
    limite_renta_anual: parseFloat(limiteRentaAnual.toFixed(2)),
    renta_computable_total: parseFloat(rentaComputableTotal.toFixed(2)),
    cuantia_anual_estado: parseFloat(cuantiaAnualEstado.toFixed(2)),
    cuantia_mensual_estado: parseFloat(cuantiaMensualEstado.toFixed(2)),
    complemento_ccaa: parseFloat(complementoCCAA.toFixed(2)),
    total_anual: parseFloat(totalAnual.toFixed(2)),
    aviso: avisos.join(' | ')
  };
}
