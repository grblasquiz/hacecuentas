/**
 * Calculadora de Licencia por Fallecimiento de Familiar (Art. 158 inc. a LCT)
 *
 * Marco legal:
 *   - Ley 20.744 (LCT) Art. 158 inc. a:
 *       3 días corridos: cónyuge, conviviente (jurisprudencia + CCyC), hijo, padre/madre
 *       1 día corrido: hermano
 *   - Ley 26.994 (CCyC Arts. 509-528): unión convivencial equiparada
 *   - Ley 26.618 (Matrimonio Igualitario): cónyuge sin distinción de género
 *
 * Mejoras por convenio:
 *   - CCT 130/75 (Comercio): hasta 5 días cónyuge/hijo, 2 días hermano
 *   - CCT 18/75 (Bancarios): 5 días cónyuge/hijo, 2 días hermano
 *   - CCT 122/75 (Sanidad): hasta 5 días
 *   - CCT 40/89 (Camioneros): 5 días cónyuge/hijo
 *
 * Cálculo: días corridos (cuentan sábados, domingos y feriados). Monto = sueldo / 30 × días.
 */

type Parentesco =
  | 'conyuge-conviviente'
  | 'hijo'
  | 'padre-madre'
  | 'hermano'
  | 'abuelo-no-corresponde-lct';

type SectorActividad =
  | 'general-lct'
  | 'bancarios'
  | 'comercio'
  | 'construccion-uocra'
  | 'sanidad'
  | 'camioneros';

export interface LicenciaFallecimientoInputs {
  sueldoMensual: number;
  parentesco: Parentesco;
  sectorActividad: SectorActividad;
}

export interface LicenciaFallecimientoOutputs {
  diasLicencia: string;
  montoBruto: number;
  parentescoTexto: string;
  valorDia: number;
  mensaje: string;
}

// Días por parentesco según LCT base
const DIAS_LCT: Record<Parentesco, number> = {
  'conyuge-conviviente': 3,
  hijo: 3,
  'padre-madre': 3,
  hermano: 1,
  'abuelo-no-corresponde-lct': 0,
};

const NOMBRE_PARENTESCO: Record<Parentesco, string> = {
  'conyuge-conviviente': 'cónyuge o conviviente',
  hijo: 'hijo/a',
  'padre-madre': 'padre o madre',
  hermano: 'hermano/a',
  'abuelo-no-corresponde-lct': 'abuelo/suegro/cuñado',
};

// Mejoras por convenio: días por parentesco
// estructura: sector -> parentesco -> días
const MEJORAS_CCT: Record<SectorActividad, Partial<Record<Parentesco, number>>> = {
  'general-lct': {},
  bancarios: {
    'conyuge-conviviente': 5,
    hijo: 5,
    'padre-madre': 3,
    hermano: 2,
  },
  comercio: {
    'conyuge-conviviente': 5,
    hijo: 5,
    'padre-madre': 3,
    hermano: 2,
  },
  'construccion-uocra': {},
  sanidad: {
    'conyuge-conviviente': 5,
    hijo: 5,
    'padre-madre': 3,
    hermano: 2,
  },
  camioneros: {
    'conyuge-conviviente': 5,
    hijo: 5,
    'padre-madre': 3,
    hermano: 1,
  },
};

const NOMBRE_CCT: Record<SectorActividad, string> = {
  'general-lct': 'LCT Art. 158',
  bancarios: 'CCT 18/75 (Bancarios)',
  comercio: 'CCT 130/75 (Comercio)',
  'construccion-uocra': 'CCT 76/75 (UOCRA)',
  sanidad: 'CCT 122/75 (Sanidad)',
  camioneros: 'CCT 40/89 (Camioneros)',
};

export function licenciaFallecimientoFamiliarLct(
  inputs: LicenciaFallecimientoInputs
): LicenciaFallecimientoOutputs {
  const sueldo = Number(inputs.sueldoMensual);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual bruto');
  }

  const parentesco: Parentesco = inputs.parentesco || 'padre-madre';
  const sector: SectorActividad = inputs.sectorActividad || 'general-lct';

  const diasLct = DIAS_LCT[parentesco];
  const mejorasCct = MEJORAS_CCT[sector] || {};
  const diasCct = mejorasCct[parentesco];

  // Aplica el mayor entre LCT y CCT
  const dias = diasCct !== undefined ? Math.max(diasLct, diasCct) : diasLct;

  const valorDia = sueldo / 30;
  const montoBruto = valorDia * dias;

  const parentescoNombre = NOMBRE_PARENTESCO[parentesco];
  const cctNombre = NOMBRE_CCT[sector];
  const parentescoTexto = `Fallecimiento de ${parentescoNombre} bajo ${cctNombre}`;

  let mensaje: string;

  if (parentesco === 'abuelo-no-corresponde-lct') {
    mensaje =
      `El Art. 158 inc. a LCT NO incluye abuelos, suegros, cuñados, tíos ni primos. ` +
      `Algunos convenios incluyen abuelos con 1 día (verificá tu CCT). ` +
      `Alternativas: pedir permiso sin goce de haberes, usar vacaciones del año, o compensar con horas extra. ` +
      `Si la relación afectiva es estrecha (te criaron, vivían juntos), planteá un permiso especial humanitario al empleador.`;
  } else if (dias > diasLct) {
    const extra = dias - diasLct;
    mensaje =
      `Tu CCT mejora la LCT base en ${extra} día${extra > 1 ? 's' : ''} adicional${extra > 1 ? 'es' : ''}. ` +
      `Los días son corridos (cuentan sábados, domingos y feriados) y pagos al 100% del salario habitual. ` +
      `Avisá al empleador del fallecimiento de forma inmediata y presentá copia del acta de defunción del Registro Civil dentro de los días siguientes.`;
  } else {
    mensaje =
      `Te corresponden ${dias} día${dias > 1 ? 's' : ''} corrido${dias > 1 ? 's' : ''} pago${dias > 1 ? 's' : ''} al 100% del salario habitual. ` +
      `Son días corridos (cuentan sábados, domingos y feriados). ` +
      `El monto está incluido en el sueldo mensual, no se suma aparte. ` +
      `Avisá al empleador del fallecimiento y presentá el acta de defunción del Registro Civil en los días siguientes.`;
  }

  const diasLicencia =
    dias === 0
      ? 'Sin licencia automática LCT (verificá tu CCT)'
      : `${dias} día${dias > 1 ? 's' : ''} corrido${dias > 1 ? 's' : ''}`;

  return {
    diasLicencia,
    montoBruto: Math.round(montoBruto),
    parentescoTexto,
    valorDia: Math.round(valorDia),
    mensaje,
  };
}
