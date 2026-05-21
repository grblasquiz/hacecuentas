/**
 * Calculadora "Tu Monotributo vs categoría óptima 2026".
 *
 * Compara la facturación últimos 12 meses contra la tabla oficial ARCA
 * vigente desde febrero 2026 y devuelve:
 *   - La categoría que CORRESPONDE según facturación
 *   - La cuota mensual de esa categoría
 *   - Diferencia con la cuota actual del usuario
 *   - Si excede cat K → debe pasar a RI
 *
 * Fuente: ARCA, escala monotributo vigente desde 2026-02-01.
 * Próxima actualización esperada: julio-agosto 2026 (recate cuatrimestral).
 */

// Tabla oficial Monotributo 2026 (vigente desde 1-feb-2026).
// Cuando ARCA publique nueva tabla (jul-ago 2026), actualizar y bump
// lastReviewed en monotributo-vs-categoria-optima.json.
interface CategoriaMonotributo {
  letra: string;
  topeFacturacionAnual: number;
  cuotaServicios: number;
  cuotaBienes: number;
}

const TABLA_2026: CategoriaMonotributo[] = [
  { letra: 'A', topeFacturacionAnual: 10_277_988, cuotaServicios: 42_387, cuotaBienes: 42_387 },
  { letra: 'B', topeFacturacionAnual: 15_058_448, cuotaServicios: 48_251, cuotaBienes: 48_251 },
  { letra: 'C', topeFacturacionAnual: 21_113_697, cuotaServicios: 56_502, cuotaBienes: 55_227 },
  { letra: 'D', topeFacturacionAnual: 26_212_853, cuotaServicios: 72_414, cuotaBienes: 70_661 },
  { letra: 'E', topeFacturacionAnual: 30_833_964, cuotaServicios: 102_538, cuotaBienes: 92_658 },
  { letra: 'F', topeFacturacionAnual: 38_642_048, cuotaServicios: 129_045, cuotaBienes: 111_198 },
  { letra: 'G', topeFacturacionAnual: 46_211_109, cuotaServicios: 197_108, cuotaBienes: 135_918 },
  { letra: 'H', topeFacturacionAnual: 70_113_407, cuotaServicios: 447_347, cuotaBienes: 272_063 },
  { letra: 'I', topeFacturacionAnual: 78_479_212, cuotaServicios: 824_802, cuotaBienes: 406_512 },
  { letra: 'J', topeFacturacionAnual: 89_872_640, cuotaServicios: 999_008, cuotaBienes: 497_059 },
  { letra: 'K', topeFacturacionAnual: 108_357_084, cuotaServicios: 1_381_688, cuotaBienes: 600_880 },
];

const FECHA_VIGENCIA = '2026-02-01';

export interface MonotributoCategoriaOptimaInputs {
  facturacion12meses: number;
  tipoActividad: 'servicios' | 'bienes';
  categoriaActualLetra?: string; // opcional — si la pasa, calculamos delta
}

export interface MonotributoCategoriaOptimaOutputs {
  categoriaCorrecta: string;
  topeCategoria: number;
  cuotaMensualCorrecta: number;
  cuotaAnualCorrecta: number;
  diagnostico: string;
  ahorroAnualSiCambias: number;
  margenHastaSiguienteCat: number;
  vigenciaTabla: string;
}

export function monotributoVsCategoriaOptima(
  inputs: MonotributoCategoriaOptimaInputs
): MonotributoCategoriaOptimaOutputs {
  const facturacion = Number(inputs.facturacion12meses);
  const tipo = inputs.tipoActividad === 'bienes' ? 'bienes' : 'servicios';
  const categoriaActualLetra = (inputs.categoriaActualLetra || '').toUpperCase().trim();

  if (!facturacion || facturacion < 0) {
    throw new Error('Ingresá tu facturación de los últimos 12 meses');
  }

  // Casos extremos
  if (facturacion === 0) {
    return {
      categoriaCorrecta: 'A',
      topeCategoria: TABLA_2026[0].topeFacturacionAnual,
      cuotaMensualCorrecta: TABLA_2026[0].cuotaServicios,
      cuotaAnualCorrecta: TABLA_2026[0].cuotaServicios * 12,
      diagnostico: 'Sin facturación → categoría A (mínima)',
      ahorroAnualSiCambias: 0,
      margenHastaSiguienteCat: TABLA_2026[0].topeFacturacionAnual,
      vigenciaTabla: FECHA_VIGENCIA,
    };
  }

  // Si supera tope K → RI obligatorio
  const topeMaximo = TABLA_2026[TABLA_2026.length - 1].topeFacturacionAnual;
  if (facturacion > topeMaximo) {
    return {
      categoriaCorrecta: 'RI',
      topeCategoria: topeMaximo,
      cuotaMensualCorrecta: 0,
      cuotaAnualCorrecta: 0,
      diagnostico: `Tu facturación supera el tope de cat K ($${topeMaximo.toLocaleString('es-AR')}/año). Debés inscribirte en el Régimen General (Responsable Inscripto). Consultá con un contador para hacer el pase.`,
      ahorroAnualSiCambias: 0,
      margenHastaSiguienteCat: 0,
      vigenciaTabla: FECHA_VIGENCIA,
    };
  }

  // Encontrar la categoría correcta (la primera cuyo tope >= facturación)
  let correcta: CategoriaMonotributo | null = null;
  let siguiente: CategoriaMonotributo | null = null;
  for (let i = 0; i < TABLA_2026.length; i++) {
    if (facturacion <= TABLA_2026[i].topeFacturacionAnual) {
      correcta = TABLA_2026[i];
      siguiente = TABLA_2026[i + 1] || null;
      break;
    }
  }
  if (!correcta) correcta = TABLA_2026[TABLA_2026.length - 1];

  const cuotaCorrecta = tipo === 'bienes' ? correcta.cuotaBienes : correcta.cuotaServicios;

  let ahorroAnual: number | null = null;
  if (categoriaActualLetra && categoriaActualLetra !== correcta.letra) {
    const actual = TABLA_2026.find((c) => c.letra === categoriaActualLetra);
    if (actual) {
      const cuotaActual = tipo === 'bienes' ? actual.cuotaBienes : actual.cuotaServicios;
      ahorroAnual = (cuotaActual - cuotaCorrecta) * 12;
    }
  }

  let diagnostico: string;
  if (categoriaActualLetra && categoriaActualLetra === correcta.letra) {
    diagnostico = `Estás en la categoría correcta (${correcta.letra}). Tu facturación encaja sin problema en el tope de $${correcta.topeFacturacionAnual.toLocaleString('es-AR')}/año.`;
  } else if (categoriaActualLetra && ahorroAnual !== null) {
    if (ahorroAnual > 0) {
      diagnostico = `Estás pagando de más. Tu categoría correcta es ${correcta.letra} (no ${categoriaActualLetra}). Ahorrarías $${Math.round(ahorroAnual).toLocaleString('es-AR')}/año si recategorizás.`;
    } else if (ahorroAnual < 0) {
      diagnostico = `Estás subcategorizado — facturás más que el tope de ${categoriaActualLetra}. Debés pasarte a ${correcta.letra} ($${Math.abs(Math.round(ahorroAnual)).toLocaleString('es-AR')}/año más de cuota, pero evitás multas/exclusión).`;
    } else {
      diagnostico = `Tu categoría correcta es ${correcta.letra}. La cuota es la misma que la de ${categoriaActualLetra} (categoría A o B).`;
    }
  } else {
    diagnostico = `Te corresponde la categoría ${correcta.letra}. Cuota mensual ${tipo}: $${cuotaCorrecta.toLocaleString('es-AR')}.`;
  }

  const margen = correcta.topeFacturacionAnual - facturacion;

  return {
    categoriaCorrecta: correcta.letra,
    topeCategoria: correcta.topeFacturacionAnual,
    cuotaMensualCorrecta: cuotaCorrecta,
    cuotaAnualCorrecta: cuotaCorrecta * 12,
    diagnostico,
    ahorroAnualSiCambias: ahorroAnual,
    margenHastaSiguienteCat: margen,
    vigenciaTabla: FECHA_VIGENCIA,
  };
}
