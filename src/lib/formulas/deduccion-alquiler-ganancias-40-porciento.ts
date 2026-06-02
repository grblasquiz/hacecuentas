export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function deduccionAlquilerGanancias40Porciento(i: Inputs): Outputs {
  const a=Number(i.alquilerMensual)||0; const mni=Number(i.mniActual)||21000000;
  const anualBruto=a*12*0.4;
  const anual=Math.min(anualBruto,mni);
  const mensual=anual/12;
  const dotSep=(n:number)=>n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const topeAplica = anualBruto > mni;
  const insightText = topeAplica
    ? `Tu 40% del alquiler daría **$${dotSep(anualBruto)}**, pero el tope del MNI lo limita a **$${dotSep(anual)}** anuales. Quedan **$${dotSep(anualBruto-anual)}** sin poder deducir por el límite.`
    : `Podés deducir el **40% completo**: **$${dotSep(anual)}** al año (**$${dotSep(mensual)}** por mes), todavía por debajo del tope MNI de $${dotSep(mni)}.`;
  return { deduccionAnual:'$'+dotSep(anual), dedMensual:'$'+dotSep(mensual), resumen:`Alquiler $${a}/mes: deducción anual $${anual.toFixed(0)} (40%, con tope MNI).`,
    _insight: {
      title: 'Cuánto deducís de verdad',
      text: insightText,
      tone: topeAplica ? 'warn' : 'good',
      icon: '🏠',
    },
  };
}
