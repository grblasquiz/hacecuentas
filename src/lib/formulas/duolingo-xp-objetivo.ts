/** XP Duolingo para tu Objetivo */
export interface Inputs {
  [k: string]: any;
}
export interface Outputs {
  xpTotalObjetivo: number;
  xpPorDia: number;
  minutosDia: number;
  leccionesDia: number;
  comentario: string;
}

export function duolingoXpObjetivo(i: Inputs): Outputs {
  const obj = String(i.objetivo || 'a2');
  const idioma = String(i.idioma || 'ingles');
  const dias = Number(i.diasPlazo) || 90;
  if (dias <= 0) throw new Error('Plazo inválido');

  const XP_BASE: Record<string, number> = {
    'completar-unidad': 1500, a1: 5000, a2: 15000, b1: 28000,
  };
  const AJUSTE: Record<string, number> = {
    ingles: 1.0, frances: 1.0, italiano: 0.95, portugues: 0.95,
    aleman: 1.1, japones: 1.3, chino: 1.3,
  };

  const xpTot = Math.round((XP_BASE[obj] || 15000) * (AJUSTE[idioma] || 1));
  const xpDia = Math.ceil(xpTot / dias);
  const minDia = Math.round(xpDia / 10);
  const lecc = Math.round(xpDia / 15);

  let coment = '';
  if (xpDia > 500) coment = 'Muy intenso — insostenible más de 2-3 meses.';
  else if (xpDia > 200) coment = 'Acelerado. Sumá variedad (historias, match madness).';
  else if (xpDia > 80) coment = 'Ritmo normal de usuario activo.';
  else coment = 'Ritmo cómodo. Si alcanza para tu meta, perfecto.';

  return {
    xpTotalObjetivo: xpTot,
    xpPorDia: xpDia,
    minutosDia: minDia,
    leccionesDia: lecc,
    comentario: coment,
  };

}
