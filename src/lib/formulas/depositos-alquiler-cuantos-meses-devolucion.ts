export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function depositosAlquilerCuantosMesesDevolucion(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      devolucion: '30 días post egreso - daños',
      meses_actual: '1-3 meses',
      meses_nuevo: 'máx 1 mes',
      resumen_prefix: 'Alquiler',
      resumen_mid: 'depósito',
      resumen_suffix: '= hasta',
      insight_title_nuevo: 'Contrato nuevo: depósito acotado por ley',
      insight_title_actual: 'Contrato anterior: depósito de hasta 3 meses',
      insight_nuevo: 'Con la ley actual el depósito no puede superar **1 mes** de alquiler: como máximo **$X**. Te lo devuelven dentro de los **30 días** del egreso, descontando daños comprobados.',
      insight_actual: 'En contratos previos el depósito podía llegar a **3 meses**: hasta **$X**. Revisá tu contrato, porque ese dinero queda inmovilizado y se devuelve recién al egreso menos daños.',
    },
    en: {
      devolucion: '30 days after move-out - damages',
      meses_actual: '1-3 months',
      meses_nuevo: 'max 1 month',
      resumen_prefix: 'Rent',
      resumen_mid: 'deposit',
      resumen_suffix: '= up to',
      insight_title_nuevo: 'New contract: deposit capped by law',
      insight_title_actual: 'Older contract: deposit of up to 3 months',
      insight_nuevo: 'Under current law the deposit cannot exceed **1 month** of rent: at most **$X**. It is returned within **30 days** of move-out, minus proven damages.',
      insight_actual: 'In older contracts the deposit could reach **3 months**: up to **$X**. Check your contract, since that money stays locked and is returned only at move-out minus damages.',
    },
    pt: {
      devolucion: '30 dias após saída - danos',
      meses_actual: '1-3 meses',
      meses_nuevo: 'máx 1 mês',
      resumen_prefix: 'Aluguel',
      resumen_mid: 'depósito',
      resumen_suffix: '= até',
      insight_title_nuevo: 'Contrato novo: depósito limitado por lei',
      insight_title_actual: 'Contrato anterior: depósito de até 3 meses',
      insight_nuevo: 'Pela lei atual o depósito não pode superar **1 mês** de aluguel: no máximo **$X**. É devolvido em até **30 dias** da saída, descontando danos comprovados.',
      insight_actual: 'Em contratos antigos o depósito podia chegar a **3 meses**: até **$X**. Revise seu contrato, pois esse dinheiro fica retido e é devolvido só na saída menos danos.',
    },
  } as const)[__lang];
  const a=Number(i.alquilerMensual)||0; const c=String(i.contrato||'actual');
  const max=c==='actual'?a*3:a;
  const esNuevo = c!=='actual';
  const _insight = {
    title: esNuevo ? T.insight_title_nuevo : T.insight_title_actual,
    text: (esNuevo ? T.insight_nuevo : T.insight_actual).replace('$X', '$'+max.toLocaleString('es-AR')),
    tone: esNuevo ? 'good' : 'warn',
    icon: '🔑',
  };
  return { deposito:'$'+a.toLocaleString('es-AR')+' - $'+max.toLocaleString('es-AR'), maximo:'$'+max.toLocaleString('es-AR'), devolucion:T.devolucion, resumen:`${T.resumen_prefix} $${a.toLocaleString('es-AR')}: ${T.resumen_mid} ${c==='actual'?T.meses_actual:T.meses_nuevo} ${T.resumen_suffix} $${max.toLocaleString('es-AR')}.`, _insight };
}
