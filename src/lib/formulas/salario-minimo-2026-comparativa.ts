export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function salarioMinimo2026Comparativa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const s=Number(i.tuSueldo)||0; const smvm=Number(i.smvm)||1;
  const m=s/smvm; const d=s-smvm; const pct=smvm>0?((s/smvm-1)*100):0;
  const percentil = d>=0
    ? (__lang==='en' ? `+${pct.toFixed(0)}% above minimum` : `+${pct.toFixed(0)}% sobre el mínimo`)
    : (__lang==='en' ? `${pct.toFixed(0)}% below minimum` : `${pct.toFixed(0)}% bajo el mínimo`);

  const fmt = new Intl.NumberFormat(__lang==='en'?'en-US':'es-AR', { maximumFractionDigits: 0 });
  const mStr = m.toFixed(2);
  const dAbs = fmt.format(Math.abs(Math.round(d)));
  const _insight = d >= 0
    ? {
        title: __lang==='en' ? 'Above the minimum wage' : 'Por encima del salario mínimo',
        text: __lang==='en'
          ? `Your salary is **${mStr}×** the minimum wage — that's **+$${dAbs}** more than someone earning the floor.`
          : `Tu sueldo equivale a **${mStr}×** el salario mínimo: son **+$${dAbs}** más que quien cobra el piso.`,
        tone: 'good',
        icon: '💪',
      }
    : {
        title: __lang==='en' ? 'Below the minimum wage' : 'Por debajo del salario mínimo',
        text: __lang==='en'
          ? `Your salary is only **${mStr}×** the minimum — you earn **$${dAbs} less** than the legal floor. Check if a full-time wage applies to you.`
          : `Tu sueldo es apenas **${mStr}×** el mínimo: cobrás **$${dAbs} menos** que el piso legal. Verificá si te corresponde un salario de jornada completa.`,
        tone: 'warn',
        icon: '⚠️',
      };

  return { multiplo:`${m.toFixed(2)}x`, diferencia:Math.round(d), percentil, _insight };
}
