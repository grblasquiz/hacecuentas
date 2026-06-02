export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function pinturaLitrosM2Manos(i: Inputs): Outputs {
  const m = Number(i.m2) || 0; const ma = Number(i.manos) || 1; const r = Number(i.rendimiento) || 10;
  const L = (m * ma) / r;
  const gal = L * 0.264;
  const _insight = {
    title: 'Cuánta pintura comprar',
    text: `Para **${m} m²** con **${ma} mano${ma === 1 ? '' : 's'}** necesitás **${L.toFixed(1)} L**. Sumá un 10% extra (~${(L * 0.1).toFixed(1)} L) para retoques y que no te quedes corto a mitad de pared.`,
    tone: 'neutral' as const,
    icon: '🎨',
  };
  return { litros: L.toFixed(1), galones: gal.toFixed(2), resumen: `${L.toFixed(1)} L (${gal.toFixed(1)} gal) para ${m} m² con ${ma} manos.`, _insight };
}
