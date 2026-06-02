export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function conversionPieCuadradoMetroBienesRaices(i: Inputs): Outputs {
  const v = Number(i.valor) || 0;
  const u = String(i.unidad || 'a');
  const factor = 0.092903;
  const r = u === 'a' ? v * factor : v / factor;
  const fromU = u === 'a' ? 'ft²' : 'm²';
  const toU = u === 'a' ? 'm²' : 'ft²';
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const m2 = u === 'a' ? r : v;
  const ft2 = u === 'a' ? v : r;
  return {
    resultado: r.toFixed(4).replace(/\.?0+$/, '') + ' ' + toU,
    resumen: `${v} ${fromU} = ${r.toFixed(4).replace(/\.?0+$/, '')} ${toU}.`,
    _insight: {
      title: 'Qué superficie es esto',
      text: `Una superficie de **${fmt.format(ft2)} ft²** equivale a **${fmt.format(m2)} m²**. En avisos inmobiliarios de EE.UU. y Reino Unido se mide en pies cuadrados, así que al comparar con propiedades en m² recordá el factor: **1 m² = 10,76 ft²**.`,
      tone: 'neutral' as const,
      icon: '📐',
    }
  };
}
