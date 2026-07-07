export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function rejillaTrampaDesague(i: Inputs): Outputs {
  const usos: Record<string, string> = { lavatorio: '50 mm', cocina: '75-100 mm', patio: '100-150 mm', ducha: '75-100 mm' };
  const u = String(i.uso);
  const diam = usos[u] || '100 mm';
  const insight = {
    title: 'Diámetro recomendado',
    text: `Para **${u}** la rejilla con trampa de desagüe va en **Ø ${diam}**. Si dudás, conviene irse al diámetro mayor del rango: mejor evacuación y menos riesgo de tapones.`,
    tone: 'neutral',
    icon: '🚰',
  };
  return { diametro: diam, resumen: `${u}: rejilla Ø ${diam}.`, _insight: insight };
}
