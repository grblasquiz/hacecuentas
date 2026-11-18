import { SMVM_FECHA } from '../data/smvm-ar-2026';
import { calcularDesempleoGeneral } from '../data/desempleo-general';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function fondoDesempleoAnsesMontoTiempo(i: Inputs): Outputs {
  const sueldo = Number(i.mejorSueldoNeto ?? i.sueldoPromedio) || 0;
  const aportes = Number(i.mesesTrabajados) || 0;
  const { inicial, duracion, total } = calcularDesempleoGeneral(sueldo, aportes);
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');
  const interpretacion = duracion === 0
    ? 'Para el régimen general de trabajadores permanentes se requieren al menos 6 meses de aportes en los 3 años previos al cese.'
    : `Cuota inicial estimada de ${fmt(inicial)} y ${duracion} cuotas. Total estimado de ${fmt(total)} con topes de ${SMVM_FECHA}.`;

  return {
    montoMensual: fmt(inicial),
    duracion: `${duracion} meses`,
    interpretacion,
    _insight: {
      title: 'Tu prestación por desempleo',
      text: interpretacion,
      tone: duracion === 0 ? 'warn' : 'neutral',
      icon: '🛟',
    },
  };
}
