export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function huellaCarbonoTrabajoRemotoVsOficina(i: Inputs): Outputs {
  const km = Number(i.kmCommute) || 0; const d = Number(i.diasMes) || 12;
  const factor = i.autoPublico === 'auto' ? 0.2 : 0.07;
  const commuteDia = km * factor; const extraCasa = 3;
  const ahorroMes = (commuteDia - extraCasa) * d;
  return { kgAhorradoMes: ahorroMes.toFixed(1) + ' kg', kgAhorradoAño: (ahorroMes * 12).toFixed(0) + ' kg', resumen: `Ahorro ${ahorroMes.toFixed(1)} kg/mes (${(ahorroMes*12/1000).toFixed(1)} t/año).` };
}
