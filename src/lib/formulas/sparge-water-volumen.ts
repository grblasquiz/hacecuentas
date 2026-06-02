/** Sparge water volume */
export interface Inputs { kgGrano: number; ratioMashLkg: number; volumenPrehervor: number; deadSpace?: number; }
export interface Outputs { aguaMash: number; aguaSparge: number; aguaTotal: number; absorcion: number; _chart?: any; _insight?: any; }

export function spargeWaterVolumen(i: Inputs): Outputs {
  const kg = Number(i.kgGrano);
  const ratio = Number(i.ratioMashLkg);
  const vPre = Number(i.volumenPrehervor);
  const dead = Number(i.deadSpace) || 0;
  if (!kg || kg <= 0) throw new Error('Ingresá kg de grano');
  if (!ratio || ratio <= 0) throw new Error('Ingresá ratio mash');
  if (!vPre || vPre <= 0) throw new Error('Ingresá volumen pre-hervor');

  const aguaMash = kg * ratio;
  const absorcion = kg * 1.0; // L/kg
  const mostoDelMash = aguaMash - absorcion;
  const aguaSparge = Math.max(0, vPre - mostoDelMash + dead);
  const aguaTotal = aguaMash + aguaSparge;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Agua de macerado', value: Number(aguaMash.toFixed(1)) },
      { label: 'Agua de sparge', value: Number(aguaSparge.toFixed(1)) },
    ],
    prefix: '',
    centerValue: aguaTotal.toFixed(1) + ' L',
    centerLabel: 'Agua total',
    ariaLabel: 'Composición del agua total: agua de macerado más agua de sparge',
  };

  const mashR = Number(aguaMash.toFixed(1));
  const spargeR = Number(aguaSparge.toFixed(1));
  const totalR = Number(aguaTotal.toFixed(1));
  const _insight = spargeR <= 0
    ? {
        title: 'Sin sparge necesario',
        text: `Con **${mashR} L** de macerado ya alcanzás el volumen pre-hervor, así que **no necesitás sparge** (0 L). Es típico de métodos full-volume / BIAB.`,
        tone: 'neutral' as const,
        icon: '🍺',
      }
    : {
        title: 'Cuánta agua preparar',
        text: `Vas a usar **${totalR} L** de agua en total: **${mashR} L** para el macerado y **${spargeR} L** para el sparge. El grano absorbe unos **${Number(absorcion.toFixed(1))} L** que no vuelven a la olla.`,
        tone: 'neutral' as const,
        icon: '🍺',
      };

  return {
    aguaMash: mashR,
    aguaSparge: spargeR,
    aguaTotal: totalR,
    absorcion: Number(absorcion.toFixed(1)),
    _chart: chart,
    _insight,
  };
}
