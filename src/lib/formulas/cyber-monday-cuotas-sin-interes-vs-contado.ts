/** CyberMonday Argentina (noviembre): cuotas sin interés vs contado, ajustado por inflación */
export interface Inputs {
  precioContado: number;
  cuotas: number;
  inflacionAnualPct: number;
  descuentoContadoPct: number;
}
export interface Outputs {
  valorPresenteCuotas: number;
  valorContadoConDescuento: number;
  diferencia: number;
  recomendacion: string;
  ahorroPctRealEnCuotas: number;
  _insight?: any;
}

export function cyberMondayCuotasSinInteresVsContado(i: Inputs): Outputs {
  const precio = Number(i.precioContado);
  const cuotas = Number(i.cuotas) || 1;
  const inflacion = Number(i.inflacionAnualPct);
  const desc = Number(i.descuentoContadoPct) || 0;
  if (!precio || precio <= 0) throw new Error('Ingresá un precio de lista válido');
  if (isNaN(inflacion) || inflacion < 0) throw new Error('Ingresá una inflación anual válida');
  if (cuotas < 1) throw new Error('La cantidad de cuotas debe ser al menos 1');

  const inflacionMensual = Math.pow(1 + inflacion / 100, 1 / 12) - 1;
  const cuotaMensual = precio / cuotas;
  let valorPresenteCuotas = 0;
  for (let mes = 1; mes <= cuotas; mes++) {
    valorPresenteCuotas += cuotaMensual / Math.pow(1 + inflacionMensual, mes - 1);
  }
  const valorContadoConDescuento = precio * (1 - desc / 100);
  const diferencia = valorContadoConDescuento - valorPresenteCuotas;
  const ahorroPctRealEnCuotas = ((precio - valorPresenteCuotas) / precio) * 100;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  let recomendacion: string;
  if (diferencia > 0) {
    recomendacion = `Cuotas CyberMonday ganan: ahorrás $${fmt(diferencia)} en valor presente (${ahorroPctRealEnCuotas.toFixed(1)}% real). Como cae cerca del aguinaldo de diciembre, podés cubrir las primeras cuotas con ese ingreso extra.`;
  } else if (diferencia === 0) {
    recomendacion = 'Es equivalente en valor presente. Si tenés flujo apretado, cuotas. Si tenés cash, contado con descuento.';
  } else {
    recomendacion = `Contado con ${desc}% CyberMonday conviene: ahorrás $${fmt(-diferencia)} sobre el valor presente de las cuotas. Es buena opción si querés liberar el aguinaldo para otras cosas.`;
  }
  let _insight;
  if (diferencia > 0) {
    _insight = {
      title: `Ganan las ${cuotas} cuotas`,
      text: `El valor presente de pagar en **${cuotas} cuotas** ($${fmt(valorPresenteCuotas)}) es **$${fmt(diferencia)}** más barato que el contado con ${desc}% ($${fmt(valorContadoConDescuento)}). La inflación licúa **${ahorroPctRealEnCuotas.toFixed(1)}%** del precio.`,
      tone: 'good',
      icon: '💳',
    };
  } else if (diferencia === 0) {
    _insight = {
      title: 'Empate técnico',
      text: `Cuotas y contado quedan equivalentes en valor presente (~$${fmt(valorPresenteCuotas)}). Decidí por flujo de caja: cuotas si está apretado, contado si tenés el efectivo.`,
      tone: 'neutral',
      icon: '⚖️',
    };
  } else {
    _insight = {
      title: `Gana el contado (-${desc}%)`,
      text: `Pagar contado con **${desc}%** ($${fmt(valorContadoConDescuento)}) ahorra **$${fmt(-diferencia)}** frente al valor presente de las ${cuotas} cuotas ($${fmt(valorPresenteCuotas)}).`,
      tone: 'neutral',
      icon: '💵',
    };
  }

  return {
    valorPresenteCuotas: Math.round(valorPresenteCuotas),
    valorContadoConDescuento: Math.round(valorContadoConDescuento),
    diferencia: Math.round(diferencia),
    recomendacion,
    ahorroPctRealEnCuotas: Number(ahorroPctRealEnCuotas.toFixed(2)),
    _insight,
  };
}
