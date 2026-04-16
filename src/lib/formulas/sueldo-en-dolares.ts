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

  return { sueldoBlue, sueldoOficial, sueldoMEP, sueldoCrypto, ranking };
}
