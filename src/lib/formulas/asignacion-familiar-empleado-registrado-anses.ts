export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function asignacionFamiliarEmpleadoRegistradoAnses(i: Inputs): Outputs {
  const i_=Number(i.ingresoGrupoFam)||0; const h=Number(i.hijos)||0;
  let porHijo=0; let rango='';
  if (i_<=A.suaf.tramos[0].limite) { porHijo=A.suaf.tramos[0].asignacion; rango='Rango 1'; }
  else if (i_<=A.suaf.tramos[1].limite) { porHijo=A.suaf.tramos[1].asignacion; rango='Rango 2'; }
  else if (i_<=A.suaf.tramos[2].limite) { porHijo=A.suaf.tramos[2].asignacion; rango='Rango 3'; }
  else if (i_<=A.suaf.tramos[3].limite) { porHijo=A.suaf.tramos[3].asignacion; rango='Rango 4'; }
  else { porHijo=0; rango='Fuera de tope'; }
  const total=porHijo*h;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const _insight = porHijo>0
    ? {
        title: `${rango}: ${fmt(porHijo)} por hijo`,
        text: `Con un ingreso del grupo familiar de **${fmt(i_)}** cobrás **${fmt(porHijo)}** por hijo, o sea **${fmt(total)}/mes** por tus **${h}** hijo${h!==1?'s':''}. El monto baja a medida que sube el ingreso del grupo: cuanto menor el IGF, mayor la asignación.`,
        tone: 'good',
        icon: '👶',
      }
    : {
        title: 'Fuera de tope',
        text: `El ingreso del grupo familiar (**${fmt(i_)}**) supera el tope de **${fmt(A.suaf.topeIgf)}**, así que no te corresponde la asignación por hijo del SUAF. También se controla el tope individual de ${fmt(A.suaf.topeIndividual)} por integrante.`,
        tone: 'warn',
        icon: '🚫',
      };
  const topMax = Math.max(7000000, i_ + 1);
  const _chart = {
    type: 'scale',
    marker: Math.round(i_),
    markerLabel: `IGF: ${fmt(i_)}`,
    min: 0,
    segments: [
      { nombre: 'Rango 1', max: A.suaf.tramos[0].limite, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Rango 2', max: A.suaf.tramos[1].limite, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Rango 3', max: A.suaf.tramos[2].limite, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Rango 4', max: A.suaf.tramos[3].limite, color: '#ea580c', colorDark: '#fb923c' },
      { nombre: 'Fuera de tope', max: topMax, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Rangos de ingreso del grupo familiar para la asignación por hijo de ANSES. Tu IGF de ${fmt(i_)} cae en ${rango}.`,
  };
  return { porHijo:'$'+porHijo.toLocaleString('es-AR'), total:'$'+total.toLocaleString('es-AR'), rango, resumen:`${h} hijos, ingreso grupo $${i_.toLocaleString('es-AR')}: $${total.toLocaleString('es-AR')}/mes (${rango}).`, _insight, _chart };
}
import { ASIGNACIONES_ANSES_AGO_2026 as A } from '../data/argentina-2026';
