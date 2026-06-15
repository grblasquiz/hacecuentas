/** Licencia de paternidad (Ecuador) — Art. 152 del Código del Trabajo.
 *  Base 15 días (parto normal); +5 por cesárea o parto múltiple (=20);
 *  +8 por prematuro o cuidados especiales (=23); 25 días por enfermedad
 *  degenerativa/terminal/irreversible o discapacidad severa del hijo.
 *  Son días CALENDARIO, 100% remunerados, justificados con certificado médico.
 *  fuente: Código del Trabajo, Art. 152, reformado por la Ley Orgánica del
 *  Derecho al Cuidado Humano (RO Suplemento Nº 309, 12-may-2023), que elevó
 *  la base de 10 a 15 días ("plazo de diez días" → "plazo de quince (15) días").
 *  Ecuador dolarizado → montos en USD ("$"). */

export interface Inputs {
  tipoParto: 'normal' | 'cesarea_multiple' | 'prematuro' | 'enfermedad_grave';
  fechaNacimiento?: string; // ISO YYYY-MM-DD (opcional, para calcular fechas)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// fuente: Código del Trabajo Ecuador, Art. 152 (reforma Ley del Cuidado Humano 2023) — días calendario de licencia de paternidad.
const DIAS_BASE = 15;                  // 15 días por parto normal (antes 10; reforma 2023)
const ADICIONAL_CESAREA_MULTIPLE = 5; // +5 → 20 días
const ADICIONAL_PREMATURO = 8;        // +8 → 23 días
const DIAS_ENFERMEDAD_GRAVE = 25;     // 25 días (absoluto, no acumulativo)

const ETIQUETAS: Record<string, string> = {
  normal: 'Parto normal',
  cesarea_multiple: 'Cesárea o parto múltiple',
  prematuro: 'Prematuro o cuidados especiales',
  enfermedad_grave: 'Enfermedad degenerativa/terminal o discapacidad severa',
};

function fmtFecha(d: Date): string {
  return new Intl.DateTimeFormat('es-EC', { day: '2-digit', month: 'long', year: 'numeric' }).format(d);
}

export function compute(i: Inputs): Outputs {
  const tipo = String(i.tipoParto || '').trim();
  if (!tipo || !(tipo in ETIQUETAS)) {
    throw new Error('Elegí el tipo de parto / circunstancia del nacimiento');
  }

  // Días totales según la circunstancia (Art. 152).
  let dias: number;
  let detalleDesglose: string;
  switch (tipo) {
    case 'cesarea_multiple':
      dias = DIAS_BASE + ADICIONAL_CESAREA_MULTIPLE; // 15
      detalleDesglose = `${DIAS_BASE} base + ${ADICIONAL_CESAREA_MULTIPLE} por cesárea/múltiple`;
      break;
    case 'prematuro':
      dias = DIAS_BASE + ADICIONAL_PREMATURO; // 18
      detalleDesglose = `${DIAS_BASE} base + ${ADICIONAL_PREMATURO} por prematuro/cuidados especiales`;
      break;
    case 'enfermedad_grave':
      dias = DIAS_ENFERMEDAD_GRAVE; // 25 (absoluto)
      detalleDesglose = `${DIAS_ENFERMEDAD_GRAVE} días (régimen especial por enfermedad grave del hijo)`;
      break;
    default: // normal
      dias = DIAS_BASE; // 10
      detalleDesglose = `${DIAS_BASE} días base (parto normal)`;
  }

  const diasAdicionales = dias - DIAS_BASE;

  // Fechas (opcional). Días calendario: el día del nacimiento cuenta como día 1.
  let fechaInicioStr = '';
  let fechaFinStr = '';
  let fechasTexto = '';
  const raw = (i.fechaNacimiento || '').trim();
  if (raw) {
    const inicio = new Date(raw + 'T00:00:00');
    if (!isNaN(inicio.getTime())) {
      const fin = new Date(inicio.getTime());
      fin.setDate(fin.getDate() + dias - 1); // inclusivo: día 1 = nacimiento
      fechaInicioStr = fmtFecha(inicio);
      fechaFinStr = fmtFecha(fin);
      fechasTexto = ` Si tomás la licencia desde el nacimiento, va del ${fechaInicioStr} al ${fechaFinStr} (${dias} días calendario, ambos inclusive). Podés iniciarla el mismo día del parto o dentro de los 30 días posteriores.`;
    }
  }

  const _insight = {
    title: 'Tu licencia de paternidad',
    text: `Por **${ETIQUETAS[tipo].toLowerCase()}**, te corresponden **${dias} días calendario** de licencia de paternidad remunerada al 100% (Art. 152 del Código del Trabajo).${diasAdicionales > 0 && tipo !== 'enfermedad_grave' ? ` Eso son ${DIAS_BASE} días base más ${diasAdicionales} días adicionales.` : ''}${fechasTexto} Recordá justificarla con el certificado médico del IESS.`,
    tone: 'good',
    icon: '👨‍🍼',
  };

  const _chart = {
    type: 'gauge',
    value: dias,
    min: 0,
    max: DIAS_ENFERMEDAD_GRAVE, // 25 = tope legal
    label: `${dias} días`,
    ariaLabel: `Licencia de paternidad de ${dias} días calendario sobre un máximo legal de ${DIAS_ENFERMEDAD_GRAVE} días.`,
  };

  return {
    diasLicencia: `${dias} días`,
    diasBase: `${DIAS_BASE} días`,
    diasAdicionales: tipo === 'enfermedad_grave' ? '— (régimen especial)' : `${diasAdicionales} días`,
    tipoSeleccionado: ETIQUETAS[tipo],
    fechaInicio: fechaInicioStr || '—',
    fechaFin: fechaFinStr || '—',
    detalle: `${ETIQUETAS[tipo]}: ${detalleDesglose} = ${dias} días calendario remunerados al 100% (Art. 152).${fechasTexto}`,
    _insight,
    _chart,
  };
}
