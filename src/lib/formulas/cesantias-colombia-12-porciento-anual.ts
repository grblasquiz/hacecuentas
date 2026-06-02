export interface Inputs {
  salario_mensual: number;
  auxilio_transporte: number;
  dias_trabajados: number;
  anos_servicio: number;
  tasa_interes_anual: number;
}

export interface Outputs {
  cesantia_anual: number;
  cesantia_acumulada: number;
  interes_anual_12pct: number;
  total_cesantia_interes: number;
  cesantia_diaria: number;
  dias_restantes_año: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validación
  const DIAS_ANO_LABORAL = 360; // DIAN estándar
  const DIAS_DEPOSITO_LIMITE = 14; // febrero
  const MES_DEPOSITO = 2; // febrero
  
  // Redondear entradas a valores sensatos
  const salario = Math.max(0, i.salario_mensual);
  const auxilio = Math.max(0, i.auxilio_transporte);
  const dias = Math.min(365, Math.max(1, i.dias_trabajados));
  const anos = Math.max(0, i.anos_servicio);
  const tasa = Math.max(0, Math.min(100, i.tasa_interes_anual)) / 100;
  
  // Base cesantía = salario + auxilio (DIAN)
  const base_cesantia = salario + auxilio;
  
  // Cesantía anual prorrateada por días trabajados
  const cesantia_anual = base_cesantia * (dias / DIAS_ANO_LABORAL);
  
  // Cesantías acumuladas por años de servicio
  const cesantia_acumulada = cesantia_anual * anos;
  
  // Interés anual sobre cesantías acumuladas (12% conforme DIAN 2026)
  const interes_anual = cesantia_acumulada * tasa;
  
  // Total cesantías + intereses
  const total_cesantia_interes = cesantia_acumulada + interes_anual;
  
  // Cesantía diaria (para verificaciones)
  const cesantia_diaria = cesantia_anual / dias;
  
  // Días restantes hasta 14 de febrero próximo (estimado)
  // Simplificación: si hoy es antes de 14 feb, días a ese 14 feb
  // Si es después, para el próximo 14 feb (365 - días transcurridos)
  const hoy = new Date();
  const proxima_fecha_deposito = new Date(hoy.getFullYear(), 1, 14); // 14 feb año actual
  if (hoy > proxima_fecha_deposito) {
    proxima_fecha_deposito.setFullYear(hoy.getFullYear() + 1);
  }
  const ms_diferencia = proxima_fecha_deposito.getTime() - hoy.getTime();
  const dias_restantes = Math.ceil(ms_diferencia / (1000 * 60 * 60 * 24));
  
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const _insight = {
    title: 'Tus cesantías + intereses',
    text: `Acumulás **${fmt(cesantia_acumulada)}** de cesantías más **${fmt(interes_anual)}** de intereses (al ${(tasa * 100).toFixed(0).replace('.', ',')}% anual), un total de **${fmt(total_cesantia_interes)}**. El empleador consigna las cesantías al fondo antes del **14 de febrero** y te paga los intereses directamente antes del **31 de enero**.`,
    tone: 'neutral',
    icon: '🏦',
  };
  const _chart = interes_anual > 0 && cesantia_acumulada > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Cesantías al fondo', value: Math.round(cesantia_acumulada) },
      { label: 'Intereses (a vos)', value: Math.round(interes_anual) },
    ],
    prefix: '$',
    centerValue: fmt(total_cesantia_interes),
    centerLabel: 'Total',
    ariaLabel: `Total de ${fmt(total_cesantia_interes)}: ${fmt(cesantia_acumulada)} en cesantías al fondo más ${fmt(interes_anual)} de intereses al trabajador.`,
  } : undefined;

  return {
    cesantia_anual: Math.round(cesantia_anual),
    cesantia_acumulada: Math.round(cesantia_acumulada),
    interes_anual_12pct: Math.round(interes_anual),
    total_cesantia_interes: Math.round(total_cesantia_interes),
    cesantia_diaria: Math.round(cesantia_diaria),
    dias_restantes_año: Math.max(0, dias_restantes),
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
