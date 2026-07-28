export interface Inputs { tipoMonto: string; monto: number; tasaRetencion: number }
export interface Outputs { honorarioBruto: number; retencion: number; liquidoRecibir: number; detalle: string; _insight?: any }
export function compute(i: Inputs): Outputs {
  const monto = Math.max(0, Number(i.monto) || 0), tasa = Math.max(0, Math.min(100, (Number.isFinite(Number(i.tasaRetencion)) ? Number(i.tasaRetencion) : 15.25))) / 100;
  const honorarioBruto = i.tipoMonto === 'liquido' ? monto / (1 - tasa) : monto;
  const retencion = honorarioBruto * tasa, liquidoRecibir = honorarioBruto - retencion;
  const f = (n: number) => `$${Math.round(n).toLocaleString('es-CL')}`;
  return { honorarioBruto: Math.round(honorarioBruto), retencion: Math.round(retencion), liquidoRecibir: Math.round(liquidoRecibir), detalle: `Bruto ${f(honorarioBruto)} − retención ${f(retencion)} (${(tasa * 100).toLocaleString('es-CL')}%) = líquido ${f(liquidoRecibir)}.`, _insight: { title: `Recibís ${f(liquidoRecibir)}`, text: `La retención estimada es **${f(retencion)}**. El SII aplica automáticamente la tasa vigente al emitir la boleta.`, tone: 'neutral', icon: '🧾' } };
}
