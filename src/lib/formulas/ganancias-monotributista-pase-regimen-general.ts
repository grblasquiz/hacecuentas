/** Pase de Monotributo a Régimen General: comparativa de carga fiscal */
import { cuota as cuotaMono, type Cat } from '../data/monotributo-2026';
export interface Inputs { facturacionAnual: number; gastosDeducibles: number; categoriaActual: string; ingresosBrutosPct: number; }
export interface Outputs { impuestoMonotributo: number; impuestoRgEstimado: number; ivaCredito: number; cargaTotalMonotributo: number; cargaTotalRg: number; conviene: string; explicacion: string; _insight?: any; }
export function gananciasMonotributistaPaseRegimenGeneral(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnual);
  const gastos = Number(i.gastosDeducibles);
  const ibPct = Number(i.ingresosBrutosPct) / 100;
  if (!fact || fact <= 0) throw new Error('Ingresá la facturación anual');
  // Cuota mensual de monotributo (servicios) — escala ARCA 2026, fuente única.
  const cuotaMens = cuotaMono(String(i.categoriaActual || 'H').toUpperCase() as Cat, 'servicios');
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
  const miles = (n: number) => Math.round(n).toLocaleString('es-AR');
  const diferencia = Math.abs(cargaRg - cargaMono);
  const _insight = conviene === 'Monotributo'
    ? {
        title: 'Te conviene seguir en Monotributo',
        text: `Hoy el Monotributo te cuesta **$${miles(cargaMono)}/año** contra **$${miles(cargaRg)}/año** del Régimen General: quedándote ahorrás **$${miles(diferencia)}** al año. Igual revisá si superás los topes de facturación.`,
        tone: 'good',
        icon: '🟢',
      }
    : {
        title: 'El Régimen General sale más barato',
        text: `Con tu nivel de facturación, el Régimen General costaría **$${miles(cargaRg)}/año** frente a **$${miles(cargaMono)}/año** del Monotributo: pasarte te ahorraría **$${miles(diferencia)}** al año, además del IVA crédito de **$${miles(ivaCredito)}** que podés computar.`,
        tone: 'neutral',
        icon: '🔄',
      };
  return {
    impuestoMonotributo: Number(monotrib.toFixed(2)),
    impuestoRgEstimado: Number((ivaNeto + ganancias + autonomos).toFixed(2)),
    ivaCredito: Number(ivaCredito.toFixed(2)),
    cargaTotalMonotributo: Number(cargaMono.toFixed(2)),
    cargaTotalRg: Number(cargaRg.toFixed(2)),
    conviene,
    explicacion: `Monotributo categoría ${i.categoriaActual}: $${cargaMono.toLocaleString('es-AR')}/año. RG estimado: $${cargaRg.toLocaleString('es-AR')}/año. Conviene: ${conviene}.`,
    _insight,
  };
}
