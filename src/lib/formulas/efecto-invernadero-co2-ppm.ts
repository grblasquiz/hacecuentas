export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function efectoInvernaderoCo2Ppm(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const c = Number(i.c); const c0 = Number(i.c0) || 280;
  if (!c || c <= 0) throw new Error(__lang === 'en' ? 'Enter a concentration' : 'Ingresá concentración');
  const dF = 5.35 * Math.log(c / c0);
  const resumen = __lang === 'en'
    ? `Radiative forcing ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).`
    : `Forzamiento radiativo ΔF = ${dF.toFixed(2)} W/m² (CO₂ ${c} ppm vs ${c0} pre-industrial).`;
  return { forzamiento: dF.toFixed(2) + ' W/m²', resumen };
}
