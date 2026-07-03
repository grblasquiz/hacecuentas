/** Cuánto ahorrar por día, semana y mes para llegar a una meta en un plazo dado. */
export interface Inputs {
  meta?: number | string;
  plazo_meses?: number | string;
  ya_tengo?: number | string;
  __country?: string;
}

export interface Outputs {
  por_dia: number;
  por_semana: number;
  por_mes: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function cuantoAhorrarDiaSemanaMeta(i: Inputs): Outputs {
  const meta = Math.max(0, Number(i.meta) || 0);
  const plazo_meses = Math.max(1, Math.floor(Number(i.plazo_meses) || 12));
  const ya_tengo = Math.max(0, Number(i.ya_tengo) || 0);

  const falta = Math.max(0, meta - ya_tengo);
  const por_mes = plazo_meses > 0 ? Math.round(falta / plazo_meses) : 0;
  const por_semana = Math.round(por_mes / 4.33);
  const por_dia = Math.round(por_mes / 30);

  const resumen = meta > 0
    ? `Te faltan ${falta.toLocaleString('es-AR')} para tu meta. En ${plazo_meses} meses son ${por_mes.toLocaleString('es-AR')} por mes, ${por_semana.toLocaleString('es-AR')} por semana o ${por_dia.toLocaleString('es-AR')} por día.`
    : 'Cargá tu meta de ahorro para calcular cuánto guardar por día, semana y mes.';

  const out: Outputs = { por_dia, por_semana, por_mes, resumen };

  if (meta > 0) {
    out._insight = {
      title: 'Tu plan de ahorro diario',
      text: falta > 0
        ? `Ahorrando **${por_dia.toLocaleString('es-AR')} por día** (o **${por_mes.toLocaleString('es-AR')} por mes**) llegás a tu meta de ${meta.toLocaleString('es-AR')} en **${plazo_meses} meses**. Automatizá una transferencia mensual para no depender de la voluntad.`
        : `¡Ya tenés lo suficiente! Con ${ya_tengo.toLocaleString('es-AR')} ya alcanzás tu meta de ${meta.toLocaleString('es-AR')}. No necesitás ahorrar más para este objetivo.`,
      tone: falta > 0 ? 'neutral' : 'good',
      icon: '📅',
    };
  }

  return out;
}
