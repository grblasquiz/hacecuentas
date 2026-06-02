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
  _insight?: any;
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

  let _insight;
  if (rendimientoA === rendimientoB) {
    mejorOpcion = 'Ambas inversiones tienen el mismo rendimiento';
    _insight = {
      title: 'Empate técnico',
      text: `Con la misma TNA (${tnaA}%) y plazo, ambas inversiones terminan en **$${fmt.format(rendimientoA)}**. Elegí por liquidez, riesgo o comodidad.`,
      tone: 'neutral' as const,
      icon: '⚖️'
    };
  } else {
    const ganadora = rendimientoA > rendimientoB ? 'A' : 'B';
    const tnaGana = rendimientoA > rendimientoB ? tnaA : tnaB;
    const tnaPierde = rendimientoA > rendimientoB ? tnaB : tnaA;
    const montoGana = Math.max(rendimientoA, rendimientoB);
    if (ganadora === 'A') {
      mejorOpcion = `Inversión A gana por $${fmt.format(diferenciaAbsoluta)} (TNA ${tnaA}% vs ${tnaB}%)`;
    } else {
      mejorOpcion = `Inversión B gana por $${fmt.format(diferenciaAbsoluta)} (TNA ${tnaB}% vs ${tnaA}%)`;
    }
    const pctExtra = (diferenciaAbsoluta / capital) * 100;
    _insight = {
      title: `Conviene la Inversión ${ganadora}`,
      text: `A ${meses} ${meses === 1 ? 'mes' : 'meses'}, la **Inversión ${ganadora}** (TNA ${tnaGana}%) rinde **$${fmt.format(montoGana)}** y le saca **$${fmt.format(diferenciaAbsoluta)}** a la de ${tnaPierde}% — equivale a un ${pctExtra.toFixed(1)}% extra sobre tu capital inicial.`,
      tone: 'good' as const,
      icon: '📈'
    };
  }

  return {
    rendimientoA: Math.round(rendimientoA),
    rendimientoB: Math.round(rendimientoB),
    diferenciaAbsoluta: Math.round(diferenciaAbsoluta),
    mejorOpcion,
    _insight,
  };
}
