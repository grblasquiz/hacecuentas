/** Comparar rendimiento de dos inversiones a mismo plazo */

export interface Inputs {
  montoInicial: number;
  tasaA: number;
  tasaB: number;
  plazoMeses: number;
}

export interface Outputs {
  rendimientoA: number;
  rendimientoB: number;
  diferenciaAbsoluta: number;
  mejorOpcion: string;
}

export function compararInversiones(i: Inputs): Outputs {
  const capital = Number(i.montoInicial);
  const tnaA = Number(i.tasaA);
  const tnaB = Number(i.tasaB);
  const meses = Number(i.plazoMeses);

  if (isNaN(capital) || capital <= 0) throw new Error('Ingresá el monto a invertir');
  if (isNaN(tnaA) || tnaA < 0) throw new Error('Ingresá la tasa de la Inversión A');
  if (isNaN(tnaB) || tnaB < 0) throw new Error('Ingresá la tasa de la Inversión B');
  if (isNaN(meses) || meses < 1) throw new Error('El plazo debe ser al menos 1 mes');

  const tasaMensualA = tnaA / 100 / 12;
  const tasaMensualB = tnaB / 100 / 12;

  const rendimientoA = capital * Math.pow(1 + tasaMensualA, meses);
  const rendimientoB = capital * Math.pow(1 + tasaMensualB, meses);

  const diferenciaAbsoluta = Math.abs(rendimientoA - rendimientoB);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  let mejorOpcion: string;

  if (rendimientoA > rendimientoB) {
    mejorOpcion = `Inversión A gana por $${fmt.format(diferenciaAbsoluta)} (TNA ${tnaA}% vs ${tnaB}%)`;
  } else if (rendimientoB > rendimientoA) {
    mejorOpcion = `Inversión B gana por $${fmt.format(diferenciaAbsoluta)} (TNA ${tnaB}% vs ${tnaA}%)`;
  } else {
    mejorOpcion = 'Ambas inversiones tienen el mismo rendimiento';
  }

  return {
    rendimientoA: Math.round(rendimientoA),
    rendimientoB: Math.round(rendimientoB),
    diferenciaAbsoluta: Math.round(diferenciaAbsoluta),
    mejorOpcion,
  };
}
