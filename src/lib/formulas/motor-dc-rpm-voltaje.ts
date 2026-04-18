export interface MotorDcRpmVoltajeInputs { voltaje: number; kv: number; carga?: number; }
export interface MotorDcRpmVoltajeOutputs { rpm: string; rps: string; resumen: string; }
export function motorDcRpmVoltaje(i: MotorDcRpmVoltajeInputs): MotorDcRpmVoltajeOutputs {
  const v = Number(i.voltaje); const kv = Number(i.kv); const c = Number(i.carga ?? 0) / 100;
  if (!v || !kv) throw new Error('Ingresá V y Kv');
  const rpmSinCarga = v * kv;
  const rpm = rpmSinCarga * (1 - c * 0.4); // carga reduce ~40% a 100%
  return {
    rpm: rpm.toFixed(0) + ' RPM',
    rps: (rpm / 60).toFixed(1) + ' rev/s',
    resumen: `A ${v}V con Kv=${kv}: ${rpmSinCarga.toFixed(0)} RPM sin carga${c > 0 ? ', ~' + rpm.toFixed(0) + ' RPM con ' + (c*100).toFixed(0) + '% carga' : ''}.`
  };
}
