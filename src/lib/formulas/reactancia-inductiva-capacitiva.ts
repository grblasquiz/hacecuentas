export interface ReactanciaInductivaCapacitivaInputs { modo: string; f: number; l?: number; c?: number; __lang?: string; }
export interface ReactanciaInductivaCapacitivaOutputs { xL: string; xC: string; ratio: string; resumen: string; _insight?: any; }

function fmtOhm(o: number): string { if (o >= 1e6) return (o/1e6).toFixed(2)+' MΩ'; if (o >= 1e3) return (o/1e3).toFixed(2)+' kΩ'; return o.toFixed(2)+' Ω'; }

export function reactanciaInductivaCapacitiva(i: ReactanciaInductivaCapacitivaInputs): ReactanciaInductivaCapacitivaOutputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      noFreq: 'Ingresá frecuencia',
      noL: 'Ingresá L',
      noC: 'Ingresá C',
      dominaInd: ' Circuito domina inductivamente.',
      dominaCap: ' Circuito domina capacitivamente.',
      resonancia: ' Circuito en resonancia.',
      atHz: (f: number) => `A ${f} Hz:`,
      insTitle: 'Qué pasa en tu circuito',
      insInd: (xl: string, xc: string) => `**XL = ${xl}** supera a **XC = ${xc}**: la reactancia inductiva domina y la corriente se atrasa respecto a la tensión.`,
      insCap: (xl: string, xc: string) => `**XC = ${xc}** supera a **XL = ${xl}**: la reactancia capacitiva domina y la corriente se adelanta a la tensión.`,
      insRes: (xl: string) => `**XL = XC = ${xl}**: el circuito está en resonancia, las reactancias se cancelan y la impedancia es puramente resistiva.`,
      insL: (xl: string) => `La reactancia inductiva es **XL = ${xl}** y crece con la frecuencia.`,
      insC: (xc: string) => `La reactancia capacitiva es **XC = ${xc}** y disminuye con la frecuencia.`,
    },
    en: {
      noFreq: 'Enter frequency',
      noL: 'Enter L',
      noC: 'Enter C',
      dominaInd: ' Circuit is inductively dominant.',
      dominaCap: ' Circuit is capacitively dominant.',
      resonancia: ' Circuit at resonance.',
      atHz: (f: number) => `At ${f} Hz:`,
      insTitle: 'What happens in your circuit',
      insInd: (xl: string, xc: string) => `**XL = ${xl}** exceeds **XC = ${xc}**: inductive reactance dominates and current lags the voltage.`,
      insCap: (xl: string, xc: string) => `**XC = ${xc}** exceeds **XL = ${xl}**: capacitive reactance dominates and current leads the voltage.`,
      insRes: (xl: string) => `**XL = XC = ${xl}**: the circuit is at resonance, the reactances cancel and the impedance is purely resistive.`,
      insL: (xl: string) => `Inductive reactance is **XL = ${xl}** and rises with frequency.`,
      insC: (xc: string) => `Capacitive reactance is **XC = ${xc}** and falls with frequency.`,
    },
  } as const)[__lang];
  const f = Number(i.f); if (!f || f <= 0) throw new Error(T.noFreq);
  const l = Number(i.l ?? 0) * 1e-3; // mH → H
  const c = Number(i.c ?? 0) * 1e-6; // µF → F
  const xL = l > 0 ? 2 * Math.PI * f * l : 0;
  const xC = c > 0 ? 1 / (2 * Math.PI * f * c) : 0;
  const ratio = (xL > 0 && xC > 0) ? (xL / xC).toFixed(3) : 'N/A';
  let resumen = T.atHz(f);
  if (l > 0) resumen += ` XL = ${fmtOhm(xL)}.`;
  if (c > 0) resumen += ` XC = ${fmtOhm(xC)}.`;
  if (l > 0 && c > 0) {
    if (xL > xC) resumen += T.dominaInd;
    else if (xC > xL) resumen += T.dominaCap;
    else resumen += T.resonancia;
  }
  let insText: string;
  if (l > 0 && c > 0) {
    if (xL > xC) insText = T.insInd(fmtOhm(xL), fmtOhm(xC));
    else if (xC > xL) insText = T.insCap(fmtOhm(xL), fmtOhm(xC));
    else insText = T.insRes(fmtOhm(xL));
  } else if (l > 0) {
    insText = T.insL(fmtOhm(xL));
  } else {
    insText = T.insC(fmtOhm(xC));
  }
  const _insight = { title: T.insTitle, text: insText, tone: 'neutral', icon: '⚡' };

  return {
    xL: l > 0 ? fmtOhm(xL) : T.noL,
    xC: c > 0 ? fmtOhm(xC) : T.noC,
    ratio, resumen, _insight
  };
}
