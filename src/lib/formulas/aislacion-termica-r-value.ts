export interface Inputs { zona: string; elemento?: string; }
export interface Outputs { rValueMin: string; espEps: number; espLanaVidrio: number; recomendacion: string; }
const R_VALUES: Record<string, Record<string, number>> = {
  I:    { muro: 0.8,  techo: 1.0,  piso: 0.5,  ventana: 0.2 },
  II:   { muro: 1.0,  techo: 1.3,  piso: 0.6,  ventana: 0.25 },
  IIIa: { muro: 1.2,  techo: 1.6,  piso: 0.7,  ventana: 0.3 },
  IIIb: { muro: 1.6,  techo: 2.0,  piso: 0.9,  ventana: 0.35 },
  IV:   { muro: 2.0,  techo: 2.7,  piso: 1.2,  ventana: 0.4 },
  V:    { muro: 2.7,  techo: 3.5,  piso: 1.5,  ventana: 0.5 },
};
export function aislacionTermicaRValue(i: Inputs): Outputs {
  const zona = String(i.zona || 'IIIb'); const elem = String(i.elemento || 'muro');
  const zd = R_VALUES[zona]; if (!zd) throw new Error('Zona no encontrada');
  const r = zd[elem] || 1.6;
  const espEps = r / 0.025 * 1; // EPS: k=0.035, R=e/k -> e=R*0.035*100 cm
  const espLana = r * 0.04 * 100;
  const reco = elem === 'ventana' ? 'Usá DVH (doble vidriado hermético) para alcanzar el R-value mínimo.' :
    r >= 2 ? 'Zona fría: necesitás aislación doble o material de alta performance.' :
    'Con EPS o lana de vidrio en el espesor indicado alcanzás el valor mínimo IRAM 11605.';
  return { rValueMin: `${r.toFixed(2)} m²·K/W`, espEps: Number((r * 3.5).toFixed(1)), espLanaVidrio: Number((r * 4).toFixed(1)), recomendacion: reco };
}