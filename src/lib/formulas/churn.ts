/** Churn rate y retención */
export interface Inputs {
  clientesInicio: number;
  clientesPerdidos: number;
  nuevos?: number;
}
export interface Outputs {
  churnMensual: number;
  retencion: number;
  churnAnualizado: number;
  ltvMedioMeses: number;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function churn(i: Inputs): Outputs {
  const inicio = Number(i.clientesInicio);
  const perdidos = Number(i.clientesPerdidos);
  if (!inicio || inicio <= 0) throw new Error('Ingresá clientes al inicio');
  if (perdidos < 0) throw new Error('Clientes perdidos inválido');

  const churnMes = (perdidos / inicio) * 100;
  const retencion = 100 - churnMes;
  // Anualizado aproximado: 1 - (1 - churn/100)^12
  const churnAnual = (1 - Math.pow(1 - churnMes / 100, 12)) * 100;
  const ltv = churnMes > 0 ? 100 / churnMes : Infinity;

  let msg = '';
  let tone: 'good' | 'warn' | 'neutral';
  if (churnMes < 2) { msg = 'Churn bajo — excelente retención (SaaS top).'; tone = 'good'; }
  else if (churnMes < 5) { msg = 'Churn moderado — saludable para B2B.'; tone = 'neutral'; }
  else if (churnMes < 10) { msg = 'Churn alto — revisar onboarding y customer success.'; tone = 'warn'; }
  else { msg = 'Churn crítico — está saliendo plata por la canilla, priorizá retención.'; tone = 'warn'; }

  const ltvTxt = isFinite(ltv) ? `unos **${ltv.toFixed(1)} meses** de vida media por cliente` : 'una vida media de cliente prácticamente infinita (churn 0)';
  const _insight = {
    title: 'Tu churn mensual',
    text: `Perdés **${churnMes.toFixed(2)}%** de clientes por mes (retenés ${retencion.toFixed(1)}%), que anualizado son **${churnAnual.toFixed(1)}%**. Eso implica ${ltvTxt}.`,
    tone,
    icon: '📉',
  };

  return {
    churnMensual: Number(churnMes.toFixed(2)),
    retencion: Number(retencion.toFixed(2)),
    churnAnualizado: Number(churnAnual.toFixed(2)),
    ltvMedioMeses: isFinite(ltv) ? Number(ltv.toFixed(1)) : 999,
    mensaje: msg,
    _insight,
    _chart: {
      type: 'scale',
      marker: Number(churnMes.toFixed(2)),
      markerLabel: `${churnMes.toFixed(1)}%`,
      min: 0,
      segments: [
        { nombre: 'Excelente', max: 2, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Saludable', max: 5, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Alto', max: 10, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Crítico', max: Math.max(20, Math.ceil(churnMes) + 1), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Churn mensual de ${churnMes.toFixed(2)}% en una escala de zonas, desde excelente (menos de 2%) hasta crítico (más de 10%)`,
    },
  };
}
