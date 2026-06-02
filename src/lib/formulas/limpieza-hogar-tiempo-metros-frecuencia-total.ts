export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export interface Inputs { [k: string]: number | string; }
export function limpiezaHogarTiempoMetrosFrecuenciaTotal(i: Inputs): Outputs {
  const m=Number(i.m2Hogar)||0; const p=String(i.profundidad||'mantenimiento');
  const minPorM2=({'mantenimiento':2,'media':3,'a_fondo':6} as Record<string,number>)[p];
  const min=m*minPorM2; const h=min/60;
  const hora=8000; const costo=h*hora;
  const rec=m<50?'1 vez/semana':m<100?'2 veces/semana':'3 veces/semana o servicio';
  const nivel = p==='a_fondo' ? 'a fondo' : p==='media' ? 'media' : 'de mantenimiento';
  const _insight = {
    title: `${h.toFixed(1)} h por semana en limpieza`,
    text: `Para **${m} m²** con limpieza ${nivel} (${minPorM2} min/m²) necesitás **~${h.toFixed(1)} horas semanales**. Tercerizarlo cuesta **$${Math.round(costo).toLocaleString('es-AR')}** a $${hora.toLocaleString('es-AR')}/hora; recomendado: ${rec}.`,
    tone: 'neutral',
    icon: '🧽',
  };
  return { tiempoSemanal:`${h.toFixed(1)} horas (${Math.round(min)} min)`, recomendacion:rec, serviciosCosto:`Servicio: $${Math.round(costo).toLocaleString('es-AR')}`, _insight };
}
