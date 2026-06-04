export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function tarjetaAlimentarMontoHijos2026(i: Inputs): Outputs {
  const h=Number(i.hijos)||0;
  const montos=[0,72250,113299,149425];
  const m=h>=3?montos[3]:montos[h]||0;

  const anual = m * 12;
  const _insight = m > 0
    ? {
        title: 'Lo que recibís por mes y por año',
        text: `Con **${h} ${h === 1 ? 'hijo' : 'hijos'}** menor${h === 1 ? '' : 'es'} de 14 años cobrás **$${m.toLocaleString('es-AR')} por mes**, que son **$${anual.toLocaleString('es-AR')} al año**. El monto se acredita en la tarjeta y solo se puede usar para comprar alimentos.${h >= 3 ? ' A partir de 3 hijos el monto es fijo, no sigue subiendo por cada hijo adicional.' : ''}`,
        tone: 'good',
        icon: '🛒',
      }
    : {
        title: 'Sin hijos en el rango no hay asignación',
        text: `La Tarjeta Alimentar cubre **hijos menores de 14 años**. Con **0 hijos** en ese rango no corresponde monto: cargá la cantidad de hijos para ver cuánto te toca.`,
        tone: 'neutral',
        icon: '🛒',
      };

  return { monto:'$'+m.toLocaleString('es-AR'), resumen:`${h} hijos menores 14: Tarjeta Alimentar $${m.toLocaleString('es-AR')}/mes.`, _insight };
}
