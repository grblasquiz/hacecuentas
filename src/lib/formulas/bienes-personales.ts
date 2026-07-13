/** Bienes Personales 2026 — Ley 23.966 con reforma Ley 27.743 (Bases) */
export interface Inputs {
  valorBienesPais: number;
  valorBienesExterior: number;
  incluyeInmuebleCasa?: boolean | string;
  valorCasaHabitacion?: number;
  regimenREIBP?: boolean | string;
}
export interface Outputs {
  baseImponible: number;
  minimoNoImponible: number;
  excedente: number;
  alicuota: number;
  impuesto: number;
  paga: boolean;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

const fmtPesos = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

// Escala período fiscal 2025 (bienes al 31/12/2025, DDJJ 2026), Ley 27.743: unificación país/exterior
// MNI período fiscal 2025: $384.728.044,57 (confirmado ARCA)
// Inmueble casa-habitación: deducción/exención hasta $1.346.548.155,99
const MNI = 384_728_044.57;
const DEDUCCION_CASA = 1_346_548_155.99;

// Escala progresiva período fiscal 2025 (sobre el EXCEDENTE del MNI), 3 tramos
// Ley 27.743: tope general 1,00%; "régimen especial" REIBP (tasa fija 0,45%)
const ESCALA: Array<{ hasta: number; tasa: number; acumulado: number; }> = [
  { hasta: 52_664_283.73, tasa: 0.005, acumulado: 0 },
  { hasta: 114_105_948.16, tasa: 0.0075, acumulado: 263_321.42 },
  { hasta: Infinity, tasa: 0.01, acumulado: 724_133.89 },
];

export function bienesPersonales(i: Inputs): Outputs {
  const pais = Number(i.valorBienesPais) || 0;
  const exterior = Number(i.valorBienesExterior) || 0;
  const incluyeCasa = i.incluyeInmuebleCasa === true || i.incluyeInmuebleCasa === 'true' || i.incluyeInmuebleCasa === 'si';
  const casa = incluyeCasa ? (Number(i.valorCasaHabitacion) || 0) : 0;
  const reibp = i.regimenREIBP === true || i.regimenREIBP === 'true' || i.regimenREIBP === 'si';

  // Deducción casa habitación (solo si aplicable)
  const deduccionCasa = Math.min(casa, DEDUCCION_CASA);
  const baseBruta = pais + exterior - deduccionCasa;

  if (baseBruta <= MNI) {
    return {
      baseImponible: Math.max(0, baseBruta),
      minimoNoImponible: MNI,
      excedente: 0,
      alicuota: 0,
      impuesto: 0,
      paga: false,
      mensaje: `Estás por debajo del mínimo no imponible de $${(MNI / 1e6).toFixed(0)}M — no pagás Bienes Personales.`,
      _insight: {
        title: 'No alcanzás el mínimo imponible',
        text: `Tu base de **${fmtPesos(Math.max(0, baseBruta))}** queda por debajo del mínimo no imponible de **${fmtPesos(MNI)}**, así que este año **no pagás** Bienes Personales.`,
        tone: 'good',
        icon: '✅',
      },
    };
  }

  const excedente = baseBruta - MNI;

  // REIBP (régimen especial): 0.45 % fijo por 5 años
  if (reibp) {
    const impuesto = baseBruta * 0.0045 * 5; // pago adelantado 5 años
    return {
      baseImponible: baseBruta,
      minimoNoImponible: MNI,
      excedente,
      alicuota: 0.45,
      impuesto: Math.round(impuesto),
      paga: true,
      mensaje: `REIBP: pagás el equivalente a 5 años por adelantado a la tasa fija de 0.45 %.`,
      _insight: {
        title: 'REIBP: 5 años por adelantado',
        text: `Bajo el régimen especial pagás **${fmtPesos(impuesto)}** de una sola vez sobre una base de **${fmtPesos(baseBruta)}** (tasa fija **0.45%** × 5 años). A cambio quedás blindado ante subas de alícuotas hasta 2028.`,
        tone: 'warn',
        icon: '🏛️',
      },
      _chart: {
        type: 'doughnut',
        slices: [
          { label: 'Mínimo no imponible (exento)', value: Math.round(MNI) },
          { label: 'Excedente gravado', value: Math.round(excedente) },
        ],
        prefix: '$',
        centerValue: fmtPesos(baseBruta),
        centerLabel: 'Base imponible',
        ariaLabel: `Base de ${fmtPesos(baseBruta)}: ${fmtPesos(MNI)} exento y ${fmtPesos(excedente)} gravado.`,
      },
    };
  }

  // Escala progresiva sobre el excedente
  let tasa = 0;
  let impuesto = 0;
  for (let k = 0; k < ESCALA.length; k++) {
    const tramo = ESCALA[k];
    if (excedente <= tramo.hasta) {
      const desde = k === 0 ? 0 : ESCALA[k - 1].hasta;
      tasa = tramo.tasa;
      impuesto = tramo.acumulado + (excedente - desde) * tramo.tasa;
      break;
    }
  }

  const efectiva = baseBruta > 0 ? (impuesto / baseBruta) * 100 : 0;
  return {
    baseImponible: baseBruta,
    minimoNoImponible: MNI,
    excedente,
    alicuota: Number((tasa * 100).toFixed(3)),
    impuesto: Math.round(impuesto),
    paga: true,
    mensaje: `Con base imponible de $${(baseBruta / 1e6).toFixed(1)}M te corresponde una alícuota marginal del ${(tasa * 100).toFixed(2)}%.`,
    _insight: {
      title: 'Cuánto pagás de Bienes Personales',
      text: `Sobre una base de **${fmtPesos(baseBruta)}** tributás **${fmtPesos(impuesto)}**: alícuota marginal **${(tasa * 100).toFixed(2)}%** y tasa efectiva **${efectiva.toFixed(2)}%**. Solo el excedente de **${fmtPesos(excedente)}** por encima del mínimo paga impuesto.`,
      tone: 'warn',
      icon: '🏛️',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Mínimo no imponible (exento)', value: Math.round(MNI) },
        { label: 'Excedente gravado', value: Math.round(excedente) },
      ],
      prefix: '$',
      centerValue: fmtPesos(baseBruta),
      centerLabel: 'Base imponible',
      ariaLabel: `Base de ${fmtPesos(baseBruta)}: ${fmtPesos(MNI)} exento y ${fmtPesos(excedente)} gravado.`,
    },
  };
}
