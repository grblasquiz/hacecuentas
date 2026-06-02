/** Proporción café/agua por método */
export interface Inputs { metodo: string; tazas: number; intensidad?: string; }
export interface Outputs { gramosCafe: number; mlAgua: number; ratio: string; consejo: string; _insight?: any; }

interface MetodoData { gPorTaza: number; mlPorTaza: number; ratio: string; consejo: string; }
const METODOS: Record<string, MetodoData> = {
  prensa: { gPorTaza: 7, mlPorTaza: 200, ratio: '1:15', consejo: 'Molienda gruesa. Infusión 4 minutos. No presiones fuerte el émbolo.' },
  filtro: { gPorTaza: 6, mlPorTaza: 200, ratio: '1:16', consejo: 'Molienda media. Pre-mojá el filtro. Vertí agua en círculos lentos.' },
  espresso: { gPorTaza: 9, mlPorTaza: 30, ratio: '1:2', consejo: 'Molienda fina. Compactá parejo (tamp). Extracción: 25-30 segundos.' },
  moka: { gPorTaza: 6, mlPorTaza: 50, ratio: '1:8', consejo: 'Llenado al ras sin compactar. Fuego bajo. Sacá del fuego cuando empiece a borbotear.' },
  cold_brew: { gPorTaza: 12, mlPorTaza: 100, ratio: '1:8', consejo: 'Molienda gruesa. 12-18 horas en heladera. Diluí 1:1 al servir.' },
  cafetera_goteo: { gPorTaza: 6, mlPorTaza: 180, ratio: '1:16', consejo: 'Molienda media. Usá agua filtrada. Limpiá la cafetera con vinagre mensualmente.' },
};
const FACTOR_INT: Record<string, number> = { suave: 0.85, medio: 1, fuerte: 1.2 };

export function cafeProporcionAguaGramos(i: Inputs): Outputs {
  const metodo = String(i.metodo || 'prensa');
  const tazas = Number(i.tazas); if (!tazas || tazas <= 0) throw new Error('Ingresá la cantidad de tazas');
  const intensidad = String(i.intensidad || 'medio');
  const data = METODOS[metodo]; if (!data) throw new Error('Método no encontrado');
  const factor = FACTOR_INT[intensidad] || 1;
  const gramos = Math.round(data.gPorTaza * tazas * factor);
  const ml = Math.round(data.mlPorTaza * tazas);

  const NOMBRE: Record<string, string> = {
    prensa: 'prensa francesa', filtro: 'filtro/pour over', espresso: 'espresso',
    moka: 'cafetera moka', cold_brew: 'cold brew', cafetera_goteo: 'cafetera de goteo',
  };
  const nombreMetodo = NOMBRE[metodo] || metodo;
  const intensLabel = intensidad === 'suave' ? 'suave' : intensidad === 'fuerte' ? 'fuerte' : 'media';
  const _insight = {
    title: `Receta para ${tazas} ${tazas === 1 ? 'taza' : 'tazas'}`,
    text: `Para **${nombreMetodo}** con intensidad **${intensLabel}** necesitás **${gramos} g** de café y **${ml} ml** de agua (ratio **${data.ratio}**). Pesar el café da una taza mucho más consistente que medir con cuchara.`,
    tone: 'neutral',
    icon: '☕',
  };

  return { gramosCafe: gramos, mlAgua: ml, ratio: data.ratio, consejo: data.consejo, _insight };
}
