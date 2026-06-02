export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function circunferenciaRuedaVelocimetroExacto(i: Inputs): Outputs {
  const w=Number(i.ancho)||0; const a=Number(i.aspect)||0; const r=Number(i.rin)||0;
  const d=r*25.4+w*a/100*2;
  const c=d*Math.PI/1000;
  // Vueltas por kilómetro: cada vuelta de rueda avanza 'c' metros
  const vueltasKm = c > 0 ? 1000 / c : 0;
  const _insight = {
    title: 'Vueltas de rueda',
    text: `Con la medida **${w}/${a}R${r}**, cada vuelta avanza **${c.toFixed(2)} m**, es decir **${Math.round(vueltasKm).toLocaleString('es-AR')} vueltas por kilómetro**. Usá este valor para calibrar el sensor del velocímetro o el cuentakilómetros (ranurar/configurar pulsos por revolución).`,
    tone: 'neutral',
    icon: '🛞',
  };
  return { circ:`${c.toFixed(3)} m`, ms:`${c.toFixed(3)} m`, calibracion:`${c.toFixed(3)} m/rev`, resumen:`${w}/${a}R${r}: circunferencia ${c.toFixed(2)}m.`, _insight };
}
