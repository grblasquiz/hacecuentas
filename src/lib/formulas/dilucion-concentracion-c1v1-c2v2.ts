export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function dilucionConcentracionC1v1C2v2(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: { volFinal: 'vol final', concFinal: 'conc final', volInicial: 'vol inicial', title: 'Tu dilución', icon: '🧪' },
    en: { volFinal: 'final vol', concFinal: 'final conc', volInicial: 'initial vol', title: 'Your dilution', icon: '🧪' },
    pt: { volFinal: 'vol final', concFinal: 'conc final', volInicial: 'vol inicial', title: 'Sua diluição', icon: '🧪' },
  } as const)[__lang];
  const modo = String(i.modo); const c1 = Number(i.c1); const v1 = Number(i.v1);
  const c2 = Number(i.c2); const v2 = Number(i.v2);
  let r: number; let unit: string;
  if (modo === 'v2') { r = c1 * v1 / c2; unit = T.volFinal; }
  else if (modo === 'c2') { r = c1 * v1 / v2; unit = T.concFinal; }
  else { r = c2 * v2 / c1; unit = T.volInicial; }
  const resumen = __lang === 'en'
    ? `${unit} = ${r.toFixed(3)}. To dilute ${c1} in ${v1} to ${c2}: prepare ${r.toFixed(1)} total vol.`
    : __lang === 'pt'
    ? `${unit} = ${r.toFixed(3)}. Para diluir ${c1} em ${v1} a ${c2}: preparar ${r.toFixed(1)} de vol total.`
    : `${unit} = ${r.toFixed(3)}. Para diluir ${c1} en ${v1} a ${c2}: preparar ${r.toFixed(1)} de vol total.`;

  let insightText: string;
  if (modo === 'v2') {
    // r = final volume; solvent to add = r - v1
    const solvente = r - v1;
    insightText = __lang === 'en'
      ? `Take **${v1}** of the stock and add solvent up to **${r.toFixed(2)}** total (add ~**${solvente.toFixed(2)}** of solvent) to reach **${c2}**.`
      : __lang === 'pt'
      ? `Pegue **${v1}** do estoque e adicione solvente até **${r.toFixed(2)}** no total (adicione ~**${solvente.toFixed(2)}** de solvente) para chegar a **${c2}**.`
      : `Tomá **${v1}** de la solución madre y agregá solvente hasta **${r.toFixed(2)}** total (sumá ~**${solvente.toFixed(2)}** de solvente) para llegar a **${c2}**.`;
  } else if (modo === 'c2') {
    insightText = __lang === 'en'
      ? `Diluting **${c1}** in **${v1}** up to **${v2}** gives a final concentration of **${r.toFixed(3)}**.`
      : __lang === 'pt'
      ? `Diluir **${c1}** em **${v1}** até **${v2}** dá uma concentração final de **${r.toFixed(3)}**.`
      : `Diluir **${c1}** en **${v1}** hasta **${v2}** da una concentración final de **${r.toFixed(3)}**.`;
  } else {
    insightText = __lang === 'en'
      ? `To prepare **${v2}** at **${c2}** from a **${c1}** stock, measure out **${r.toFixed(3)}** of the concentrate and top up with solvent.`
      : __lang === 'pt'
      ? `Para preparar **${v2}** a **${c2}** a partir de um estoque **${c1}**, meça **${r.toFixed(3)}** do concentrado e complete com solvente.`
      : `Para preparar **${v2}** a **${c2}** desde una madre **${c1}**, medí **${r.toFixed(3)}** del concentrado y completá con solvente.`;
  }

  return {
    resultado: r.toFixed(3),
    resumen,
    _insight: { title: T.title, text: insightText, tone: 'neutral', icon: T.icon },
  };
}
