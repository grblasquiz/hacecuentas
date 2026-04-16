/** Categoría ideal de monotributo Argentina 2026
 *  Tabla de categorías según facturación, superficie, etc.
 *  Valores estimados para 2026 (actualización enero)
 */

export interface Inputs {
  facturacionAnual: number;
  actividad: string;
  superficieAfectada: number;
  energiaAnual: number;
  alquilerAnual: number;
}

export interface Outputs {
  categoriaIdeal: string;
  cuotaMensual: number;
  facturacionMaxima: number;
  margenDisponible: number;
  componenteImpositivo: number;
  componenteJubilatorio: number;
  componenteObraSocial: number;
  formula: string;
  explicacion: string;
}

interface Categoria {
  letra: string;
  factServicios: number;
  factVenta: number;
  impositivo: number;
  jubilatorio: number;
  obraSocial: number;
  superficie: number;
  energia: number;
  alquiler: number;
}

// Tabla monotributo 2026 estimada (actualización enero 2026)
// Valores aproximados basados en tendencia de actualización
const CATEGORIAS: Categoria[] = [
  { letra: 'A', factServicios: 7_813_063, factVenta: 7_813_063, impositivo: 3_591, jubilatorio: 13_166, obraSocial: 16_478, superficie: 30, energia: 3330, alquiler: 219_014 },
  { letra: 'B', factServicios: 11_447_046, factVenta: 11_447_046, impositivo: 6_908, jubilatorio: 14_483, obraSocial: 16_478, superficie: 45, energia: 5000, alquiler: 219_014 },
  { letra: 'C', factServicios: 16_050_091, factVenta: 16_050_091, impositivo: 11_853, jubilatorio: 15_930, obraSocial: 16_478, superficie: 60, energia: 6700, alquiler: 438_028 },
  { letra: 'D', factServicios: 19_926_340, factVenta: 19_926_340, impositivo: 19_333, jubilatorio: 17_523, obraSocial: 16_478, superficie: 85, energia: 10000, alquiler: 438_028 },
  { letra: 'E', factServicios: 23_439_192, factVenta: 27_688_614, impositivo: 26_406, jubilatorio: 19_275, obraSocial: 20_599, superficie: 110, energia: 13000, alquiler: 657_042 },
  { letra: 'F', factServicios: 29_374_695, factVenta: 34_610_768, impositivo: 36_597, jubilatorio: 21_203, obraSocial: 20_599, superficie: 150, energia: 16500, alquiler: 657_042 },
  { letra: 'G', factServicios: 35_128_502, factVenta: 41_532_922, impositivo: 47_402, jubilatorio: 23_323, obraSocial: 20_599, superficie: 200, energia: 20000, alquiler: 876_057 },
  { letra: 'H', factServicios: 52_692_753, factVenta: 57_609_911, impositivo: 81_121, jubilatorio: 25_655, obraSocial: 24_718, superficie: 200, energia: 20000, alquiler: 1_095_071 },
  { letra: 'I', factServicios: 0, factVenta: 66_111_165, impositivo: 102_841, jubilatorio: 28_221, obraSocial: 24_718, superficie: 200, energia: 20000, alquiler: 1_095_071 },
  { letra: 'J', factServicios: 0, factVenta: 76_227_802, impositivo: 120_187, jubilatorio: 31_043, obraSocial: 24_718, superficie: 200, energia: 20000, alquiler: 1_314_085 },
  { letra: 'K', factServicios: 0, factVenta: 86_344_440, impositivo: 137_528, jubilatorio: 34_147, obraSocial: 24_718, superficie: 200, energia: 20000, alquiler: 1_314_085 },
];

export function monotributoCategoriaIdeal(i: Inputs): Outputs {
  const facturacion = Number(i.facturacionAnual);
  const actividad = String(i.actividad || 'servicios');
  const superficie = Number(i.superficieAfectada) || 0;
  const energia = Number(i.energiaAnual) || 0;
  const alquiler = Number(i.alquilerAnual) || 0;

  if (!facturacion || facturacion <= 0) throw new Error('Ingresá tu facturación anual estimada');

  const esServicios = actividad === 'servicios';

  let categoriaIdeal: Categoria | null = null;
  for (const cat of CATEGORIAS) {
    const tope = esServicios ? cat.factServicios : cat.factVenta;
    if (tope === 0) continue; // Categoría no disponible para servicios

    if (facturacion <= tope) {
      // Verificar otros parámetros
      if (superficie > 0 && superficie > cat.superficie) continue;
      if (energia > 0 && energia > cat.energia) continue;
      if (alquiler > 0 && alquiler > cat.alquiler) continue;

      categoriaIdeal = cat;
      break;
    }
  }

  if (!categoriaIdeal) {
    throw new Error(`Con $${facturacion.toLocaleString()} de facturación anual, excedés el tope del monotributo. Debés inscribirte como Responsable Inscripto.`);
  }

  const cuotaMensual = categoriaIdeal.impositivo + categoriaIdeal.jubilatorio + categoriaIdeal.obraSocial;
  const facMax = esServicios ? categoriaIdeal.factServicios : categoriaIdeal.factVenta;
  const margenDisponible = facMax - facturacion;

  const formula = `Categoría ${categoriaIdeal.letra}: cuota = $${categoriaIdeal.impositivo.toLocaleString()} + $${categoriaIdeal.jubilatorio.toLocaleString()} + $${categoriaIdeal.obraSocial.toLocaleString()} = $${cuotaMensual.toLocaleString()}/mes`;
  const explicacion = `Con facturación anual de $${facturacion.toLocaleString()} (${actividad}), tu categoría ideal es **${categoriaIdeal.letra}**. Cuota mensual total: $${cuotaMensual.toLocaleString()} (impositivo $${categoriaIdeal.impositivo.toLocaleString()} + jubilatorio $${categoriaIdeal.jubilatorio.toLocaleString()} + obra social $${categoriaIdeal.obraSocial.toLocaleString()}). Tope de la categoría: $${facMax.toLocaleString()}. Margen: $${margenDisponible.toLocaleString()} (${((margenDisponible / facMax) * 100).toFixed(1)}%). Valores estimados 2026.`;

  return {
    categoriaIdeal: categoriaIdeal.letra,
    cuotaMensual,
    facturacionMaxima: facMax,
    margenDisponible,
    componenteImpositivo: categoriaIdeal.impositivo,
    componenteJubilatorio: categoriaIdeal.jubilatorio,
    componenteObraSocial: categoriaIdeal.obraSocial,
    formula,
    explicacion,
  };
}
