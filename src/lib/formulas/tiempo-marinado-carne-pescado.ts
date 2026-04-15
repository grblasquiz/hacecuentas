/** Calculadora de tiempo de marinado ideal */
export interface Inputs {
  tipoProteina: string;
  grosor?: string;
  tipoMarinada?: string;
}
export interface Outputs {
  tiempoMinimo: string;
  tiempoOptimo: string;
  tiempoMaximo: string;
  detalle: string;
}

interface TiempoBase {
  min: number; // en minutos
  opt: number;
  max: number;
}

export function tiempoMarinadoCarnePescado(i: Inputs): Outputs {
  const proteina = i.tipoProteina;
  const grosor = i.grosor || 'medio';
  const marinada = i.tipoMarinada || 'aceite';

  if (!proteina) throw new Error('Seleccioná el tipo de proteína');

  // Tiempos base en minutos para grosor medio, marinada aceite
  const tiemposBase: Record<string, TiempoBase> = {
    vacuna: { min: 120, opt: 480, max: 1440 },
    cerdo: { min: 120, opt: 360, max: 720 },
    pollo: { min: 60, opt: 240, max: 720 },
    pescado: { min: 30, opt: 60, max: 240 },
    mariscos: { min: 15, opt: 25, max: 60 },
  };

  const base = tiemposBase[proteina];
  if (!base) throw new Error('Tipo de proteína no válido');

  // Factor grosor
  const factorGrosor: Record<string, number> = {
    fino: 0.7,
    medio: 1.0,
    grueso: 1.4,
  };
  const fg = factorGrosor[grosor] || 1.0;

  // Factor marinada
  const factorMarinada: Record<string, number> = {
    acida: 0.6,
    aceite: 1.0,
    yogur: 1.1,
    seca: 1.3,
  };
  const fm = factorMarinada[marinada] || 1.0;

  const min = Math.round(base.min * fg * fm);
  const opt = Math.round(base.opt * fg * fm);
  const max = Math.round(base.max * fg * fm);

  const formatTiempo = (minutos: number): string => {
    if (minutos < 60) return `${minutos} minutos`;
    const hs = Math.floor(minutos / 60);
    const m = minutos % 60;
    return m > 0 ? `${hs} h ${m} min` : `${hs} horas`;
  };

  const nombres: Record<string, string> = {
    vacuna: 'carne vacuna',
    cerdo: 'cerdo',
    pollo: 'pollo/ave',
    pescado: 'pescado',
    mariscos: 'mariscos',
  };

  return {
    tiempoMinimo: formatTiempo(min),
    tiempoOptimo: formatTiempo(opt),
    tiempoMaximo: formatTiempo(max),
    detalle: `${nombres[proteina] || proteina} (${grosor}, marinada ${marinada}): mínimo ${formatTiempo(min)}, óptimo ${formatTiempo(opt)}, máximo ${formatTiempo(max)}. Siempre marinar en heladera.`,
  };
}
