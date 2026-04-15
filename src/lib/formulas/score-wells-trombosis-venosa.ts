/** Score de Wells para Trombosis Venosa Profunda (TVP) */
export interface Inputs {
  cancerActivo: string;
  paralisis: string;
  reposoReciente: string;
  dolorLocalizado: string;
  edemaCompleto: string;
  pantorrilla3cm: string;
  edemaFovea: string;
  venasColaterales: string;
  tvpPrevia: string;
  diagnosticoAlternativo: string;
}
export interface Outputs {
  puntaje: number;
  probabilidad: string;
  detalle: string;
}

export function scoreWellsTrombosisVenosa(i: Inputs): Outputs {
  const puntaje =
    Number(i.cancerActivo || 0) +
    Number(i.paralisis || 0) +
    Number(i.reposoReciente || 0) +
    Number(i.dolorLocalizado || 0) +
    Number(i.edemaCompleto || 0) +
    Number(i.pantorrilla3cm || 0) +
    Number(i.edemaFovea || 0) +
    Number(i.venasColaterales || 0) +
    Number(i.tvpPrevia || 0) +
    Number(i.diagnosticoAlternativo || 0);

  let probabilidad: string;
  let conducta: string;

  if (puntaje <= 0) {
    probabilidad = 'Baja (3-5%)';
    conducta = 'Solicitar dímero D. Si negativo → descarta TVP. Si positivo → ecografía doppler.';
  } else if (puntaje <= 2) {
    probabilidad = 'Moderada (~17%)';
    conducta = 'Solicitar dímero D. Si negativo → descarta TVP. Si positivo → ecografía doppler.';
  } else {
    probabilidad = 'Alta (53-75%)';
    conducta = 'Solicitar ecografía doppler venosa directamente (el dímero D no aporta en probabilidad alta).';
  }

  const criteriosPositivos: string[] = [];
  if (Number(i.cancerActivo)) criteriosPositivos.push('cáncer activo');
  if (Number(i.paralisis)) criteriosPositivos.push('parálisis/inmovilización');
  if (Number(i.reposoReciente)) criteriosPositivos.push('reposo/cirugía reciente');
  if (Number(i.dolorLocalizado)) criteriosPositivos.push('dolor venoso');
  if (Number(i.edemaCompleto)) criteriosPositivos.push('edema completo');
  if (Number(i.pantorrilla3cm)) criteriosPositivos.push('pantorrilla >3cm');
  if (Number(i.edemaFovea)) criteriosPositivos.push('edema fóvea');
  if (Number(i.venasColaterales)) criteriosPositivos.push('venas colaterales');
  if (Number(i.tvpPrevia)) criteriosPositivos.push('TVP previa');
  if (Number(i.diagnosticoAlternativo)) criteriosPositivos.push('dx alternativo (−2)');

  const detalle =
    `Score Wells TVP: ${puntaje} | ` +
    `Probabilidad: ${probabilidad} | ` +
    `Criterios: ${criteriosPositivos.length > 0 ? criteriosPositivos.join(', ') : 'ninguno'} | ` +
    `Conducta: ${conducta}`;

  return {
    puntaje,
    probabilidad: `${probabilidad}. ${conducta}`,
    detalle,
  };
}
