/** Aporte extra de obra social del monotributo por adherentes (cónyuge, hijos) */
export interface Inputs { aporteBaseMensual: number; cantidadAdherentes: number; aporteAdherente: number; mesesAnio: number; }
export interface Outputs { aporteAdherentesMensual: number; aporteTotalMensual: number; aporteTotalAnual: number; costoAnualPorAdherente: number; explicacion: string; _chart?: any; }
export function obraSocialMonotributistaAporteExtraFamiliar(i: Inputs): Outputs {
  const base = Number(i.aporteBaseMensual);
  const cant = Number(i.cantidadAdherentes);
  const apAdh = Number(i.aporteAdherente);
  const meses = Number(i.mesesAnio) || 12;
  if (base < 0 || cant < 0 || apAdh < 0) throw new Error('Valores deben ser positivos');
  const adhMens = cant * apAdh;
  const totalMens = base + adhMens;
  const totalAnual = totalMens * meses;
  const costoAnualAdh = cant > 0 ? (adhMens * meses) / cant : 0;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Aporte base titular', value: Number(base.toFixed(2)) },
      { label: 'Adherentes', value: Number(adhMens.toFixed(2)) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalMens).toLocaleString('es-AR'),
    centerLabel: 'Total mensual',
    ariaLabel: 'Composición del aporte mensual total: aporte base del titular más aporte de adherentes',
  };
  return {
    aporteAdherentesMensual: Number(adhMens.toFixed(2)),
    aporteTotalMensual: Number(totalMens.toFixed(2)),
    aporteTotalAnual: Number(totalAnual.toFixed(2)),
    costoAnualPorAdherente: Number(costoAnualAdh.toFixed(2)),
    explicacion: `Aporte mensual total: $${totalMens.toLocaleString('es-AR')} (base $${base.toLocaleString('es-AR')} + ${cant} adherente(s) x $${apAdh.toLocaleString('es-AR')}). Anual: $${totalAnual.toLocaleString('es-AR')}.`,
    _chart: chart,
  };
}
