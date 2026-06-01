export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function depositosAlquilerCuantosMesesDevolucion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const T = ({
    es: {
      devolucion: '30 días post egreso - daños',
      meses_actual: '1-3 meses',
      meses_nuevo: 'máx 1 mes',
      resumen_prefix: 'Alquiler',
      resumen_mid: 'depósito',
      resumen_suffix: '= hasta',
    },
    en: {
      devolucion: '30 days after move-out - damages',
      meses_actual: '1-3 months',
      meses_nuevo: 'max 1 month',
      resumen_prefix: 'Rent',
      resumen_mid: 'deposit',
      resumen_suffix: '= up to',
    },
  } as const)[__lang];
  const a=Number(i.alquilerMensual)||0; const c=String(i.contrato||'actual');
  const max=c==='actual'?a*3:a;
  return { deposito:'$'+a.toLocaleString('es-AR')+' - $'+max.toLocaleString('es-AR'), maximo:'$'+max.toLocaleString('es-AR'), devolucion:T.devolucion, resumen:`${T.resumen_prefix} $${a.toLocaleString('es-AR')}: ${T.resumen_mid} ${c==='actual'?T.meses_actual:T.meses_nuevo} ${T.resumen_suffix} $${max.toLocaleString('es-AR')}.` };
}
