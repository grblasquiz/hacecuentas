/** Entender tu receta óptica (dioptrías) */
export interface Inputs {
  esfericoDerecho: number;
  cilindricoDerecho: number;
  ejeDerecho: number;
  esfericoIzquierdo: number;
  cilindricoIzquierdo: number;
  ejeIzquierdo: number;
  adicion: number;
}
export interface Outputs {
  tipoDerecho: string;
  tipoIzquierdo: string;
  gravedadDerecho: string;
  gravedadIzquierdo: string;
  tieneAstigmatismo: boolean;
  necesitaProgresivos: boolean;
  equivalenteEsfericoDer: number;
  equivalenteEsfericoIzq: number;
  mensaje: string;
}

export function vistaDioptrias(i: Inputs): Outputs {
  const esfDer = Number(i.esfericoDerecho) || 0;
  const cilDer = Number(i.cilindricoDerecho) || 0;
  const esfIzq = Number(i.esfericoIzquierdo) || 0;
  const cilIzq = Number(i.cilindricoIzquierdo) || 0;
  const adicion = Number(i.adicion) || 0;

  const clasificar = (esf: number) => {
    if (esf === 0) return 'Emetropía (visión normal)';
    if (esf < 0) return 'Miopía (no ves de lejos)';
    return 'Hipermetropía (no ves de cerca)';
  };

  const gravedad = (esf: number) => {
    const abs = Math.abs(esf);
    if (abs === 0) return 'Sin corrección';
    if (abs <= 3) return 'Leve';
    if (abs <= 6) return 'Moderada';
    if (abs <= 9) return 'Alta';
    return 'Muy alta';
  };

  // Equivalente esférico = esférico + (cilíndrico / 2)
  const eqDer = esfDer + cilDer / 2;
  const eqIzq = esfIzq + cilIzq / 2;

  const tieneAstigmatismo = cilDer !== 0 || cilIzq !== 0;
  const necesitaProgresivos = adicion > 0;

  return {
    tipoDerecho: clasificar(esfDer),
    tipoIzquierdo: clasificar(esfIzq),
    gravedadDerecho: gravedad(esfDer),
    gravedadIzquierdo: gravedad(esfIzq),
    tieneAstigmatismo,
    necesitaProgresivos,
    equivalenteEsfericoDer: Number(eqDer.toFixed(2)),
    equivalenteEsfericoIzq: Number(eqIzq.toFixed(2)),
    mensaje: `OD: ${clasificar(esfDer)} (${gravedad(esfDer)}) | OI: ${clasificar(esfIzq)} (${gravedad(esfIzq)})${tieneAstigmatismo ? ' + Astigmatismo' : ''}${necesitaProgresivos ? ' + Necesitás progresivos' : ''}.`,
  };
}
