/** Sueldo en dólares: convertir sueldo ARS a USD (blue, oficial, MEP, crypto) */

export interface Inputs {
  sueldoARS: number;
  dolarOficial: number;
  dolarBlue: number;
  dolarMEP: number;
  dolarCrypto: number;
}

export interface Outputs {
  sueldoBlue: number;
  sueldoOficial: number;
  sueldoMEP: number;
  sueldoCrypto: number;
  ranking: string;
  _insight?: any;
}

export function sueldoEnDolares(i: Inputs): Outputs {
  const sueldo = Number(i.sueldoARS);
  const oficial = Number(i.dolarOficial);
  const blue = Number(i.dolarBlue);
  const mep = Number(i.dolarMEP);
  const crypto = Number(i.dolarCrypto);

  if (isNaN(sueldo) || sueldo <= 0) throw new Error('Ingresá tu sueldo en pesos');
  if (isNaN(oficial) || oficial <= 0) throw new Error('Ingresá la cotización del dólar oficial');
  if (isNaN(blue) || blue <= 0) throw new Error('Ingresá la cotización del dólar blue');
  if (isNaN(mep) || mep <= 0) throw new Error('Ingresá la cotización del dólar MEP');
  if (isNaN(crypto) || crypto <= 0) throw new Error('Ingresá la cotización del dólar crypto');

  const sueldoOficial = Math.round((sueldo / oficial) * 100) / 100;
  const sueldoBlue = Math.round((sueldo / blue) * 100) / 100;
  const sueldoMEP = Math.round((sueldo / mep) * 100) / 100;
  const sueldoCrypto = Math.round((sueldo / crypto) * 100) / 100;

  const tipos: { nombre: string; valor: number }[] = [
    { nombre: 'Oficial', valor: sueldoOficial },
    { nombre: 'Blue', valor: sueldoBlue },
    { nombre: 'MEP', valor: sueldoMEP },
    { nombre: 'Crypto', valor: sueldoCrypto },
  ];
  tipos.sort((a, b) => b.valor - a.valor);

  const ranking = tipos.map((t, idx) => `${idx + 1}° ${t.nombre}: US$ ${t.valor.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`).join(' | ');

  const mejor = tipos[0];
  const peor = tipos[tipos.length - 1];
  const brecha = mejor.valor - peor.valor;
  const pctBrecha = peor.valor > 0 ? Math.round((brecha / peor.valor) * 100) : 0;
  const usd = (n: number) => 'US$ ' + n.toLocaleString('es-AR', { minimumFractionDigits: 2 });
  const insight = {
    title: 'A qué dólar te conviene medirlo',
    text: pctBrecha >= 5
      ? `Tu sueldo vale **${usd(mejor.valor)}** al dólar **${mejor.nombre}** pero solo **${usd(peor.valor)}** al **${peor.nombre}**: una brecha del **${pctBrecha}%** según con qué tipo de cambio lo compares.`
      : `Las cotizaciones están casi alineadas: tu sueldo ronda los **${usd(mejor.valor)}** sin importar el tipo de dólar (brecha de apenas **${pctBrecha}%**).`,
    tone: pctBrecha >= 15 ? 'warn' : 'neutral',
    icon: '💵',
  };

  return { sueldoBlue, sueldoOficial, sueldoMEP, sueldoCrypto, ranking, _insight: insight };
}
