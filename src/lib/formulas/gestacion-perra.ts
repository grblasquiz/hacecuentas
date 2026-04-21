/**
 * Calculadora de Fecha de Parto de Perra - Gestación 63 días
 */
export interface GestacionPerraInputs { fechaMonta: string; tamano: string; }
export interface GestacionPerraOutputs { fechaPartoEstimada: string; rangoFechas: string; semanaGestacion: string; diasRestantes: string; }

function fmtDate(d: Date): string {
  const m = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  return `${d.getDate()} de ${m[d.getMonth()]} de ${d.getFullYear()}`;
}

export function gestacionPerra(inputs: GestacionPerraInputs): GestacionPerraOutputs {
  const parts = String(inputs.fechaMonta || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá la fecha de monta');
  const [yy, mm, dd] = parts;
  const fechaMonta = new Date(yy, mm - 1, dd);
  if (isNaN(fechaMonta.getTime())) throw new Error('Ingresá la fecha de monta');

  const DIAS_GESTACION = 63;
  const fechaParto = new Date(fechaMonta.getTime());
  fechaParto.setDate(fechaParto.getDate() + DIAS_GESTACION);

  const rangoMin = new Date(fechaMonta.getTime());
  rangoMin.setDate(rangoMin.getDate() + 58);
  const rangoMax = new Date(fechaMonta.getTime());
  rangoMax.setDate(rangoMax.getDate() + 68);

  const hoy = new Date();
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaMonta.getTime()) / (1000 * 60 * 60 * 24));
  const semana = Math.floor(diasTranscurridos / 7) + 1;
  const diasRestantes = DIAS_GESTACION - diasTranscurridos;

  let semanaGestacion: string;
  if (diasTranscurridos < 0) {
    semanaGestacion = 'La fecha de monta es futura';
  } else if (diasTranscurridos > 68) {
    semanaGestacion = 'Ya debería haber parido (consultá al veterinario)';
  } else {
    semanaGestacion = `Semana ${semana} de 9 (día ${diasTranscurridos} de ~63)`;
  }

  return {
    fechaPartoEstimada: fmtDate(fechaParto),
    rangoFechas: `Entre ${fmtDate(rangoMin)} y ${fmtDate(rangoMax)}`,
    semanaGestacion,
    diasRestantes: diasRestantes > 0 ? `${diasRestantes} días` : diasRestantes === 0 ? '¡Hoy es el día estimado!' : `Pasaron ${Math.abs(diasRestantes)} días de la fecha estimada`,
  };
}
