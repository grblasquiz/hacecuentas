/**
 * Calculadora de tiempo de carga de batería
 */

export interface Inputs {
  capacidadAh: number; cargaActual: number; cargadorA: number; tipo: number;
}

export interface Outputs {
  tiempoHoras: string; seguridadC: string; ahNecesarios: string; consejo: string;
  _insight?: any; _chart?: any;
}

export function cargaBateriaTiempoAmp(inputs: Inputs): Outputs {
  const cap = Number(inputs.capacidadAh);
  const act = Number(inputs.cargaActual);
  const ca = Number(inputs.cargadorA);
  const tp = Math.round(Number(inputs.tipo));
  if (!cap || !ca || !tp) throw new Error('Completá los campos');
  const factor: Record<number, number> = { 1: 1.18, 2: 1.05, 3: 1.05, 4: 1.05, 5: 1.40 };
  const f = factor[tp] || 1.15;
  const ahNec = cap * (100 - act) / 100;
  const tiempo = (ahNec / ca) * f;
  const tasaC = ca / cap;
  const maxC: Record<number, number> = { 1: 0.25, 2: 1.0, 3: 0.5, 4: 1.5, 5: 0.5 };
  const mc = maxC[tp] || 0.5;
  const seguro = tasaC <= mc ? '✅ Segura' : tasaC <= mc * 1.5 ? '⚠️ Alta, revisar' : '❌ Excesiva, reducir';
  let tStr = '';
  if (tiempo < 1) tStr = `${(tiempo * 60).toFixed(0)} min`;
  else if (tiempo < 24) tStr = `${tiempo.toFixed(1)} hs`;
  else tStr = `${(tiempo / 24).toFixed(1)} días`;
  const tips: Record<number, string> = {
    1: 'Plomo: carga lenta en 3 etapas. Dejar al 100% es ideal.',
    2: 'LiPo: usar cargador balance obligatorio. Storage a 3.8V/celda.',
    3: 'Li-Ion: para longevidad, cargar solo hasta 80% y descargar a 20%.',
    4: 'LiFePO4: robusta, acepta tasas de carga altas (1-2C).',
    5: 'NiMH: eficiencia baja, lenta, permite trickle charge indefinido.',
  };
  const nombres: Record<number, string> = { 1: 'plomo-ácido', 2: 'LiPo', 3: 'Li-Ion', 4: 'LiFePO4', 5: 'NiMH' };
  const tipoNom = nombres[tp] || 'batería';
  const _insight = {
    title: 'Tiempo y seguridad de carga',
    text: tasaC <= mc
      ? `Reponer **${ahNec.toFixed(1)} Ah** con tu cargador de **${ca} A** tarda **${tStr}**. La tasa de **${tasaC.toFixed(2)}C** está dentro del máximo seguro (**${mc}C**) para ${tipoNom}: carga tranquila.`
      : tasaC <= mc * 1.5
        ? `Reponer **${ahNec.toFixed(1)} Ah** tarda **${tStr}**, pero la tasa de **${tasaC.toFixed(2)}C** supera el máximo de **${mc}C** para ${tipoNom}. Vigilá la temperatura; conviene bajar la corriente.`
        : `La tasa de **${tasaC.toFixed(2)}C** excede de sobra el límite seguro (**${mc}C**) de ${tipoNom}. Cargar a **${ca} A** así arriesga sobrecalentamiento; reducí el cargador aunque tarde más que ${tStr}.`,
    tone: tasaC <= mc ? 'good' : tasaC <= mc * 1.5 ? 'warn' : 'warn',
    icon: tasaC <= mc ? '🔋' : '⚠️',
  };

  // Gauge: tasa C real contra las zonas segura / alta / excesiva del tipo de batería.
  const topMax = Math.max(mc * 2, tasaC * 1.1);
  const _chart = {
    type: 'scale',
    marker: Number(tasaC.toFixed(2)),
    markerLabel: `${tasaC.toFixed(2)}C`,
    min: 0,
    segments: [
      { nombre: 'Segura', max: Number(mc.toFixed(2)), color: '#34d399', colorDark: '#059669' },
      { nombre: 'Alta', max: Number((mc * 1.5).toFixed(2)), color: '#f59e0b', colorDark: '#b45309' },
      { nombre: 'Excesiva', max: Number(topMax.toFixed(2)), color: '#ef4444', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Tasa de carga ${tasaC.toFixed(2)}C frente al máximo recomendado de ${mc}C para ${tipoNom}.`,
  };

  return {
    tiempoHoras: tStr,
    seguridadC: `${tasaC.toFixed(2)}C — ${seguro} (máx ${mc}C)`,
    ahNecesarios: `${ahNec.toFixed(1)} Ah a reponer`,
    consejo: tips[tp] || tips[1],
    _insight,
    _chart,
  };
}
