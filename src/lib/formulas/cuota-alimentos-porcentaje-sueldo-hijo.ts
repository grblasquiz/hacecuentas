export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function cuotaAlimentosPorcentajeSueldoHijo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const s=Number(i.sueldoProgenitor)||0; const h=Number(i.cantidadHijos)||1;
  const pct=h===1?22:h===2?32:h===3?40:45;
  const cuota=s*pct/100;
  const locale = __lang === 'en' ? 'en-US' : __lang === 'pt' ? 'pt-BR' : 'es-AR';
  const money = (x: number) => `$${Math.round(x).toLocaleString(locale)}`;
  const cuotaFmt = money(cuota);
  const interpretacion = __lang === 'en'
    ? `Reference: ${pct}% of net salary for ${h} child${h>1?'ren':''} = ${money(cuota)}/month. The judge sets the final amount.`
    : __lang === 'pt'
    ? `Referência: ${pct}% do salário líquido para ${h} filho${h>1?'s':''} = ${money(cuota)}/mês. O juiz define o valor final.`
    : `Referencia: ${pct}% del sueldo neto para ${h} hijo${h>1?'s':''} = ${money(cuota)}/mes. El juez fija el valor final.`;

  const resto = Math.max(0, s - cuota);
  const tone = pct >= 40 ? 'warn' : 'neutral';
  const _insight = __lang === 'en'
    ? { title: 'Reference quota', text: `For ${h} child${h>1?'ren':''}, the reference is **${pct}%** of the net salary = **${money(cuota)}/month**. It is only a guideline — the judge sets the final amount.`, tone, icon: '⚖️' }
    : __lang === 'pt'
    ? { title: 'Pensão de referência', text: `Para ${h} filho${h>1?'s':''}, a referência é **${pct}%** do salário líquido = **${money(cuota)}/mês**. É apenas orientativo — o juiz define o valor final.`, tone, icon: '⚖️' }
    : { title: 'Cuota de referencia', text: `Para ${h} hijo${h>1?'s':''}, la referencia es el **${pct}%** del sueldo neto = **${money(cuota)}/mes**. Es solo orientativo: el monto final lo fija el juez.`, tone, icon: '⚖️' };

  const sliceCuota = __lang === 'en' ? 'Child support' : __lang === 'pt' ? 'Pensão' : 'Cuota alimentaria';
  const sliceResto = __lang === 'en' ? 'Remaining salary' : __lang === 'pt' ? 'Salário restante' : 'Resto del sueldo';
  const centerLabel = __lang === 'en' ? 'Net salary' : __lang === 'pt' ? 'Salário líquido' : 'Sueldo neto';
  const ariaLabel = __lang === 'en'
    ? `Of the net salary of ${money(s)}, the quota is ${money(cuota)} and the rest ${money(resto)}`
    : __lang === 'pt'
    ? `Do salário líquido de ${money(s)}, a pensão é ${money(cuota)} e o resto ${money(resto)}`
    : `Del sueldo neto de ${money(s)}, la cuota es ${money(cuota)} y el resto ${money(resto)}`;

  const out: Outputs = { cuotaMensual: cuotaFmt, porcentaje:`${pct}%`, interpretacion, _insight };

  // Donut: el sueldo neto se reparte entre la cuota y el resto disponible
  if (s > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: sliceCuota, value: Math.round(cuota) },
        { label: sliceResto, value: Math.round(resto) },
      ],
      prefix: '$',
      centerValue: money(s),
      centerLabel,
      ariaLabel,
    };
  }

  return out;
}
