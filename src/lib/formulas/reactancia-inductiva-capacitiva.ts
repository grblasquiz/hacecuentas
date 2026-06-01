export interface ReactanciaInductivaCapacitivaInputs { modo: string; f: number; l?: number; c?: number; __lang?: string; }
export interface ReactanciaInductivaCapacitivaOutputs { xL: string; xC: string; ratio: string; resumen: string; }

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
    },
    en: {
      noFreq: 'Enter frequency',
      noL: 'Enter L',
      noC: 'Enter C',
      dominaInd: ' Circuit is inductively dominant.',
      dominaCap: ' Circuit is capacitively dominant.',
      resonancia: ' Circuit at resonance.',
      atHz: (f: number) => `At ${f} Hz:`,
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
  return {
    xL: l > 0 ? fmtOhm(xL) : T.noL,
    xC: c > 0 ? fmtOhm(xC) : T.noC,
    ratio, resumen
  };
}
