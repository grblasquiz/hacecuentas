/** French Press */
export interface Inputs { tamañoPrensa: string; porcentajeLlenado: number; ratio: number; }
export interface Outputs { gramosCafe: number; mlAgua: number; molido: string; tiempoTotal: string; temperatura: string; }

export function cafeFrenchPressRatio(i: Inputs): Outputs {
  const size = Number(i.tamañoPrensa);
  const pct = Number(i.porcentajeLlenado) / 100;
  const r = Number(i.ratio);
  if (!size || size <= 0) throw new Error('Ingresá tamaño');
  if (!r) throw new Error('Ingresá ratio');

  const agua = size * pct;
  const cafe = agua / r;

  return {
    gramosCafe: Number(cafe.toFixed(1)),
    mlAgua: Number(agua.toFixed(0)),
    molido: 'Grueso (sal marina gruesa)',
    tiempoTotal: '4:00 min exactos',
    temperatura: '93-96°C (agua hervida reposada 30s)',
  };
}
