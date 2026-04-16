/** Equivalencia LED vs incandescente */
export interface Inputs { wattsOriginal: number; tipoOriginal?: string; cantidadFocos: number; horasUso: number; costoKwh?: number; }
export interface Outputs { wattsLedEquivalente: number; lumenesAprox: number; ahorroAnualKwh: number; ahorroAnualPesos: number; }

const FACTOR_A_LUMENS: Record<string, number> = {
  incandescente: 12, halogena: 16, cfl: 55, led: 90,
};

export function focoLedEquivalenciaWatts(i: Inputs): Outputs {
  const w = Number(i.wattsOriginal);
  const tipo = String(i.tipoOriginal || 'incandescente');
  const cant = Number(i.cantidadFocos) || 1;
  const horas = Number(i.horasUso) || 5;
  const costo = Number(i.costoKwh) || 150;
  if (!w || w <= 0) throw new Error('Ingresá los watts del foco');

  const lumPorWatt = FACTOR_A_LUMENS[tipo] || 12;
  const lumenes = w * lumPorWatt;
  const wattsLed = Math.round(lumenes / 90); // LED ~90 lm/W
  const ahorroW = (w - wattsLed) * cant;
  const ahorroKwhAnual = (ahorroW * horas * 365) / 1000;
  const ahorroPesos = ahorroKwhAnual * costo;

  return {
    wattsLedEquivalente: Math.max(3, wattsLed),
    lumenesAprox: Math.round(lumenes),
    ahorroAnualKwh: Number(ahorroKwhAnual.toFixed(0)),
    ahorroAnualPesos: Math.round(ahorroPesos),
  };
}
