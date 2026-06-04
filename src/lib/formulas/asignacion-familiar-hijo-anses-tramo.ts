export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function asignacionFamiliarHijoAnsesTramo(i: Inputs): Outputs {
  const ig=Number(i.ingresoGrupoFamiliar)||0; const h=Number(i.cantidadHijos)||0; const hd=Number(i.hijoDiscapacitado)||0;
  let porHijo=0, tramo='';
  if (ig<1122074){ porHijo=72474; tramo='A (mayor asignación)'; }
  else if (ig<1645630){ porHijo=48888; tramo='B'; }
  else if (ig<1899934){ porHijo=29570; tramo='C'; }
  else if (ig<5941936){ porHijo=15257; tramo='D'; }
  else { porHijo=0; tramo='E (supera el tope, sin asignación general)'; }
  const porDisc=120000;
  const total=h*porHijo+hd*porDisc;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const generalMonto=h*porHijo;
  const discMonto=hd*porDisc;
  const tramoCorto=tramo.split(' ')[0];
  const _insight = porHijo>0
    ? {
        title: `Tramo ${tramoCorto}: ${fmt(total)}/mes`,
        text: `Con un ingreso del grupo familiar de **${fmt(ig)}** estás en el **tramo ${tramoCorto}** y cobrás **${fmt(porHijo)}** por hijo. ` +
          (hd>0
            ? `Sumás **${fmt(generalMonto)}** por tus **${h}** hijo${h!==1?'s':''} más **${fmt(discMonto)}** por **${hd}** hijo${hd!==1?'s':''} con discapacidad, total **${fmt(total)}/mes**.`
            : `Por tus **${h}** hijo${h!==1?'s':''} son **${fmt(total)}/mes**. A menor ingreso familiar, mayor la asignación por hijo.`),
        tone: 'good',
        icon: '👶',
      }
    : {
        title: 'Tramo D: sin asignación general',
        text: `El ingreso del grupo familiar (**${fmt(ig)}**) supera **$5.941.936**, así que no cobrás la asignación general por hijo. ` +
          (hd>0
            ? `Igual te corresponden **${fmt(discMonto)}/mes** por **${hd}** hijo${hd!==1?'s':''} con discapacidad, que no tiene tope de ingresos.`
            : 'Solo la asignación por hijo con discapacidad sigue vigente, ya que no tiene tope de ingresos.'),
        tone: hd>0 ? 'neutral' : 'warn',
        icon: hd>0 ? '♿' : '🚫',
      };
  const topMax = Math.max(5941936, ig + 1);
  const _chart = {
    type: 'scale',
    marker: Math.round(ig),
    markerLabel: `IGF: ${fmt(ig)}`,
    min: 0,
    segments: [
      { nombre: 'Tramo A', max: 1122074, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Tramo B', max: 1645630, color: '#65a30d', colorDark: '#84cc16' },
      { nombre: 'Tramo C', max: 1899934, color: '#d97706', colorDark: '#f59e0b' },
      { nombre: 'Tramo D', max: topMax, color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Tramos de ingreso del grupo familiar de ANSES. Tu IGF de ${fmt(ig)} cae en el ${tramo}.`,
  };
  return { asignacionPorHijo:`$${porHijo.toLocaleString('es-AR')}`, totalMensual:`$${total.toLocaleString('es-AR')}`, tramo:tramo, _insight, _chart };
}
