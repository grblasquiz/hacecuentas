import { DESEMPLEO_PISO, DESEMPLEO_TECHO, SMVM_FECHA } from '../data/smvm-ar-2026';
import { calcularDesempleoGeneral } from '../data/desempleo-general';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

export function asignacionDesempleoSeguroPrestacionAnses(i: Inputs): Outputs {
  // Se mantiene la clave histórica de la API. El importe para el cálculo es neto.
  const sueldo = Number(i.mejorSueldoNeto ?? i.ultimoSueldoBruto) || 0;
  const aportes = Number(i.mesesCotizados) || 0;
  const { base, inicial, duracion, total } = calcularDesempleoGeneral(sueldo, aportes);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const tope = base > DESEMPLEO_TECHO
    ? ` Se aplica el techo de ${fmt(DESEMPLEO_TECHO)}.`
    : sueldo > 0 && base < DESEMPLEO_PISO ? ` Se aplica el piso de ${fmt(DESEMPLEO_PISO)}.` : '';

  const _insight = duracion === 0
    ? {
        title: 'No alcanzás el mínimo',
        text: 'Para el régimen general de trabajadores permanentes se requieren al menos 6 meses de aportes dentro de los 3 años anteriores al cese.',
        tone: 'warn',
        icon: '🚫',
      }
    : {
        title: 'Tu prestación por desempleo',
        text: `La cuota inicial estimada es de **${fmt(inicial)}**. Te corresponden **${duracion} cuotas**, con un total estimado de **${fmt(total)}** a valores de ${SMVM_FECHA}.` +
          tope + ' La base es el 75% del mejor sueldo neto de los seis meses anteriores al cese.' +
          (duracion > 4 ? ' Las cuotas posteriores pueden reducirse, sujetas a los límites mensuales.' : ''),
        tone: 'good',
        icon: '🛟',
      };

  return {
    monto: fmt(inicial),
    meses: duracion.toString(),
    total: fmt(total),
    resumen: `Cuota inicial ${fmt(inicial)}, ${duracion} cuotas, total estimado ${fmt(total)} con los topes de ${SMVM_FECHA}.`,
    _insight,
  };
}
