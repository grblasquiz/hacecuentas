/**
 * Calculadora de Licencia por Matrimonio (Art. 158 inc. b LCT)
 *
 * Marco legal:
 *   - Ley 20.744 (LCT) Art. 158 inc. b: 10 días corridos pagos por matrimonio
 *   - Ley 26.618 (2010): Matrimonio Igualitario - extiende a parejas mismo sexo
 *   - Ley 26.743: Identidad de Género - refuerza no discriminación
 *
 * Mejoras por convenio (no LCT base):
 *   - CCT 18/75 Bancarios: 15 días
 *   - CCT 122/75 Sanidad FATSA: 12 días
 *   - CCT 40/89 Camioneros: 12 días
 *   - Resto: 10 días = LCT base
 *
 * Cálculo: días son corridos (no hábiles). Monto = sueldo / 30 × días.
 * Los días pagos se incluyen en el sueldo mensual habitual (no se suman aparte).
 */

type SectorActividad =
  | 'general-lct'
  | 'bancarios'
  | 'comercio'
  | 'construccion-uocra'
  | 'sanidad'
  | 'camioneros';

export interface LicenciaMatrimonioInputs {
  sueldoMensual: number;
  sectorActividad: SectorActividad;
}

export interface LicenciaMatrimonioOutputs {
  diasLicencia: string;
  montoBruto: number;
  convenioMejora: string;
  valorDia: number;
  mensaje: string;
}

const DIAS_POR_SECTOR: Record<SectorActividad, { dias: number; nombre: string; cct: string }> = {
  'general-lct': { dias: 10, nombre: 'General LCT', cct: 'LCT Art. 158 inc. b' },
  bancarios: { dias: 15, nombre: 'Bancarios', cct: 'CCT 18/75 La Bancaria' },
  comercio: { dias: 10, nombre: 'Comercio', cct: 'CCT 130/75 Empleados de Comercio' },
  'construccion-uocra': { dias: 10, nombre: 'Construcción', cct: 'CCT 76/75 UOCRA' },
  sanidad: { dias: 12, nombre: 'Sanidad', cct: 'CCT 122/75 FATSA' },
  camioneros: { dias: 12, nombre: 'Camioneros', cct: 'CCT 40/89 Camioneros' },
};

export function licenciaMatrimonioLct158(
  inputs: LicenciaMatrimonioInputs
): LicenciaMatrimonioOutputs {
  const sueldo = Number(inputs.sueldoMensual);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual bruto');
  }

  const sector: SectorActividad = inputs.sectorActividad || 'general-lct';
  const info = DIAS_POR_SECTOR[sector];

  const dias = info.dias;
  const diasLctBase = 10;

  const valorDia = sueldo / 30;
  const montoBruto = valorDia * dias;

  let convenioMejora: string;
  if (dias > diasLctBase) {
    const diasExtra = dias - diasLctBase;
    convenioMejora = `${info.cct} mejora LCT en ${diasExtra} días adicionales`;
  } else {
    convenioMejora = `${info.cct} sigue LCT base (sin mejora)`;
  }

  const diasLicencia = `${dias} días corridos (${info.nombre})`;

  const mensaje =
    `Tenés derecho a ${dias} días corridos pagos al 100% del salario habitual. ` +
    `Son días corridos (cuentan sábados, domingos y feriados). ` +
    `El monto está incluido en el sueldo mensual, no se suma aparte. ` +
    `Avisá a tu empleador con anticipación y presentá el acta de matrimonio dentro de los 30 días posteriores.`;

  return {
    diasLicencia,
    montoBruto: Math.round(montoBruto),
    convenioMejora,
    valorDia: Math.round(valorDia),
    mensaje,
  };
}
