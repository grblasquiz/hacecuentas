export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
export function asignacionDesempleoSeguroPrestacionAnses(i: Inputs): Outputs {
  const s=Number(i.ultimoSueldoBruto)||0; const m=Number(i.mesesCotizados)||0;
  const monto=Math.min(s*0.5,1200000);
  let meses=0;
  if (m>=36) meses=12; else if (m>=24) meses=8; else if (m>=12) meses=4; else if (m>=6) meses=2;
  const total=monto*meses;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const topeAplica = s*0.5 > 1200000;
  const _insight = meses===0
    ? {
        title: 'No alcanzás el mínimo',
        text: `Con **${m} mes${m!==1?'es':''}** cotizados no llegás a los **6 meses** mínimos que pide ANSES para cobrar el seguro de desempleo. Necesitás al menos 6 meses de aportes en los últimos 3 años.`,
        tone: 'warn',
        icon: '🚫',
      }
    : {
        title: 'Tu prestación por desempleo',
        text: `Vas a cobrar **${fmt(monto)}** por mes durante **${meses} meses** (total **${fmt(total)}**), calculado como el **50%** de tu mejor sueldo. ` +
          (topeAplica
            ? 'Tu sueldo superó el tope, así que la cuota quedó limitada al máximo legal de **$1.200.000**.'
            : 'A más meses cotizados, más tiempo de cobertura: con 36 meses llegás al máximo de 12 cuotas.'),
        tone: 'good',
        icon: '🛟',
      };
  return { monto:'$'+monto.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), meses:meses.toString(), total:'$'+total.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Sueldo $${s.toLocaleString('es-AR')}, ${m} meses cotizados: ${meses} meses × $${monto.toFixed(0)}.`, _insight };
}
