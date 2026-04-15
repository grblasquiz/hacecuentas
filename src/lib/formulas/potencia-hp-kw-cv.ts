/** Convierte potencia entre HP, kW y CV */
export interface Inputs {
  valorPotencia: number;
  unidadOrigen: number;
}
export interface Outputs {
  hp: number;
  kw: number;
  cv: number;
  detalle: string;
}

export function potenciaHpKwCv(i: Inputs): Outputs {
  const valor = Number(i.valorPotencia);
  const unidad = Number(i.unidadOrigen);

  if (!valor || valor <= 0) throw new Error('Ingresá un valor de potencia mayor a 0');
  if (unidad < 1 || unidad > 3) throw new Error('La unidad debe ser 1 (HP), 2 (kW) o 3 (CV)');

  let hp: number, kw: number, cv: number;

  if (unidad === 1) {
    // Origen: HP
    hp = valor;
    kw = valor * 0.7457;
    cv = valor * 1.0139;
  } else if (unidad === 2) {
    // Origen: kW
    kw = valor;
    hp = valor * 1.3410;
    cv = valor * 1.3596;
  } else {
    // Origen: CV
    cv = valor;
    hp = valor * 0.9863;
    kw = valor * 0.7355;
  }

  const unidades = ['', 'HP', 'kW', 'CV'];

  return {
    hp: Number(hp.toFixed(1)),
    kw: Number(kw.toFixed(1)),
    cv: Number(cv.toFixed(1)),
    detalle: `${valor} ${unidades[unidad]} = ${hp.toFixed(1)} HP = ${kw.toFixed(1)} kW = ${cv.toFixed(1)} CV.`,
  };
}
