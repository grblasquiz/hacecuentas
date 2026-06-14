export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Alícuotas IIBB de referencia para servicios / producción de contenido digital.
// CABA (Ley 6927, mod. Ley 6948 vig. jun-2026): servicios = 3% si los ingresos brutos
//   del ejercicio anterior fueron ≤ $2.004.000.000; 5% si los superaron.
//   La mayoría de los creadores quedan en el tramo del 3%.
// PBA y Córdoba aplican escalas progresivas por nivel de facturación; los valores
//   de abajo son alícuotas generales de referencia (verificar nomenclador y tramo).
export function impuestoPaulistaIibbInfluencerRedes(i: Inputs): Outputs {
  const i_ = Number(i.ingresos) || 0;
  const p = String(i.provincia || 'caba');

  // CABA: 3% (tramo general de servicios) salvo grandes contribuyentes (5%).
  // Permitimos forzar el tramo grande de CABA con provincia = "caba-grande".
  const alic: Record<string, number> = {
    caba: 0.03,        // servicios CABA, ingresos ≤ $2.004.000.000 año anterior
    'caba-grande': 0.05, // servicios CABA, ingresos > $2.004.000.000
    pba: 0.045,        // PBA — alícuota general de referencia (verificar tramo)
    cba: 0.0475,       // Córdoba — alícuota general comercio/servicios (verificar tramo)
  };
  const a = alic[p] ?? 0.03;
  const iibb = i_ * a;
  const neto = i_ - iibb;
  const fmt = (n: number) => '$' + Math.round(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const provNombre: Record<string, string> = {
    caba: 'CABA', 'caba-grande': 'CABA (gran contribuyente)', pba: 'PBA', cba: 'Córdoba',
  };
  const nombre = provNombre[p] || 'CABA';

  const _insight = {
    title: 'Cuánto te queda después de IIBB',
    text: `Por **${fmt(i_)}** facturados como creador en **${nombre}** pagás **${fmt(iibb)}** de Ingresos Brutos (alícuota de referencia **${(a * 100).toFixed(2).replace(/\.?0+$/, '')}%**), y te quedan **${fmt(neto)}** netos. La alícuota exacta depende de tu código de actividad y nivel de facturación; si trabajás con clientes de varias provincias liquidás por Convenio Multilateral.`,
    tone: 'warn',
    icon: '📱'
  };
  return {
    iibb: fmt(iibb),
    alicuota: (a * 100).toFixed(2).replace(/\.?0+$/, '') + '%',
    resumen: `${fmt(i_)} en ${nombre}: IIBB ${fmt(iibb)} (${(a * 100).toFixed(2).replace(/\.?0+$/, '')}% de referencia).`,
    _insight
  };
}
