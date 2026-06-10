import { GNI_ANUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function deduccionAlquilerGanancias40Porciento(i: Inputs): Outputs {
  // Tope legal del 40% deducible = Ganancia No Imponible anual (fuente única
  // _ganancias-escala). Si el usuario no pasa un MNI propio, usamos la GNI 2026.
  const a=Number(i.alquilerMensual)||0; const mni=Number(i.mniActual)||GNI_ANUAL;
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
