/**
 * Calculadora de Licencia por Maternidad y Paternidad - Argentina
 * LCT Arts. 158, 177-179
 * Maternidad: 90 días (45+45 o 30+60). Paternidad: 2 días (LCT mínimo).
 */

export interface LicenciaMatPatInputs {
  tipo: string;
  fechaParto: string;
  opcionMaternidad: string;
}

export interface LicenciaMatPatOutputs {
  diasLicencia: number;
  fechaInicio: string;
  fechaFin: string;
  quienPaga: string;
  _insight?: any;
}

function formatDate(d: Date): string {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
}

export function licenciaMaternidadPaternidad(inputs: LicenciaMatPatInputs): LicenciaMatPatOutputs {
  const parts = String(inputs.fechaParto || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error('Ingresá una fecha probable de parto válida');
  }
  const [yy, mm, dd] = parts;
  const fechaParto = new Date(yy, mm - 1, dd);
  if (isNaN(fechaParto.getTime())) {
    throw new Error('Ingresá una fecha probable de parto válida');
  }

  const tipo = inputs.tipo || 'maternidad';

  if (tipo === 'paternidad') {
    const fechaInicio = fechaParto;
    const fechaFin = addDays(fechaParto, 1); // 2 días corridos
    return {
      diasLicencia: 2,
      fechaInicio: formatDate(fechaInicio),
      fechaFin: formatDate(fechaFin),
      quienPaga: 'El empleador (son días con goce de sueldo)',
      _insight: {
        title: 'Licencia por paternidad',
        text: 'La LCT te garantiza apenas **2 días corridos** con goce de sueldo, del mínimo más bajo de la región. Revisá tu **convenio colectivo**: muchos (bancarios, sanidad, camioneros) otorgan entre 5 y 15 días.',
        tone: 'warn',
        icon: '👨‍🍼',
      },
    };
  }

  // Maternidad: 90 días
  const opcion = inputs.opcionMaternidad || '45-45';
  let diasAntes: number;
  let diasDespues: number;

  if (opcion === '30-60') {
    diasAntes = 30;
    diasDespues = 60;
  } else {
    diasAntes = 45;
    diasDespues = 45;
  }

  const fechaInicio = addDays(fechaParto, -diasAntes);
  const fechaFin = addDays(fechaParto, diasDespues - 1);

  return {
    diasLicencia: 90,
    fechaInicio: formatDate(fechaInicio),
    fechaFin: formatDate(fechaFin),
    quienPaga: 'ANSES (asignación por maternidad, equivalente al sueldo bruto)',
    _insight: {
      title: 'Licencia por maternidad',
      text: `Te corresponden **90 días corridos** (${diasAntes} antes + ${diasDespues} después del parto), pagados por **ANSES** como asignación equivalente a tu sueldo bruto. El reintegro está previsto para el **${formatDate(addDays(fechaFin, 1))}**.`,
      tone: 'good',
      icon: '🤰',
    },
  };
}
