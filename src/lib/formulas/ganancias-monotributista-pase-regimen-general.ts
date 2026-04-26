/** Pase de Monotributo a Régimen General: comparativa de carga fiscal */
export interface Inputs { facturacionAnual: number; gastosDeducibles: number; categoriaActual: string; ingresosBrutosPct: number; }
export interface Outputs { impuestoMonotributo: number; impuestoRgEstimado: number; ivaCredito: number; cargaTotalMonotributo: number; cargaTotalRg: number; conviene: string; explicacion: string; }
export function gananciasMonotributistaPaseRegimenGeneral(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnual);
  const gastos = Number(i.gastosDeducibles);
  const ibPct = Number(i.ingresosBrutosPct) / 100;
  if (!fact || fact <= 0) throw new Error('Ingresá la facturación anual');
  // Cuota mensual estimada por categoría (valores 2026 aproximados)
  const cuotasMonotributo: Record<string, number> = {
    'A': 35000, 'B': 42000, 'C': 50000, 'D': 65000, 'E': 85000,
    'F': 110000, 'G': 145000, 'H': 220000, 'I': 320000, 'J': 380000, 'K': 450000,
  };
  const cuotaMens = cuotasMonotributo[String(i.categoriaActual).toUpperCase()] ?? 100000;
  const monotrib = cuotaMens * 12;
  const ibMonotrib = fact * ibPct;
  // RG: IVA débito 21% - IVA crédito (asumimos 21% sobre gastos), Ganancias 35% sobre utilidad
  const ivaDebito = fact * 0.21;
  const ivaCredito = gastos * 0.21;
  const ivaNeto = Math.max(0, ivaDebito - ivaCredito);
  const utilidad = Math.max(0, fact - gastos);
  // Ganancias escala 2026 simplificada: 35% sobre excedente de mínimo no imponible (~5M)
  const minimo = 5000000;
  const ganancias = Math.max(0, (utilidad - minimo)) * 0.35;
  const autonomos = 12 * 95000; // aporte autónomo cat II
  const ibRg = fact * ibPct;
  const cargaMono = monotrib + ibMonotrib;
  const cargaRg = ivaNeto + ganancias + autonomos + ibRg;
  const conviene = cargaMono < cargaRg ? 'Monotributo' : 'Régimen General';
  return {
    impuestoMonotributo: Number(monotrib.toFixed(2)),
    impuestoRgEstimado: Number((ivaNeto + ganancias + autonomos).toFixed(2)),
    ivaCredito: Number(ivaCredito.toFixed(2)),
    cargaTotalMonotributo: Number(cargaMono.toFixed(2)),
    cargaTotalRg: Number(cargaRg.toFixed(2)),
    conviene,
    explicacion: `Monotributo categoría ${i.categoriaActual}: $${cargaMono.toLocaleString('es-AR')}/año. RG estimado: $${cargaRg.toLocaleString('es-AR')}/año. Conviene: ${conviene}.`,
  };
}
