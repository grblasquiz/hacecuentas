/**
 * Beca Rita Cetina (secundaria) y Beca Benito Juárez (media superior) — estima el monto
 * bimestral y anual según el número de estudiantes. Los MONTOS son DATOS EDITABLES con
 * un valor de referencia por defecto (no constantes de ley): el usuario debe confirmar el
 * monto vigente del ciclo en el portal oficial. No hay constantes fiscales hardcodeadas.
 */
export interface Inputs {
  programa: 'rita-cetina' | 'benito-juarez';
  numEstudiantes: number;                 // hijos inscritos en ese nivel
  montoBaseBimestral: number;             // monto base bimestral ($), editable
  montoPorEstudianteAdicional: number;    // adicional por estudiante extra ($), solo Rita Cetina
}

export interface Outputs {
  programaNombre: string;
  montoBimestral: number;
  montoMensualPromedio: number;
  montoAnualEstimado: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  const esBenito = i.programa === 'benito-juarez';
  const n = Math.max(1, Math.round(Number(i.numEstudiantes) || 1));
  const base = Math.max(0, Number(i.montoBaseBimestral) || 0);
  const adicional = Math.max(0, Number(i.montoPorEstudianteAdicional) || 0);

  // La Beca para el Bienestar se dispersa por bimestre durante el ciclo escolar
  // (aprox. 5 bimestres/ciclo). Estimación orientativa, no un monto de ley.
  const bimestresCiclo = 5;

  let montoBimestral: number;
  let programaNombre: string;
  if (esBenito) {
    // Benito Juárez (media superior): monto por estudiante.
    montoBimestral = base * n;
    programaNombre = 'Beca Benito Juárez (media superior)';
  } else {
    // Rita Cetina (secundaria): base por familia + adicional por cada estudiante extra.
    montoBimestral = base + adicional * (n - 1);
    programaNombre = 'Beca Rita Cetina (secundaria)';
  }

  const montoMensualPromedio = montoBimestral / 2;
  const montoAnualEstimado = montoBimestral * bimestresCiclo;

  const round2 = (n2: number) => Math.round(n2 * 100) / 100;
  const money = (v: number) => '$' + Math.round(v).toLocaleString('es-MX');

  const detalle = esBenito
    ? `${programaNombre}: ${money(base)} por estudiante × ${n} = ${money(montoBimestral)} por bimestre.`
    : `${programaNombre}: ${money(base)} base por familia${n > 1 ? ` + ${money(adicional)} × ${n - 1} estudiante(s) adicional(es)` : ''} = ${money(montoBimestral)} por bimestre.`;

  const _insight = {
    title: 'Monto estimado de tu beca',
    text: `Con **${n}** estudiante(s), la **${programaNombre}** paga alrededor de **${money(montoBimestral)}** por bimestre (~**${money(montoMensualPromedio)}** al mes) y unos **${money(montoAnualEstimado)}** en el ciclo escolar. Confirmá el monto vigente en el portal oficial: cambia cada ciclo.`,
    tone: 'good',
    icon: '🎓',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Por bimestre', 'Estimado del ciclo'],
    values: [Math.round(montoBimestral), Math.round(montoAnualEstimado)],
    prefix: '$',
    ariaLabel: `Monto por bimestre ${money(montoBimestral)} y estimado del ciclo ${money(montoAnualEstimado)}.`,
  };

  return {
    programaNombre,
    montoBimestral: round2(montoBimestral),
    montoMensualPromedio: round2(montoMensualPromedio),
    montoAnualEstimado: round2(montoAnualEstimado),
    detalle,
    _insight,
    _chart,
  };
}
