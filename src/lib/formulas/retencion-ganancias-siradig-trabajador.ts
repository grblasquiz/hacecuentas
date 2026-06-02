export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }
export function retencionGananciasSiradigTrabajador(i: Inputs): Outputs {
  const s=Number(i.sueldoBrutoAnual)||0; const d=Number(i.deduccionesDeclaradas)||0;
  const baseSin=s*0.85; const baseCon=Math.max(0,s*0.85-d);
  const retSin=baseSin*0.25; const retCon=baseCon*0.25;
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
