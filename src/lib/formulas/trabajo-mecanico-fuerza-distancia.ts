export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function trabajoMecanicoFuerzaDistancia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const F = Number(i.fuerza); const d = Number(i.distancia); const a = Number(i.angulo) || 0;
  if (!F || d === undefined) throw new Error(__lang === 'en' ? 'Fill in the fields' : 'Completá');
  const W = F * d * Math.cos(a * Math.PI / 180);
  const Wstr = W.toFixed(1);
  // Si el ángulo es 90°, cos=0 y no hay trabajo; >90° el trabajo es negativo.
  const casiCero = Math.abs(W) < 0.05;
  const negativo = W < -0.05;
  const tone = casiCero ? 'warn' : negativo ? 'warn' : 'good';
  const _insight = __lang === 'en'
    ? {
        title: 'Mechanical work done',
        text: casiCero
          ? `The work is **${Wstr} J**: with the force at **${a}°** to the displacement, the component along the motion is zero, so the force does no work.`
          : negativo
          ? `The work is **${Wstr} J** (negative): at **${a}°** the force opposes the motion, so it removes energy instead of adding it.`
          : `A force of **${F} N** over **${d} m** at **${a}°** does **${Wstr} J** of work — energy transferred to the object.`,
        tone, icon: '⚙️',
      }
    : {
        title: 'Trabajo mecánico realizado',
        text: casiCero
          ? `El trabajo es **${Wstr} J**: con la fuerza a **${a}°** del desplazamiento, la componente en la dirección del movimiento es nula, así que la fuerza no realiza trabajo.`
          : negativo
          ? `El trabajo es **${Wstr} J** (negativo): a **${a}°** la fuerza se opone al movimiento, así que en vez de aportar energía la resta.`
          : `Una fuerza de **${F} N** a lo largo de **${d} m** con un ángulo de **${a}°** realiza **${Wstr} J** de trabajo — energía transferida al objeto.`,
        tone, icon: '⚙️',
      };
  return { trabajo: Wstr + ' J', resumen: `W = ${Wstr} J (F=${F}N × d=${d}m × cos(${a}°)).`, _insight };
}
