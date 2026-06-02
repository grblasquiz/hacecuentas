/** Temperatura aceite y punto de humo */
export interface Inputs { aceite: string; alimento?: string; }
export interface Outputs { puntoHumo: number; tempIdealFritura: string; aptoParaUso: string; consejo: string; _insight?: any; }

const PUNTO_HUMO: Record<string, number> = {
  girasol: 227, girasol_ao: 232, oliva_ev: 190, oliva_comun: 240,
  maiz: 232, soja: 232, canola: 238, coco: 177, manteca: 150, ghee: 250,
};
const TEMP_FRITURA: Record<string, number> = {
  milanesa: 175, papas: 180, salteado: 150, huevo: 140, bunuelos: 170, pescado: 170,
};

export function temperaturaAceiteFritura(i: Inputs): Outputs {
  const aceite = String(i.aceite || 'girasol');
  const alimento = String(i.alimento || 'milanesa');
  const ph = PUNTO_HUMO[aceite];
  if (!ph) throw new Error('Aceite no encontrado');
  const tempFrit = TEMP_FRITURA[alimento] || 170;

  const apto = ph >= tempFrit + 10;
  const aptoTxt = apto ? `Sí — margen de ${ph - tempFrit}°C sobre la temperatura de fritura` :
    `No recomendado — el punto de humo (${ph}°C) es muy cercano o inferior a la temperatura necesaria (${tempFrit}°C)`;

  const consejo = !apto ? `Elegí un aceite con punto de humo más alto (girasol, canola o girasol alto oleico).` :
    aceite === 'manteca' ? 'La manteca da sabor pero se quema fácil. Para frituras, usá ghee.' :
    aceite === 'oliva_ev' ? 'El extra virgen es mejor para ensaladas y salteados rápidos. Para fritura profunda, usá oliva común.' :
    'Aceite apto. Controlá la temperatura con termómetro para mejores resultados.';

  const margen = ph - tempFrit;
  return {
    puntoHumo: ph,
    tempIdealFritura: `${tempFrit}°C`,
    aptoParaUso: aptoTxt,
    consejo,
    _insight: {
      title: apto ? 'Aceite apto' : 'Aceite riesgoso',
      text: apto
        ? `El aceite humea a **${ph}°C** y vas a freír a **${tempFrit}°C**: tenés **${margen}°C** de margen, suficiente para freír sin pasar el punto de humo (donde el aceite se degrada y genera acroleína).`
        : `Cuidado: el punto de humo de este aceite es **${ph}°C** y necesitás freír a **${tempFrit}°C**. El margen es de solo **${margen}°C**, así que el aceite puede humear y volverse tóxico. Elegí uno con punto de humo más alto.`,
      tone: apto ? 'good' : 'warn',
      icon: apto ? '🍳' : '🔥',
    },
  };
}
