/** Duración de gestación y fecha estimada de parto para mascotas */
export interface Inputs {
  especie?: string;
  fechaCruza: string;
}
export interface Outputs {
  duracionDias: number;
  fechaEstimadaParto: string;
  semanaActual: string;
  etapa: string;
  detalle: string;
}

export function gestacionAnimal(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const fechaStr = String(i.fechaCruza);

  if (!fechaStr) throw new Error('Ingresá la fecha de cruza');

  const fechaCruza = new Date(fechaStr + 'T00:00:00');
  if (isNaN(fechaCruza.getTime())) throw new Error('Fecha inválida');

  // Duración gestacional por especie
  const gestaciones: Record<string, { dias: number; nombre: string }> = {
    perro: { dias: 63, nombre: 'Perro' },
    gato: { dias: 65, nombre: 'Gato' },
    conejo: { dias: 31, nombre: 'Conejo' },
    hamster: { dias: 16, nombre: 'Hámster' },
  };

  const gest = gestaciones[especie] || gestaciones['perro'];

  // Fecha estimada de parto
  const fpp = new Date(fechaCruza);
  fpp.setDate(fpp.getDate() + gest.dias);

  // Días transcurridos
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasTranscurridos = Math.floor((hoy.getTime() - fechaCruza.getTime()) / (1000 * 60 * 60 * 24));
  const diasRestantes = gest.dias - diasTranscurridos;

  const semanaActual = Math.floor(diasTranscurridos / 7) + 1;
  const semanasTotal = Math.ceil(gest.dias / 7);

  // Etapa
  let etapa = '';
  const porcentaje = diasTranscurridos / gest.dias;
  if (diasTranscurridos < 0) {
    etapa = 'La fecha de cruza es futura';
  } else if (porcentaje < 0.25) {
    etapa = 'Etapa inicial (fertilización/implantación)';
  } else if (porcentaje < 0.5) {
    etapa = 'Desarrollo embrionario';
  } else if (porcentaje < 0.75) {
    etapa = 'Crecimiento fetal acelerado';
  } else if (porcentaje < 1) {
    etapa = 'Etapa final — preparar para el parto';
  } else {
    etapa = 'Fecha de parto pasada — consultá al veterinario';
  }

  const formatFecha = (d: Date) => d.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  let semanaTexto = '';
  if (diasTranscurridos < 0) {
    semanaTexto = 'Aún no comenzó';
  } else {
    semanaTexto = `Semana ${semanaActual} de ${semanasTotal} (día ${diasTranscurridos} de ${gest.dias})`;
  }

  return {
    duracionDias: gest.dias,
    fechaEstimadaParto: formatFecha(fpp),
    semanaActual: semanaTexto,
    etapa,
    detalle: `${gest.nombre}: gestación de ${gest.dias} días. Cruza: ${formatFecha(fechaCruza)}. Parto estimado: ${formatFecha(fpp)}. ${diasRestantes > 0 ? `Faltan ~${diasRestantes} días.` : diasRestantes === 0 ? '¡Hoy es el día estimado!' : `La fecha estimada pasó hace ${Math.abs(diasRestantes)} días.`} ${etapa}.`,
  };
}
