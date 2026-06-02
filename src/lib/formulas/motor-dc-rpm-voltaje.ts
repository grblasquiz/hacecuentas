export interface MotorDcRpmVoltajeInputs { voltaje: number; kv: number; carga?: number; }
export interface MotorDcRpmVoltajeOutputs { rpm: string; rps: string; resumen: string; _insight?: any; }
export function motorDcRpmVoltaje(i: MotorDcRpmVoltajeInputs): MotorDcRpmVoltajeOutputs {
  const v = Number(i.voltaje); const kv = Number(i.kv); const c = Number(i.carga ?? 0) / 100;
  if (!v || !kv) throw new Error('Ingresá V y Kv');
  const rpmSinCarga = v * kv;
  const rpm = rpmSinCarga * (1 - c * 0.4); // carga reduce ~40% a 100%
  const fmt = (n: number) => new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 }).format(Math.round(n));

  const insightText = c > 0
    ? `Con Kv=${kv} a ${v}V el motor gira a **${fmt(rpmSinCarga)} RPM** en vacío, pero bajo **${(c*100).toFixed(0)}% de carga** cae a ~**${fmt(rpm)} RPM** (${fmt(rpmSinCarga - rpm)} RPM menos). Más voltaje sube las vueltas en proporción directa.`
    : `Con Kv=${kv} a ${v}V el motor gira a **${fmt(rpmSinCarga)} RPM** en vacío (${(rpm/60).toFixed(1)} rev/s). Bajo carga las vueltas reales caen; subí la carga para estimar ese efecto.`;

  return {
    rpm: rpm.toFixed(0) + ' RPM',
    rps: (rpm / 60).toFixed(1) + ' rev/s',
    resumen: `A ${v}V con Kv=${kv}: ${rpmSinCarga.toFixed(0)} RPM sin carga${c > 0 ? ', ~' + rpm.toFixed(0) + ' RPM con ' + (c*100).toFixed(0) + '% carga' : ''}.`,
    _insight: {
      title: 'Vueltas estimadas',
      text: insightText,
      tone: 'neutral',
      icon: '⚙️',
    },
  };
}
