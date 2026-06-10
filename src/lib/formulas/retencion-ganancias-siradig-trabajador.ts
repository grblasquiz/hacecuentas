import { aplicarEscalaMensual, MNI_MENSUAL_BASE } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
// Retención anual ≈ escala mensual del art. 94 LIG (fuente única _ganancias-escala)
// sobre la base imponible mensual, × 12. Base = bruto neto de aportes (~0,83)
// menos el MNI efectivo y las deducciones declaradas prorrateadas al mes.
function retencionAnual(brutoAnual: number, deducAnual: number): number {
  const baseMensual = Math.max(0, (brutoAnual * 0.83 - deducAnual) / 12 - MNI_MENSUAL_BASE);
  return aplicarEscalaMensual(baseMensual).impuesto * 12;
}
export function retencionGananciasSiradigTrabajador(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoAnual)||0; const d=Number(i.deduccionesDeclaradas)||0;
  const retSin=retencionAnual(s,0); const retCon=retencionAnual(s,d);
  const ahorroVal = retSin - retCon;
  const fmt = (n: number) => '$' + Math.round(n).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const insight = {
    title: ahorroVal > 0 ? `Ahorrás ${fmt(ahorroVal)} en retención` : 'Cargá tus deducciones',
    text: ahorroVal > 0
      ? `Declarando **${fmt(d)}** en deducciones (alquiler, obra social, hijos, etc.) bajás la retención anual de **${fmt(retSin)}** a **${fmt(retCon)}**: te ahorrás **${fmt(ahorroVal)}** que vuelven a tu bolsillo. Cargá todo en el SiRADIG antes del cierre.`
      : `Sin deducciones declaradas, te retienen **${fmt(retSin)}** al año. Cargá tus gastos deducibles en el SiRADIG (alquiler, obra social, cuotas médicas, hijos) para reducir la retención.`,
    tone: ahorroVal > 0 ? 'good' : 'warn',
    icon: '💸',
  };
  const out: Outputs = { retencionSinDec:'$'+retSin.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), retencionConDec:'$'+retCon.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), ahorro:'$'+ahorroVal.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.'), resumen:`Deducir $${d.toLocaleString('es-AR')}: ahorrás $${ahorroVal.toFixed(0)} de retención.`, _insight: insight };
  if (retSin > 0 && ahorroVal > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Retención que igual pagás', value: Math.round(retCon) },
        { label: 'Ahorro por deducir', value: Math.round(ahorroVal) },
      ],
      prefix: '$',
      centerValue: fmt(retSin),
      centerLabel: 'Retención sin declarar',
      ariaLabel: `Cómo se reparte la retención sin declarar de ${fmt(retSin)}: lo que igual pagás y lo que ahorrás al declarar deducciones`,
    };
  }
  return out;
}
