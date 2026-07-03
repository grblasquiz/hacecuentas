/** Yerba y agua para una ronda de mate según personas, duración e intensidad. */
export interface Inputs {
  personas?: number | string;
  duracion_horas?: number | string;
  intensidad?: string;
  __country?: string;
}

export interface Outputs {
  yerba_g: number;
  agua_litros: number;
  termos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function mateYerbaParaRonda(i: Inputs): Outputs {
  const p = Math.max(0, Math.floor(Number(i.personas) || 0));
  const horas = Math.max(0, Number(i.duracion_horas) || 0);
  const intensidad = String(i.intensidad || 'normal');

  const gPPHoraMap: Record<string, number> = { suave: 15, normal: 22, fuerte: 30 };
  const factor = gPPHoraMap[intensidad] ?? 22;

  const activo = p > 0 && horas > 0;

  const yerba_g = activo ? Math.round(p * horas * factor) : 0;
  const agua_litros = activo ? Math.ceil(p * horas * 0.4 * 2) / 2 : 0;
  const termos = activo ? Math.max(1, Math.ceil(agua_litros / 1)) : 0;

  const resumen = activo
    ? `Para ${p} personas y ${horas} h de ronda: ${yerba_g} g de yerba y ${agua_litros} L de agua caliente, es decir ${termos} ${termos === 1 ? 'termo' : 'termos'} de 1 L.`
    : 'Cargá personas y duración para calcular la yerba.';

  const out: Outputs = { yerba_g, agua_litros, termos, resumen };

  if (activo) {
    out._insight = {
      title: 'Cuánta yerba llevar',
      text: `Para **${p}** personas durante **${horas} h** calculá **${yerba_g} g** de yerba y **${agua_litros} L** de agua (${termos} ${termos === 1 ? 'termo' : 'termos'} de 1 L). Regla práctica: unos 22 g de yerba por persona por hora en una ronda de intensidad normal.`,
      tone: 'neutral',
      icon: '🧉',
    };
  }

  return out;
}
