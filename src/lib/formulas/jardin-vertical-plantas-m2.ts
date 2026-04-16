/** Jardín vertical: plantas por m² */
export interface Inputs { anchoM: number; altoM: number; sistema?: string; }
export interface Outputs { plantasTotales: number; plantasPorM2: number; superficieM2: number; consejo: string; }

const DENSIDAD: Record<string, number> = {
  bolsillos: 25, modulos: 16, macetas: 12, palets: 10, tubos: 20,
};
const CONSEJOS: Record<string, string> = {
  bolsillos: 'Ideal para: potus, helechos, tradescantia, suculentas, aromáticas. Regá frecuente.',
  modulos: 'Ideal para: plantas con algo más de raíz. Buena retención de sustrato.',
  macetas: 'Ideal para: frutillas, aromáticas, suculentas. Fácil mantenimiento individual.',
  palets: 'Ideal para: aromáticas, suculentas, plantas chicas. Económico y reciclable.',
  tubos: 'Ideal para: lechugas, frutillas, aromáticas. Buena densidad, requiere riego automatizado.',
};

export function jardinVerticalPlantasM2(i: Inputs): Outputs {
  const ancho = Number(i.anchoM);
  const alto = Number(i.altoM);
  if (!ancho || ancho <= 0 || !alto || alto <= 0) throw new Error('Ingresá ancho y alto de la pared');
  const sistema = String(i.sistema || 'bolsillos');
  const m2 = ancho * alto;
  const densidad = DENSIDAD[sistema] || 20;
  const total = Math.round(m2 * densidad);

  return {
    plantasTotales: total,
    plantasPorM2: densidad,
    superficieM2: Number(m2.toFixed(1)),
    consejo: CONSEJOS[sistema] || 'Elegí plantas de poco peso y raíz superficial.',
  };
}
