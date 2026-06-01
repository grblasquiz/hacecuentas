/**
 * Calculadora de prestación dineraria por ILT (Incapacidad Laboral Temporaria)
 * Ley 24.557 Art. 13 + Ley 27.348 (definición VIB)
 *
 * Reglas:
 *   - Días 1 a 10: paga el empleador el sueldo íntegro.
 *   - Días 11 al alta o máximo 365 días: paga la ART el VIB
 *     (Valor Mensual del Ingreso Base = promedio últ 12 meses).
 *   - Si supera 365 días → pasa a Incapacidad Laboral Permanente
 *     (Art. 7° inc. 2 b) Ley 24.557 / Art. 14 LRT).
 */

export type TipoLesionIlt =
  | 'accidente-trabajo'
  | 'enfermedad-profesional'
  | 'in-itinere';

export interface ArtPrestacionIltInputs {
  sueldoBrutoMensual: number;
  diasIlt: number;
  tipoLesion: TipoLesionIlt;
}

export interface ArtPrestacionIltOutputs {
  pagaEmpleadorDias1a10: number;
  pagaArtDias11Plus: number;
  totalPrestacion: number;
  valorIngresoBaseDiario: number;
  diasArt: string;
  fechaLimiteIltMax: string;
  mensaje: string;
  _chart?: any;
}

const DIAS_EMPLEADOR = 10;
const DIAS_MAX_ILT = 365;

export function artPrestacionIltIncapacidadTemporaria(
  inputs: ArtPrestacionIltInputs,
): ArtPrestacionIltOutputs {
  const sueldo = Number(inputs.sueldoBrutoMensual);
  const dias = Math.max(1, Math.floor(Number(inputs.diasIlt) || 0));
  const tipo: TipoLesionIlt = inputs.tipoLesion || 'accidente-trabajo';

  if (!sueldo || sueldo <= 0) {
    throw new Error('Ingresá el sueldo bruto mensual (VIB)');
  }
  if (!dias || dias <= 0) {
    throw new Error('Ingresá los días de ILT');
  }

  const valorIngresoBaseDiario = sueldo / 30;

  // Días a cargo del empleador (máx 10)
  const diasEmpleador = Math.min(dias, DIAS_EMPLEADOR);
  const pagaEmpleadorDias1a10 = valorIngresoBaseDiario * diasEmpleador;

  // Días a cargo de la ART (desde el 11 hasta el máximo o el alta)
  // Si la ILT supera 365 días, la ART solo paga hasta el día 365.
  const diasCubiertosTotal = Math.min(dias, DIAS_MAX_ILT);
  const diasArtNum = Math.max(0, diasCubiertosTotal - DIAS_EMPLEADOR);
  const pagaArtDias11Plus = valorIngresoBaseDiario * diasArtNum;

  const totalPrestacion = pagaEmpleadorDias1a10 + pagaArtDias11Plus;

  // Mensajes contextuales
  let mensaje = '';
  if (dias > DIAS_MAX_ILT) {
    mensaje =
      'ATENCIÓN: superás los 365 días de ILT. Por Art. 7° Ley 24.557 la incapacidad ' +
      'se considera permanente (ILP) y debés calcular la indemnización del Art. 14 LRT. ' +
      'Solicitá dictamen a la Comisión Médica Jurisdiccional (Ley 27.348).';
  } else if (dias >= 300) {
    mensaje =
      'Advertencia: te quedan menos de 65 días de ILT antes del límite legal de 365 ' +
      'días. Iniciá el trámite de Comisión Médica para evaluar la incapacidad permanente.';
  } else if (dias <= DIAS_EMPLEADOR) {
    mensaje =
      'Toda la prestación está a cargo del empleador (período de incapacidad ' +
      'temporal a cargo del empleador, Art. 13 inc. 1 LRT). La ART no paga este tramo.';
  } else {
    mensaje =
      'Cobertura ordinaria: el empleador paga los primeros 10 días y la ART paga el ' +
      'resto hasta el alta o el máximo de 365 días (Art. 13 Ley 24.557).';
  }

  // Mensaje adicional por tipo de lesión
  if (tipo === 'in-itinere') {
    mensaje +=
      ' Recordá que en accidentes in itinere debés tener denuncia policial o ' +
      'constancia del trayecto habitual sin desvíos (Art. 6° inc. 1 LRT).';
  } else if (tipo === 'enfermedad-profesional') {
    mensaje +=
      ' Para enfermedades profesionales, verificá que tu patología esté en el listado ' +
      'del Decreto 658/96 (con anexos actualizados por Decreto 49/2014).';
  }

  const fechaLimiteIltMax =
    dias >= DIAS_MAX_ILT
      ? 'Superaste el límite (pasa a ILP)'
      : `Quedan ${DIAS_MAX_ILT - dias} días antes del límite máximo (365)`;

  const diasArt =
    diasArtNum > 0
      ? `${diasArtNum} ${diasArtNum === 1 ? 'día' : 'días'} a cargo de la ART`
      : 'Sin días a cargo de la ART (todo el empleador)';

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Empleador (días 1-10)', value: Math.round(pagaEmpleadorDias1a10) },
      { label: 'ART (días 11+)', value: Math.round(pagaArtDias11Plus) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalPrestacion).toLocaleString('es-AR'),
    centerLabel: 'Prestación total',
    ariaLabel: 'Composición de la prestación: tramo a cargo del empleador y tramo a cargo de la ART',
  };

  return {
    pagaEmpleadorDias1a10: Math.round(pagaEmpleadorDias1a10),
    pagaArtDias11Plus: Math.round(pagaArtDias11Plus),
    totalPrestacion: Math.round(totalPrestacion),
    valorIngresoBaseDiario: Math.round(valorIngresoBaseDiario),
    diasArt,
    fechaLimiteIltMax,
    mensaje,
    _chart: chart,
  };
}
