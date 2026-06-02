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
  _insight?: any;
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
  const hpR = Number(hp.toFixed(1));
  const kwR = Number(kw.toFixed(1));
  const cvR = Number(cv.toFixed(1));

  return {
    hp: hpR,
    kw: kwR,
    cv: cvR,
    detalle: `${valor} ${unidades[unidad]} = ${hp.toFixed(1)} HP = ${kw.toFixed(1)} kW = ${cv.toFixed(1)} CV.`,
    _insight: {
      title: 'Equivalencia de potencia',
      text: `**${valor} ${unidades[unidad]}** equivalen a **${hpR} HP**, **${kwR} kW** y **${cvR} CV**. El kW es la unidad del Sistema Internacional; HP (caballo de fuerza) y CV (caballo de vapor) son casi iguales pero no idénticos: 1 HP ≈ 1,014 CV.`,
      tone: 'neutral',
      icon: '⚙️',
    },
  };
}
