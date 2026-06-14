export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

/** Regla del 72: tiempo (en años y en años+meses) que tarda el dinero en duplicarse a una tasa anual compuesta. */
export function ahorroCompuestoTiempoDuplicarRegla72(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const tasa = Number(i.tasa) || 0;

  if (tasa <= 0) {
    throw new Error(__lang === 'en' ? 'Enter a positive annual rate' : 'Ingresá una tasa anual positiva');
  }
  if (tasa > 100) {
    throw new Error(__lang === 'en' ? 'The rate seems too high, please check the value' : 'La tasa parece demasiado alta, revisá el valor');
  }

  // Regla del 72: atajo aproximado.
  const aniosRegla = 72 / tasa;
  // Fórmula exacta del interés compuesto: ln(2) / ln(1 + tasa/100).
  const aniosExacto = Math.log(2) / Math.log(1 + tasa / 100);

  // Años + meses (usando el valor EXACTO, que es el real).
  const aniosEnteros = Math.floor(aniosExacto);
  const meses = Math.round((aniosExacto - aniosEnteros) * 12);
  // Corrección por redondeo de 12 meses → suma 1 año.
  const aniosFinal = meses === 12 ? aniosEnteros + 1 : aniosEnteros;
  const mesesFinal = meses === 12 ? 0 : meses;

  const fmtAniosMeses = __lang === 'en'
    ? `${aniosFinal} ${aniosFinal === 1 ? 'year' : 'years'}${mesesFinal > 0 ? ` and ${mesesFinal} ${mesesFinal === 1 ? 'month' : 'months'}` : ''}`
    : `${aniosFinal} ${aniosFinal === 1 ? 'año' : 'años'}${mesesFinal > 0 ? ` y ${mesesFinal} ${mesesFinal === 1 ? 'mes' : 'meses'}` : ''}`;

  // Cuánto se desvía el atajo respecto del cálculo exacto.
  const desvioPct = Math.abs(aniosRegla - aniosExacto) / aniosExacto * 100;

  const resumen = __lang === 'en'
    ? `At ${tasa}% annual compound, the rule of 72 estimates your money doubles in ${aniosRegla.toFixed(1)} years. The exact figure is ${aniosExacto.toFixed(2)} years (${fmtAniosMeses}).`
    : `Al ${tasa}% anual compuesto, la regla del 72 estima que tu dinero se duplica en ${aniosRegla.toFixed(1)} años. El valor exacto es ${aniosExacto.toFixed(2)} años (${fmtAniosMeses}).`;

  const _insight = __lang === 'en'
    ? {
        title: 'Doubling time',
        text: `At **${tasa}%** compounded annually, the rule of 72 says ~**${aniosRegla.toFixed(1)} years**; the exact math gives **${aniosExacto.toFixed(2)} years** (**${fmtAniosMeses}**). The shortcut is off by about **${desvioPct.toFixed(1)}%** here — the gap grows as the rate gets further from ~8%.`,
        tone: aniosExacto <= 10 ? 'good' : 'neutral',
        icon: '⏳',
      }
    : {
        title: 'Tiempo para duplicar',
        text: `Al **${tasa}%** anual compuesto, la regla del 72 da ~**${aniosRegla.toFixed(1)} años**; el cálculo exacto da **${aniosExacto.toFixed(2)} años** (**${fmtAniosMeses}**). El atajo se desvía un **${desvioPct.toFixed(1)}%** acá — la diferencia crece cuanto más lejos está la tasa del ~8%.`,
        tone: aniosExacto <= 10 ? 'good' : 'neutral',
        icon: '⏳',
      };

  return {
    resultado: __lang === 'en'
      ? `${aniosRegla.toFixed(1)} years`
      : `${aniosRegla.toFixed(1).replace('.', ',')} años`,
    aniosExacto: aniosExacto.toFixed(2).replace('.', __lang === 'en' ? '.' : ','),
    aniosMeses: fmtAniosMeses,
    resumen,
    _insight,
  };
}
