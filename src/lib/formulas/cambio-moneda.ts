/** Cambio de moneda: USD/EUR/BRL a ARS con múltiples tipos de cambio */
export interface Inputs {
  monto: number;
  moneda: 'usd' | 'eur' | 'brl' | string;
  cotizacionOficial: number;
  cotizacionBlue?: number;
  cotizacionMEP?: number;
  cotizacionTarjeta?: number;
  direccion?: 'a-pesos' | 'a-divisa' | string;
}
export interface Outputs {
  enOficial: number;
  enBlue: number;
  enMEP: number;
  enTarjeta: number;
  brechaPct: number;
  mejorParaComprar: string;
}

export function cambioMoneda(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const oficial = Number(i.cotizacionOficial);
  const blue = Number(i.cotizacionBlue) || oficial * 1.4;
  const mep = Number(i.cotizacionMEP) || oficial * 1.15;
  const tarjeta = Number(i.cotizacionTarjeta) || oficial * 1.6;
  const dir = String(i.direccion || 'a-pesos');
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (!oficial || oficial <= 0) throw new Error('Ingresá la cotización oficial');

  let valorOf = 0, valorBl = 0, valorMep = 0, valorTarj = 0;
  if (dir === 'a-pesos') {
    valorOf = monto * oficial;
    valorBl = monto * blue;
    valorMep = monto * mep;
    valorTarj = monto * tarjeta;
  } else {
    valorOf = monto / oficial;
    valorBl = monto / blue;
    valorMep = monto / mep;
    valorTarj = monto / tarjeta;
  }

  const brecha = ((blue / oficial) - 1) * 100;
  const mejor = dir === 'a-pesos' ? 'blue (mayor rendimiento)' : 'oficial (menor costo)';

  return {
    enOficial: Math.round(valorOf),
    enBlue: Math.round(valorBl),
    enMEP: Math.round(valorMep),
    enTarjeta: Math.round(valorTarj),
    brechaPct: Number(brecha.toFixed(2)),
    mejorParaComprar: mejor,
  };
}
