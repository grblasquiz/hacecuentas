/**
 * Calculadora de categoría de monotributo por ingresos
 * Determina categoría según ingresos anuales y tipo de actividad
 * Valores estimados 2026 — se actualizan semestralmente
 */

export interface MonotributoCategoriaIngresosTopeInputs {
  ingresosAnuales: number;
  tipoActividad: string;
}

export interface MonotributoCategoriaIngresosTopeOutputs {
  categoria: string;
  cuotaMensual: number;
  topeCategoria: number;
  detalle: string;
}

interface CatMono {
  cat: string;
  tope: number;
  cuotaServicios: number;
  cuotaVenta: number;
  soloVenta?: boolean;
}

// Valores estimados 2026 — actualizar semestralmente
const CATEGORIAS: CatMono[] = [
  { cat: 'A', tope: 3500000, cuotaServicios: 15000, cuotaVenta: 15000 },
  { cat: 'B', tope: 5200000, cuotaServicios: 18000, cuotaVenta: 18000 },
  { cat: 'C', tope: 7300000, cuotaServicios: 22000, cuotaVenta: 22000 },
  { cat: 'D', tope: 14000000, cuotaServicios: 35000, cuotaVenta: 35000 },
  { cat: 'E', tope: 16500000, cuotaServicios: 55000, cuotaVenta: 55000 },
  { cat: 'F', tope: 20600000, cuotaServicios: 70000, cuotaVenta: 70000 },
  { cat: 'G', tope: 24800000, cuotaServicios: 85000, cuotaVenta: 85000 },
  { cat: 'H', tope: 34000000, cuotaServicios: 150000, cuotaVenta: 150000 },
  { cat: 'I', tope: 40000000, cuotaServicios: 0, cuotaVenta: 200000, soloVenta: true },
  { cat: 'J', tope: 44000000, cuotaServicios: 0, cuotaVenta: 230000, soloVenta: true },
  { cat: 'K', tope: 48000000, cuotaServicios: 0, cuotaVenta: 260000, soloVenta: true },
];

export function monotributoCategoriaIngresosTope(
  inputs: MonotributoCategoriaIngresosTopeInputs
): MonotributoCategoriaIngresosTopeOutputs {
  const ingresos = Number(inputs.ingresosAnuales);
  const tipo = inputs.tipoActividad || 'servicios';

  if (!ingresos || ingresos <= 0) throw new Error('Ingresá tus ingresos anuales');

  const esServicios = tipo === 'servicios';
  const categoriasDisponibles = esServicios
    ? CATEGORIAS.filter((c) => !c.soloVenta)
    : CATEGORIAS;

  const maxCat = categoriasDisponibles[categoriasDisponibles.length - 1];

  if (ingresos > maxCat.tope) {
    return {
      categoria: 'Excedido — Responsable Inscripto',
      cuotaMensual: 0,
      topeCategoria: maxCat.tope,
      detalle: `Tus ingresos anuales de $${Math.round(ingresos).toLocaleString('es-AR')} superan el tope máximo del monotributo para ${esServicios ? 'servicios' : 'venta'} (categoría ${maxCat.cat}: $${maxCat.tope.toLocaleString('es-AR')}). Debés inscribirte como Responsable Inscripto.`,
    };
  }

  const catCorrespondiente = categoriasDisponibles.find((c) => ingresos <= c.tope)!;
  const cuota = esServicios ? catCorrespondiente.cuotaServicios : catCorrespondiente.cuotaVenta;

  const margen = catCorrespondiente.tope - ingresos;
  const margenPct = ((margen / catCorrespondiente.tope) * 100).toFixed(1);

  return {
    categoria: `Categoría ${catCorrespondiente.cat}`,
    cuotaMensual: cuota,
    topeCategoria: catCorrespondiente.tope,
    detalle: `Con ingresos anuales de $${Math.round(ingresos).toLocaleString('es-AR')} en ${esServicios ? 'servicios' : 'venta'}, te corresponde la categoría ${catCorrespondiente.cat} (tope $${catCorrespondiente.tope.toLocaleString('es-AR')}). Cuota mensual estimada: $${cuota.toLocaleString('es-AR')}. Margen disponible: $${Math.round(margen).toLocaleString('es-AR')} (${margenPct}% del tope). Recategorización: enero y julio.`,
  };
}
