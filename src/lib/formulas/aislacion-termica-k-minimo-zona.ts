export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function aislacionTermicaKMinimoZona(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const zonas: Record<string, string> = { 'I-II': '1.2', 'III': '1.0', 'IV-V': '0.85', 'VI': '0.74' };
  const z = String(i.zona);
  const resumen = __lang === 'en'
    ? `Zone ${z}: max K ${zonas[z] || '1.0'} W/m²K (IRAM 11605).`
    : `Zona ${z}: K máx ${zonas[z]} W/m²K (IRAM 11605).`;
  return { kMaximo: zonas[z] || '1.0', resumen };
}
