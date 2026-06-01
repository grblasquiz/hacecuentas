export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function aceroKgM2Losa(i: Inputs): Outputs {
  const tipo = String(i.tipo);
  const rangos: Record<string, string> = { viguetas: '7-10 kg/m²', maciza: '10-15 kg/m²', aliviana: '8-12 kg/m²' };
  const kg = rangos[tipo] || '?';
  const nombres: Record<string, string> = { viguetas: 'de viguetas y bovedillas', maciza: 'maciza de hormigón armado', aliviana: 'aligerada' };
  const _insight = {
    title: 'Cuánto acero comprar',
    text: kg === '?'
      ? 'Elegí un tipo de losa para estimar la cuantía de acero por metro cuadrado.'
      : `Una losa ${nombres[tipo] || tipo} consume **${kg}** de acero. Multiplicá ese valor por los m² totales y sumá un **5-10 % de desperdicio** por empalmes y recortes antes de pedir las barras.`,
    tone: 'neutral',
    icon: '🏗️',
  };
  return { kgPorM2: kg, resumen: `Losa ${tipo}: ${kg}. Multiplicar por m² totales.`, _insight };
}
