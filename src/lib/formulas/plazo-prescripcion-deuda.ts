/**
 * Calculadora de Prescripción de Deuda - Argentina
 * CCyCN Arts. 2554-2564 + leyes especiales
 */

export interface PlazoPrescripcionInputs {
  tipoDeuda: string;
  fechaUltimoPago: string;
}

export interface PlazoPrescripcionOutputs {
  resultado: string;
  fechaPrescripcion: string;
  plazoAnios: string;
  diasRestantes: string;
}

const PLAZOS: Record<string, { anios: number; nombre: string }> = {
  tarjeta: { anios: 1, nombre: 'Tarjeta de crédito' },
  cheque: { anios: 1, nombre: 'Cheque rechazado' },
  comercial: { anios: 2, nombre: 'Deuda comercial' },
  laboral: { anios: 2, nombre: 'Créditos laborales' },
  multas: { anios: 2, nombre: 'Multas de tránsito' },
  pagare: { anios: 3, nombre: 'Pagaré' },
  generica: { anios: 5, nombre: 'Deuda genérica / préstamo' },
  hipoteca: { anios: 5, nombre: 'Hipoteca' },
  impuestos: { anios: 5, nombre: 'Impuestos nacionales' },
};

function formatDate(d: Date): string {
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${d.getDate()} de ${months[d.getMonth()]} de ${d.getFullYear()}`;
}

export function plazoPrescripcionDeuda(inputs: PlazoPrescripcionInputs): PlazoPrescripcionOutputs {
  const tipo = inputs.tipoDeuda || 'generica';
  const parts = String(inputs.fechaUltimoPago || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error('Ingresá una fecha válida');
  }
  const [yy, mm, dd] = parts;
  const fecha = new Date(yy, mm - 1, dd);

  if (isNaN(fecha.getTime())) {
    throw new Error('Ingresá una fecha válida');
  }

  const config = PLAZOS[tipo] || PLAZOS.generica;
  const fechaPrescripcion = new Date(fecha.getTime());
  fechaPrescripcion.setFullYear(fechaPrescripcion.getFullYear() + config.anios);

  const hoy = new Date();
  const diffMs = fechaPrescripcion.getTime() - hoy.getTime();
  const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  let resultado: string;
  let diasRestantes: string;

  if (diffDias <= 0) {
    resultado = `¡Sí, tu deuda prescribió! Prescribió hace ${Math.abs(diffDias)} días`;
    diasRestantes = 'Ya prescribió';
  } else {
    resultado = `No, tu deuda aún NO prescribió. Faltan ${diffDias} días`;
    diasRestantes = `${diffDias} días (${(diffDias / 30).toFixed(1)} meses)`;
  }

  return {
    resultado,
    fechaPrescripcion: formatDate(fechaPrescripcion),
    plazoAnios: `${config.anios} año${config.anios > 1 ? 's' : ''} (${config.nombre})`,
    diasRestantes,
  };
}
