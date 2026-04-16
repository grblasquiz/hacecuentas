export interface Inputs { m2: number; ambiente?: string; }
export interface Outputs { m2Muebles: number; pctLibre: number; circulacion: string; consejo: string; }
const PCT_LIBRE: Record<string, number> = { living: 60, dormitorio: 55, comedor: 50, escritorio: 55 };
export function distribucionMueblesM2(i: Inputs): Outputs {
  const m2 = Number(i.m2); if (!m2) throw new Error('Ingresá los m²');
  const amb = String(i.ambiente || 'living');
  const pctLibre = PCT_LIBRE[amb] || 55;
  const m2Muebles = Number((m2 * (1 - pctLibre/100)).toFixed(1));
  const consejo = amb === 'living' ? 'Dejá 90 cm de paso principal y 45 cm entre sofá y mesa ratona.' :
    amb === 'dormitorio' ? 'Dejá 60 cm de paso alrededor de la cama y 90 cm frente al placard.' :
    amb === 'comedor' ? 'Dejá 90 cm entre mesa y pared para retirarse cómodamente.' :
    'Dejá 120 cm de profundidad frente al escritorio para silla + paso.';
  return { m2Muebles, pctLibre, circulacion: 'Mínimo 75-90 cm para paso principal, 60 cm para pasos secundarios', consejo };
}