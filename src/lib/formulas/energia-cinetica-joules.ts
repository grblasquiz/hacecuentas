/** Calculadora de Energía Cinética — Ek = ½mv² */
export interface Inputs {
  masa: number;
  velocidad: number;
}
export interface Outputs {
  energiaJ: number;
  energiaKJ: number;
  energiaCal: number;
  formula: string;
  _insight?: any;
}

export function energiaCineticaJoules(i: Inputs): Outputs {
  const m = Number(i.masa);
  const v = Number(i.velocidad);
  if (!m || m <= 0) throw new Error('La masa debe ser mayor a 0');
  if (v < 0) throw new Error('La velocidad no puede ser negativa');

  const ek = 0.5 * m * v * v;
  const ekKJ = ek / 1000;
  const ekCal = ek / 4.184;

  const _insight = {
    title: 'Energía cinética del cuerpo',
    text: `Una masa de **${m} kg** a **${v} m/s** tiene **${ek.toFixed(2)} J** (${ekKJ.toFixed(2)} kJ / ${ekCal.toFixed(0)} cal) de energía cinética. Como depende del **cuadrado de la velocidad**, duplicar la velocidad multiplicaría la energía por 4.`,
    tone: 'neutral' as const,
    icon: '⚡',
  };

  return {
    energiaJ: Number(ek.toFixed(2)),
    energiaKJ: Number(ekKJ.toFixed(4)),
    energiaCal: Number(ekCal.toFixed(2)),
    formula: `Ek = ½ × ${m} × ${v}² = ½ × ${m} × ${(v * v).toFixed(2)} = ${ek.toFixed(2)} J`,
    _insight,
  };
}
