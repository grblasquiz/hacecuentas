/**
 * Calculadora de machihembrado por m² de piso o techo
 */

export interface Inputs {
  m2: number; tablonAncho: number; tablonLargo: number; anchoUtil: number; desperdicio: number;
}

export interface Outputs {
  cantidadTablones: string; metrosLineales: string; m2Real: string; consejo: string;
}

export function machihembradoTablon(inputs: Inputs): Outputs {
  const m2 = Number(inputs.m2);
  const ta = Number(inputs.tablonAncho);
  const tl = Number(inputs.tablonLargo);
  const au = Number(inputs.anchoUtil);
  const d = Number(inputs.desperdicio);
  if (!m2 || !ta || !tl || !au || d === null) throw new Error('Completá los campos');
  const m2Tablon = (au / 100) * (tl / 100); // cm a m
  const netos = Math.ceil(m2 / m2Tablon);
  const final = Math.ceil(netos * (1 + d / 100));
  const metrosLin = final * (tl / 100);
  const m2Real = final * m2Tablon;
  return {
    cantidadTablones: `${final} tablones`,
    metrosLineales: `${metrosLin.toFixed(1)} m lineales`,
    m2Real: `${m2Real.toFixed(2)} m² comprados`,
    consejo: `Dejá 1 cm de dilatación en perímetro. ${d}% de desperdicio aplicado.`,
  };
}
