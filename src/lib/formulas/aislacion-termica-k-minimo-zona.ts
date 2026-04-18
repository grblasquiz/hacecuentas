export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function aislacionTermicaKMinimoZona(i: Inputs): Outputs {
  const zonas: Record<string, string> = { 'I-II': '1.2', 'III': '1.0', 'IV-V': '0.85', 'VI': '0.74' };
  const z = String(i.zona);
  return { kMaximo: zonas[z] || '1.0', resumen: `Zona ${z}: K máx ${zonas[z]} W/m²K (IRAM 11605).` };
}
