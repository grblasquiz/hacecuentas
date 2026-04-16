/** Costo del primer año de un bebé en Argentina */
export interface Inputs { alimentacion: string; panales: string; nivelGasto: string; }
export interface Outputs { totalAnual: number; promedioMensual: number; alimentacionAnual: number; panalesAnual: number; mensaje: string; }

export function costoHijoPrimerAno(i: Inputs): Outputs {
  const alimentacion = String(i.alimentacion || 'mixta');
  const panales = String(i.panales || 'descartables');
  const nivel = String(i.nivelGasto || 'medio');

  // Monthly costs in ARS (2026 estimates)
  const factorNivel: Record<string, number> = { basico: 0.7, medio: 1.0, alto: 1.5 };
  const f = factorNivel[nivel] || 1.0;

  // Alimentación mensual
  let alimentacionMes: number;
  if (alimentacion === 'materna') alimentacionMes = 15000 * f; // sacaleches, accesorios
  else if (alimentacion === 'mixta') alimentacionMes = 60000 * f;
  else alimentacionMes = 90000 * f; // fórmula exclusiva

  // Pañales mensual
  let panalesMes: number;
  if (panales === 'descartables') panalesMes = 45000 * f;
  else if (panales === 'ecologicos') panalesMes = 15000 * f; // amortizado
  else panalesMes = 30000 * f;

  // Otros gastos mensuales
  const ropaMes = 25000 * f;
  const saludMes = 35000 * f; // prepaga/controles
  const higieneMes = 15000 * f; // cremas, jabón, etc
  const otrosMes = 20000 * f; // juguetes, paseos, imprevistos

  // Gastos únicos del primer año
  const muebles = 200000 * f; // cuna, cochecito, silla auto
  const equipamiento = 100000 * f; // bañera, cambiador, etc

  const gastoMensual = alimentacionMes + panalesMes + ropaMes + saludMes + higieneMes + otrosMes;
  const totalAnual = Math.round(gastoMensual * 12 + muebles + equipamiento);
  const promedioMensual = Math.round(totalAnual / 12);

  return {
    totalAnual,
    promedioMensual,
    alimentacionAnual: Math.round(alimentacionMes * 12),
    panalesAnual: Math.round(panalesMes * 12),
    mensaje: `Primer año: $${totalAnual.toLocaleString()}. Mensual promedio: $${promedioMensual.toLocaleString()}. Alimentación: $${Math.round(alimentacionMes).toLocaleString()}/mes. Pañales: $${Math.round(panalesMes).toLocaleString()}/mes.`
  };
}