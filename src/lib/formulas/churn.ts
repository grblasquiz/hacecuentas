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
  if (churnMes < 2) msg = 'Churn bajo — excelente retención (SaaS top).';
  else if (churnMes < 5) msg = 'Churn moderado — saludable para B2B.';
  else if (churnMes < 10) msg = 'Churn alto — revisar onboarding y customer success.';
  else msg = 'Churn crítico — está saliendo plata por la canilla, priorizá retención.';

  return {
    churnMensual: Number(churnMes.toFixed(2)),
    retencion: Number(retencion.toFixed(2)),
    churnAnualizado: Number(churnAnual.toFixed(2)),
    ltvMedioMeses: isFinite(ltv) ? Number(ltv.toFixed(1)) : 999,
    mensaje: msg,
  };
}
