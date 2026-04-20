export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function bitcoinHalving2028Proyeccion(i: Inputs): Outputs {
  const p=Number(i.precioActual)||0; const m=Number(i.multiplicadorEsperado)||2;
  const pp=p*m; const gan=((m-1)*100);
  return { precioPost:`USD ${Math.round(pp).toLocaleString('en-US')}`, gananciaPercent:`+${gan.toFixed(0)}%`, interpretacion:`Si BTC se multiplica por ${m} tras el halving 2028: precio ~$${Math.round(pp).toLocaleString('en-US')}. Nadie garantiza el multiplicador.` };
}
