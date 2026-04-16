/** Distancia entre plantas por especie */
export interface Inputs {
  especie: string;
  largoM: number;
  anchoM: number;
}
export interface Outputs {
  distanciaEntrePlantas: number;
  distanciaEntreHileras: number;
  plantasTotales: number;
  plantasPorM2: number;
}

interface EspecieData { entrePlantas: number; entreHileras: number; }

const ESPECIES: Record<string, EspecieData> = {
  tomate: { entrePlantas: 55, entreHileras: 80 },
  lechuga: { entrePlantas: 25, entreHileras: 30 },
  pimiento: { entrePlantas: 45, entreHileras: 70 },
  zanahoria: { entrePlantas: 8, entreHileras: 25 },
  cebolla: { entrePlantas: 12, entreHileras: 25 },
  zapallo: { entrePlantas: 120, entreHileras: 180 },
  pepino: { entrePlantas: 40, entreHileras: 100 },
  berenjena: { entrePlantas: 50, entreHileras: 80 },
  maiz: { entrePlantas: 25, entreHileras: 70 },
  frutilla: { entrePlantas: 30, entreHileras: 40 },
  albahaca: { entrePlantas: 25, entreHileras: 30 },
  espinaca: { entrePlantas: 15, entreHileras: 25 },
  acelga: { entrePlantas: 25, entreHileras: 40 },
  rabanito: { entrePlantas: 5, entreHileras: 15 },
  repollo: { entrePlantas: 45, entreHileras: 60 },
  brocoli: { entrePlantas: 45, entreHileras: 60 },
};

export function distanciaEntrePlantas(i: Inputs): Outputs {
  const especie = String(i.especie || 'tomate');
  const largo = Number(i.largoM);
  const ancho = Number(i.anchoM);
  if (!largo || largo <= 0 || !ancho || ancho <= 0) throw new Error('Ingresá largo y ancho del cantero');

  const data = ESPECIES[especie];
  if (!data) throw new Error('Especie no encontrada');

  const largoCm = largo * 100;
  const anchoCm = ancho * 100;
  const hileras = Math.floor(anchoCm / data.entreHileras) + 1;
  const plantasPorHilera = Math.floor(largoCm / data.entrePlantas) + 1;
  const total = hileras * plantasPorHilera;
  const m2 = largo * ancho;
  const porM2 = m2 > 0 ? total / m2 : 0;

  return {
    distanciaEntrePlantas: data.entrePlantas,
    distanciaEntreHileras: data.entreHileras,
    plantasTotales: total,
    plantasPorM2: Number(porM2.toFixed(1)),
  };
}
