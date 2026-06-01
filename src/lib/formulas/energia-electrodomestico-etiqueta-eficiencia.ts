export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; }
export function energiaElectrodomesticoEtiquetaEficiencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a = Number(i.kwhClaseActual) || 0; const n = Number(i.kwhClaseNueva) || 0;
  const t = Number(i.tarifa) || 80;
  const kWh = a - n; const pesos = kWh * t;
  const resumen = __lang === 'en'
    ? `You save ${kWh.toFixed(0)} kWh/year = $${pesos.toFixed(0)} AR.`
    : __lang === 'pt'
    ? `Você economiza ${kWh.toFixed(0)} kWh/ano = $${pesos.toFixed(0)} AR.`
    : `Ahorrás ${kWh.toFixed(0)} kWh/año = $${pesos.toFixed(0)} AR.`;
  return { ahorroKwhAño: kWh.toFixed(0), ahorroPesosAño: '$' + pesos.toFixed(0), resumen };
}
