/** Ahorro por dejar de fumar */
export interface Inputs { cigarrillosDia: number; precioAtado: number; }
export interface Outputs { ahorroPorMes: number; ahorroPorAno: number; ahorro5Anos: number; ahorro10Anos: number; mensaje: string; }

export function ahorroDejarFumar(i: Inputs): Outputs {
  const cigDia = Number(i.cigarrillosDia) || 10;
  const precioAtado = Number(i.precioAtado) || 5000;
  if (cigDia <= 0 || precioAtado <= 0) throw new Error('Ingresá valores válidos');

  const precioPorCig = precioAtado / 20;
  const gastoDia = Math.round(cigDia * precioPorCig);
  const ahorroPorMes = gastoDia * 30;
  const ahorroPorAno = gastoDia * 365;
  const ahorro5Anos = ahorroPorAno * 5;
  const ahorro10Anos = ahorroPorAno * 10;

  return {
    ahorroPorMes, ahorroPorAno, ahorro5Anos, ahorro10Anos,
    mensaje: `Gastás $${gastoDia.toLocaleString()}/día en cigarrillos. Si dejás: ahorrás $${ahorroPorMes.toLocaleString()}/mes, $${ahorroPorAno.toLocaleString()}/año. En 10 años: $${ahorro10Anos.toLocaleString()}.`
  };
}