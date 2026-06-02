export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | any; _insight?: any; }
export function velocidadAutoRpmMarchaRelacion(i: Inputs): Outputs {
  const r=Number(i.rpm)||0; const rel=Number(i.rel)||1; const dif=Number(i.diff)||1; const c=Number(i.circ)||2;
  const rueda_rpm=r/(rel*dif);
  const v_m_min=rueda_rpm*c;
  const v_kmh=v_m_min*60/1000;
  const insight = {
    title: 'Velocidad a esas RPM',
    text: `Con el motor a **${r} RPM** en esa marcha, el auto va a **${v_kmh.toFixed(0)} km/h**. La rueda gira a ~${rueda_rpm.toFixed(0)} RPM tras pasar por la caja (${rel}) y el diferencial (${dif}).`,
    tone: 'neutral',
    icon: '🚗'
  };
  return { velocidad:`${v_kmh.toFixed(0)} km/h`, resumen:`${r}rpm en esa marcha = ${v_kmh.toFixed(0)} km/h.`, _insight: insight };
}
