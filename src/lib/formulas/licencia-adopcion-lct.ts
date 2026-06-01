/**
 * Calculadora de Licencia por Adopción (Argentina)
 *
 * Marco legal:
 *   - LCT (Ley 20.744): NO prevé licencia automática por adopción (vacío legal)
 *   - Decreto 214/2006: 100 días empleados públicos nacionales (SINEP)
 *   - CCT 122/75 (Sanidad): 90 días madre adoptiva, 15 días padre
 *   - CCT 18/75 (Bancarios): 60-90 días según paritarias
 *   - CCT 130/75 (Comercio reforma 2023): 60 días
 *   - Ley 24.714 + Ley 27.160: asignación ANSES por adopción
 *
 * La licencia se activa con la sentencia de guarda judicial (no la adopción definitiva).
 */

type SectorActividad =
  | 'empleado-publico-nacional'
  | 'empleado-publico-provincial'
  | 'privado-con-convenio-90'
  | 'privado-con-convenio-60'
  | 'privado-sin-convenio';

export interface LicenciaAdopcionInputs {
  sueldoMensual: number;
  sectorActividad: SectorActividad;
  edadAdoptado: number;
}

export interface LicenciaAdopcionOutputs {
  diasLicencia: string;
  montoBruto: number;
  asignacionAnses: number;
  mensaje: string;
}

const DIAS_POR_SECTOR: Record<SectorActividad, { dias: number; norma: string }> = {
  'empleado-publico-nacional': { dias: 100, norma: 'Decreto 214/2006 (SINEP)' },
  'empleado-publico-provincial': { dias: 95, norma: 'Estatutos provinciales (estimado)' },
  'privado-con-convenio-90': { dias: 90, norma: 'CCT específico (Sanidad, Bancarios, Petroleros)' },
  'privado-con-convenio-60': { dias: 60, norma: 'CCT mejorado (Comercio reforma 2023, otros)' },
  'privado-sin-convenio': { dias: 0, norma: 'LCT base (NO prevé licencia automática)' },
};

// Estimación 2026 de asignación ANSES por adopción única
// (varía según rango salarial y movilidad trimestral)
const ASIGNACION_ANSES_BASE_2026 = 200000;

export function licenciaAdopcionLct(inputs: LicenciaAdopcionInputs): LicenciaAdopcionOutputs {
  const sueldo = Number(inputs.sueldoMensual);

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo mensual bruto');
  }

  const sector: SectorActividad = inputs.sectorActividad || 'privado-sin-convenio';
  const info = DIAS_POR_SECTOR[sector];

  const dias = info.dias;
  const valorDia = sueldo / 30;
  const montoBruto = valorDia * dias;

  // Asignación ANSES: si tiene relación de dependencia (todos menos sin convenio que no goza licencia)
  // y rango salarial razonable, estimamos el monto base
  // Esto es una estimación; ANSES ajusta por movilidad trimestral y banda salarial
  let asignacionAnses = ASIGNACION_ANSES_BASE_2026;

  // Ajuste suave por banda salarial (escala inversa: salario más bajo, asignación más alta)
  if (sueldo < 500000) {
    asignacionAnses = ASIGNACION_ANSES_BASE_2026 * 1.3;
  } else if (sueldo > 3000000) {
    asignacionAnses = ASIGNACION_ANSES_BASE_2026 * 0.5;
  }

  let mensaje: string;

  if (sector === 'privado-sin-convenio') {
    mensaje =
      'LCT base no prevé licencia automática por adopción (vacío legal). ' +
      'Opciones: (1) usar vacaciones acumuladas; (2) negociar permiso sin goce de haberes; ' +
      '(3) verificar si tu CCT específico tiene cláusula de adopción; ' +
      '(4) acción de amparo invocando no discriminación con maternidad biológica (jurisprudencia minoritaria). ' +
      'ANSES paga asignación por adopción independiente. Gestioná en mi.anses.gob.ar con la sentencia de guarda judicial.';
  } else if (sector === 'empleado-publico-nacional') {
    mensaje =
      `Tenés derecho a ${dias} días corridos pagos al 100% por el Decreto 214/2006 (SINEP). ` +
      'La licencia se activa con la sentencia de guarda judicial del juez de familia. ' +
      'Presentá solicitud formal al organismo con copia certificada de la sentencia. ' +
      'Adicionalmente, ANSES paga asignación por adopción única más asignación familiar mensual.';
  } else {
    mensaje =
      `Tu CCT te otorga ${dias} días corridos pagos al 100% (${info.norma}). ` +
      'La licencia se activa con la sentencia de guarda judicial. ' +
      'Presentá solicitud formal al empleador con copia certificada de la sentencia. ' +
      'Verificá con tu sindicato si hay mejoras adicionales por paritarias recientes. ' +
      'ANSES paga asignación por adopción independiente, gestionable en mi.anses.gob.ar.';
  }

  const diasLicencia =
    dias === 0
      ? `Sin licencia automática`
      : `${dias} días corridos`;

  return {
    diasLicencia,
    montoBruto: Math.round(montoBruto),
    asignacionAnses: Math.round(asignacionAnses),
    mensaje,
  };
}
