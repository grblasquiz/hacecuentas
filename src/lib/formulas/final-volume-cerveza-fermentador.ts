/** Volume at fermenter */
export interface Inputs { volumenPostHervor: number; gramosLupuloTotal?: number; trubKettleL?: number; deadSpaceFermentador?: number; }
export interface Outputs { volumenFermentador: number; hopAbsorption: number; volumenEmbotellado: number; perdidaTotal: number; _chart?: any; }

export function finalVolumeCervezaFermentador(i: Inputs): Outputs {
  const vPost = Number(i.volumenPostHervor);
  const lupulo = Number(i.gramosLupuloTotal) || 0;
  const trub = Number(i.trubKettleL) || 1.0;
  const dead = Number(i.deadSpaceFermentador) || 0.5;
  if (!vPost || vPost <= 0) throw new Error('Ingresá volumen post-hervor');

  const hopAbs = lupulo * 0.01;
  const vFerm = Math.max(0, vPost - hopAbs - trub);
  const yeastCake = 0.5;
  const vBottle = Math.max(0, vFerm - dead - yeastCake);
  const perdida = vPost - vBottle;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Embotellado', value: Number(vBottle.toFixed(2)) },
      { label: 'Pérdidas', value: Number(perdida.toFixed(2)) },
    ],
    prefix: '',
    centerValue: vPost.toLocaleString('es-AR') + ' L',
    centerLabel: 'Post-hervor',
    ariaLabel: 'Composición del volumen post-hervor: litros embotellados vs pérdidas (lúpulo, trub, borra)',
  };

  return {
    volumenFermentador: Number(vFerm.toFixed(2)),
    hopAbsorption: Number(hopAbs.toFixed(2)),
    volumenEmbotellado: Number(vBottle.toFixed(2)),
    perdidaTotal: Number(perdida.toFixed(2)),
    _chart: chart,
  };
}
