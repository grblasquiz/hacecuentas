/** Conversión HbA1c (%) ↔ Glucosa promedio estimada (eAG) */
export interface Inputs {
  valor: number;
  modo?: string; // 'a1c-a-glucosa' o 'glucosa-a-a1c'
}
export interface Outputs {
  resultado: number;
  unidadEntrada: string;
  unidadSalida: string;
  categoria: string;
  formula: string;
  resumen: string;
  ifccMmolMol: number;
  _insight?: any;
  _chart?: any;
}

export function a1cGlucosa(i: Inputs): Outputs {
  const v = Number(i.valor);
  const modo = String(i.modo || 'a1c-a-glucosa');
  if (!v || v <= 0) throw new Error('Ingresá un valor positivo');

  let resultado = 0;
  let unidadEntrada = '';
  let unidadSalida = '';
  let formula = '';
  let categoria = '';
  let a1c = 0;

  if (modo === 'glucosa-a-a1c') {
    if (v < 30 || v > 500) throw new Error('Glucosa entre 30 y 500 mg/dL');
    // eAG = 28.7 × A1c − 46.7  →  A1c = (eAG + 46.7) / 28.7
    a1c = (v + 46.7) / 28.7;
    resultado = Number(a1c.toFixed(2));
    unidadEntrada = 'mg/dL (glucosa promedio estimada)';
    unidadSalida = '%';
    formula = `A1c (%) = (${v} + 46.7) / 28.7 = ${resultado}%`;
  } else {
    if (v < 3 || v > 20) throw new Error('A1c entre 3 y 20 %');
    a1c = v;
    // eAG = 28.7 × A1c − 46.7
    resultado = Number((28.7 * v - 46.7).toFixed(0));
    unidadEntrada = '%';
    unidadSalida = 'mg/dL (glucosa promedio estimada)';
    formula = `eAG (mg/dL) = 28.7 × ${v} − 46.7 = ${resultado} mg/dL`;
  }

  // Categoría según ADA (American Diabetes Association)
  if (a1c < 5.7) categoria = 'Normal (A1c < 5.7%)';
  else if (a1c < 6.5) categoria = 'Prediabetes (A1c 5.7 – 6.4%)';
  else if (a1c < 7.0) categoria = 'Diabetes — control bueno (A1c 6.5 – 6.9%)';
  else if (a1c < 8.0) categoria = 'Diabetes — control aceptable (A1c 7.0 – 7.9%)';
  else if (a1c < 9.0) categoria = 'Diabetes — control subóptimo (A1c 8.0 – 8.9%)';
  else categoria = 'Diabetes — mal controlada (A1c ≥ 9.0%)';

  // Conversión a IFCC (mmol/mol): IFCC = (NGSP − 2.15) × 10.929
  const ifccMmolMol = Number(((a1c - 2.15) * 10.929).toFixed(0));

  // eAG según el modo (calculada o ingresada) para mostrarla en el insight.
  const eag = modo === 'glucosa-a-a1c' ? v : resultado;
  const a1cFmt = a1c.toFixed(1);

  // Tono dinámico según el rango ADA del A1c.
  let tone: 'good' | 'warn' | 'neutral';
  if (a1c < 5.7) tone = 'good';
  else if (a1c < 6.5) tone = 'neutral';
  else tone = 'warn';

  const _insight = {
    title: categoria,
    text: `Un A1c de **${a1cFmt}%** equivale a una glucosa promedio de **${eag} mg/dL** en los últimos 2-3 meses (y **${ifccMmolMol} mmol/mol** en unidades IFCC). ${
      a1c < 5.7
        ? 'Está en rango **normal**.'
        : a1c < 6.5
          ? 'Cae en zona de **prediabetes**: conviene revisar hábitos y repetir el control.'
          : a1c < 7
            ? 'Indica **diabetes con buen control** (meta habitual: < 7%).'
            : 'Está **por encima de la meta** de control (< 7%): hablalo con tu médico.'
    }`,
    tone,
    icon: '🩸',
  };

  // Gauge sobre la escala de A1c con las zonas ADA.
  const _chart = {
    type: 'scale',
    marker: Number(a1cFmt),
    markerLabel: `${a1cFmt}%`,
    min: 4,
    segments: [
      { nombre: 'Normal', max: 5.7, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Prediabetes', max: 6.5, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Control bueno', max: 7, color: '#84cc16', colorDark: '#a3e635' },
      { nombre: 'Aceptable', max: 8, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Subóptimo', max: 9, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Mal control', max: Math.max(10, Math.ceil(a1c) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Escala de hemoglobina glicosilada A1c: tu valor ${a1cFmt}% en la zona ${categoria}.`,
  };

  return {
    resultado,
    unidadEntrada,
    unidadSalida,
    categoria,
    formula,
    resumen: `${i.valor} ${unidadEntrada} equivale a ${resultado} ${unidadSalida}.`,
    ifccMmolMol,
    _insight,
    _chart,
  };
}
