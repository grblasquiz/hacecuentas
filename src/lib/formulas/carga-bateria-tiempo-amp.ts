/**
 * Calculadora de tiempo de carga de batería
 */

export interface Inputs {
  capacidadAh: number; cargaActual: number; cargadorA: number; tipo: number;
}

export interface Outputs {
  tiempoHoras: string; seguridadC: string; ahNecesarios: string; consejo: string;
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
  return {
    tiempoHoras: tStr,
    seguridadC: `${tasaC.toFixed(2)}C — ${seguro} (máx ${mc}C)`,
    ahNecesarios: `${ahNec.toFixed(1)} Ah a reponer`,
    consejo: tips[tp] || tips[1],
  };
}
