/** Cuotas sin interés vs contado con inflación Argentina — valor presente */
export interface Inputs { precioContado: number; cuotas: number; inflacionAnualPct: number; descuentoContadoPct: number; }
export interface Outputs { valorPresenteCuotas: number; valorContadoConDescuento: number; diferencia: number; recomendacion: string; ahorroPctRealEnCuotas: number; _insight?: any; }

export function cuotasVsContadoInflacionAr(i: Inputs): Outputs {
  const precio = Number(i.precioContado);
  const cuotas = Number(i.cuotas) || 1;
  const inflacion = Number(i.inflacionAnualPct);
  const desc = Number(i.descuentoContadoPct) || 0;
  if (!precio || precio <= 0) throw new Error('Ingresá precio contado válido');
  if (isNaN(inflacion) || inflacion < 0) throw new Error('Ingresá inflación anual válida');
  // Inflación mensual a partir de anual
  const inflacionMensual = Math.pow(1 + inflacion / 100, 1 / 12) - 1;
  const cuotaMensual = precio / cuotas;
  // Valor presente de las cuotas (flujo de pagos mensuales descontados por inflación)
  let valorPresenteCuotas = 0;
  for (let mes = 1; mes <= cuotas; mes++) {
    valorPresenteCuotas += cuotaMensual / Math.pow(1 + inflacionMensual, mes - 1);
  }
  const valorContadoConDescuento = precio * (1 - desc / 100);
  const diferencia = valorContadoConDescuento - valorPresenteCuotas;
  const ahorroPctRealEnCuotas = ((precio - valorPresenteCuotas) / precio) * 100;
  let recomendacion: string;
  if (diferencia > 0) {
    recomendacion = `Cuotas sin interés te ahorran ${Math.round(diferencia).toLocaleString('es-AR')} ARS en valor presente (${ahorroPctRealEnCuotas.toFixed(1)}% real). Siempre cuotas.`;
  } else if (diferencia === 0) {
    recomendacion = 'Es equivalente. Elegí según tu flujo de caja.';
  } else {
    recomendacion = `Contado con ${desc}% de descuento conviene: te ahorrás ${Math.round(-diferencia).toLocaleString('es-AR')} ARS sobre el valor presente de las cuotas.`;
  }
  // Insight: ganador y por cuánto, en valor presente
  let _insight: any;
  if (diferencia > 0) {
    _insight = {
      title: 'Financiá en cuotas',
      text: `Con inflación anual del **${inflacion}%**, dividir en ${cuotas} cuotas sin interés te ahorra **${Math.round(diferencia).toLocaleString('es-AR')} ARS** en valor presente (${ahorroPctRealEnCuotas.toFixed(1)}% real): la inflación te diluye las cuotas futuras.`,
      tone: 'good',
      icon: '💳',
    };
  } else if (diferencia === 0) {
    _insight = {
      title: 'Empate técnico',
      text: `Cuotas y contado quedan **equivalentes** en valor presente. Decidí por tu flujo de caja, no por el precio.`,
      tone: 'neutral',
      icon: '⚖️',
    };
  } else {
    _insight = {
      title: 'Pagá de contado',
      text: `El **${desc}% de descuento** por contado supera el beneficio de financiar: pagando ya te ahorrás **${Math.round(-diferencia).toLocaleString('es-AR')} ARS** sobre el valor presente de las ${cuotas} cuotas.`,
      tone: 'warn',
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
