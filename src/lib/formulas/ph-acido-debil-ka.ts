export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function phAcidoDebilKa(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const ka = Number(i.ka); const c = Number(i.c);
  if (!ka || !c) throw new Error(__lang === 'en' ? 'Fill in all fields' : 'Completá todos los campos');
  // Cuadrática exacta: x^2 + Ka*x - Ka*C = 0
  const x = (-ka + Math.sqrt(ka * ka + 4 * ka * c)) / 2;
  const ph = -Math.log10(x);
  const pka = -Math.log10(ka);
  const alfa = (x / c) * 100;
  const aproxOk = alfa < 5;
  const resumen = __lang === 'en'
    ? `pH ${ph.toFixed(2)} with [H+] = ${x.toExponential(3)} M. The acid is ${alfa.toFixed(2)}% dissociated (pKa ${pka.toFixed(2)}).`
    : `pH ${ph.toFixed(2)} con [H⁺] = ${x.toExponential(3)} M. El ácido está disociado un ${alfa.toFixed(2)}% (pKa ${pka.toFixed(2)}).`;
  const _insight = {
    title: __lang === 'en' ? 'Weak acid equilibrium' : 'Equilibrio del ácido débil',
    text: __lang === 'en'
      ? `Only **${alfa.toFixed(2)}%** of the acid gives up its proton, so the pH is ${ph.toFixed(2)} instead of the ${(-Math.log10(c)).toFixed(2)} a strong acid would give at the same concentration.${aproxOk ? ' Dissociation is under 5%, so the usual √(Ka·C) shortcut would also have worked here.' : ' Dissociation is over 5%, so the √(Ka·C) shortcut would be inaccurate — this result comes from the full quadratic.'}`
      : `Solo el **${alfa.toFixed(2)}%** del ácido cede su protón, así que el pH es ${ph.toFixed(2)} en vez del ${(-Math.log10(c)).toFixed(2)} que daría un ácido fuerte a la misma concentración.${aproxOk ? ' La disociación es menor al 5%, así que el atajo √(Ka·C) también hubiera servido acá.' : ' La disociación supera el 5%, así que el atajo √(Ka·C) sería impreciso: este resultado sale de la cuadrática completa.'}`,
    tone: 'neutral',
    icon: '🧪',
  };
  return { ph: ph.toFixed(2), h: x.toExponential(3) + ' M', pka: pka.toFixed(2), alfa: alfa.toFixed(2) + '%', resumen, _insight };
}
