/** TikTok Creator Fund */
export interface Inputs { vistasMensuales: number; rpm: number; }
export interface Outputs { ingresoMensual: string; ingresoAnual: string; vistasPorDolar: string; nivel: string; }

export function tiktokCreatorFundIngreso(i: Inputs): Outputs {
  const v = Number(i.vistasMensuales);
  const rpm = Number(i.rpm);
  if (v <= 0 || rpm <= 0) throw new Error('Ingresá valores válidos');
  const mensual = (v / 1000) * rpm;
  const anual = mensual * 12;
  const vpd = mensual > 0 ? v / mensual : 0;
  let nivel = '';
  if (rpm < 0.2) nivel = 'RPM bajo (típico India / LATAM pequeño)';
  else if (rpm < 0.5) nivel = 'RPM medio-bajo (LATAM / sur de Europa)';
  else if (rpm < 0.8) nivel = 'RPM medio (Europa / EEUU parcial)';
  else nivel = 'RPM alto (tier 1: EEUU, UK, DE, FR)';
  return {
    ingresoMensual: `$${mensual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/mes`,
    ingresoAnual: `$${anual.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD/año`,
    vistasPorDolar: `${Math.round(vpd).toLocaleString('en-US')} vistas por dólar`,
    nivel,
  };
}
