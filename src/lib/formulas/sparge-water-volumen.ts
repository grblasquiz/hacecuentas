/** Sparge water volume */
export interface Inputs { kgGrano: number; ratioMashLkg: number; volumenPrehervor: number; deadSpace?: number; }
export interface Outputs { aguaMash: number; aguaSparge: number; aguaTotal: number; absorcion: number; }

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

  return {
    aguaMash: Number(aguaMash.toFixed(1)),
    aguaSparge: Number(aguaSparge.toFixed(1)),
    aguaTotal: Number(aguaTotal.toFixed(1)),
    absorcion: Number(absorcion.toFixed(1)),
  };
}
