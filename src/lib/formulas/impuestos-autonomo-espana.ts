/** Impuestos autonomo Espana */
export interface Inputs { facturacionAnualBruta: number; gastosDeducibles: number; tarifaPlana: string; }
export interface Outputs { netoAnual: number; cuotaAutonomos: number; irpfPagado: number; beneficioFiscal: number; netoMensual: number; }
export function impuestosAutonomoEspana(i: Inputs): Outputs {
  const fact = Number(i.facturacionAnualBruta);
  const gastos = Number(i.gastosDeducibles);
  const tp = String(i.tarifaPlana || 'no');
  if (fact < 0) throw new Error('Facturación inválida');
  const cuotaMensual = tp === 'si' ? 80 : (fact < 12000 ? 200 : fact < 30000 ? 250 : fact < 60000 ? 340 : 450);
  const cuotaAnual = cuotaMensual * 12;
  const base = fact - gastos - cuotaAnual;
  let irpf = 0;
  if (base > 0) {
    const brackets = [[12450, 0.19], [20200, 0.24], [35200, 0.30], [60000, 0.37], [Infinity, 0.45]];
    let prev = 0;
    for (const [limit, rate] of brackets) {
      if (base > prev) {
        const taxable = Math.min(base, limit as number) - prev;
        irpf += taxable * (rate as number);
        prev = limit as number;
        if (base <= limit) break;
      }
    }
  }
  const neto = fact - gastos - cuotaAnual - irpf;
  return {
    netoAnual: Math.round(neto),
    cuotaAutonomos: Math.round(cuotaAnual),
    irpfPagado: Math.round(irpf),
    beneficioFiscal: Math.round(base > 0 ? base : 0),
    netoMensual: Math.round(neto / 12)
  };
}
