/** French Press */
export interface Inputs { tamañoPrensa: string; porcentajeLlenado: number; ratio: number; }
export interface Outputs { gramosCafe: number; mlAgua: number; molido: string; tiempoTotal: string; temperatura: string; _insight?: any; }

export function cafeFrenchPressRatio(i: Inputs): Outputs {
  const size = Number(i.tamañoPrensa);
  const pct = Number(i.porcentajeLlenado) / 100;
  const r = Number(i.ratio);
  if (!size || size <= 0) throw new Error('Ingresá tamaño');
  if (!r) throw new Error('Ingresá ratio');

  const agua = size * pct;
  const cafe = agua / r;
  const gramosCafe = Number(cafe.toFixed(1));
  const mlAgua = Number(agua.toFixed(0));

  const cuerpo = r < 14 ? 'fuerte y con mucho cuerpo' : r <= 16 ? 'equilibrado' : 'suave y liviano';
  const _insight = {
    title: 'Tu receta French Press',
    text: `Pesá **${gramosCafe} g** de café para **${mlAgua} ml** de agua (ratio **1:${r}**): un perfil **${cuerpo}**. La molienda gruesa y los 4 minutos exactos evitan el sabor amargo de la sobre-extracción.`,
    tone: 'neutral',
    icon: '☕',
  };

  return {
    gramosCafe,
    mlAgua,
    molido: 'Grueso (sal marina gruesa)',
    tiempoTotal: '4:00 min exactos',
    temperatura: '93-96°C (agua hervida reposada 30s)',
    _insight,
  };
}
