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
  _insight?: any;
  _chart?: any;
}

export function gestacionAnimal(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const fechaStr = String(i.fechaCruza);

  if (!fechaStr) throw new Error('Ingresá la fecha de cruza');

  const parts = String(fechaStr || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida');
  const [yy, mm, dd] = parts;
  const fechaCruza = new Date(yy, mm - 1, dd);
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
  const fpp = new Date(fechaCruza.getTime());
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

  let _tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let _text = '';
  if (diasTranscurridos < 0) {
    _tone = 'neutral';
    _text = `La cruza de tu **${gest.nombre.toLowerCase()}** es a futuro. Si se concreta, el parto caería alrededor del **${formatFecha(fpp)}**, tras ${gest.dias} días de gestación.`;
  } else if (diasRestantes < 0) {
    _tone = 'warn';
    _text = `La fecha estimada de parto pasó hace **${Math.abs(diasRestantes)} días**. Si tu **${gest.nombre.toLowerCase()}** todavía no parió, consultá al veterinario.`;
  } else if (porcentaje >= 0.75) {
    _tone = 'warn';
    _text = `Recta final: faltan **~${diasRestantes} días** para el parto estimado (**${formatFecha(fpp)}**). Preparale un nido tranquilo y tené el contacto del veterinario a mano.`;
  } else {
    _tone = 'good';
    _text = `Van **${diasTranscurridos} de ${gest.dias} días** de gestación (${etapa.toLowerCase()}). El parto estimado es el **${formatFecha(fpp)}**, faltan ~${diasRestantes} días.`;
  }
  const _insight = { title: 'En qué etapa va', text: _text, tone: _tone, icon: '🐾' };

  const _markerRaw = diasTranscurridos < 0 ? 0 : diasTranscurridos;
  const _marker = Math.min(_markerRaw, gest.dias);
  const _chart = {
    type: 'scale',
    marker: _marker,
    markerLabel: diasTranscurridos < 0 ? 'Sin comenzar' : `Día ${Math.min(diasTranscurridos, gest.dias)}`,
    min: 0,
    segments: [
      { nombre: 'Inicial', max: Math.round(gest.dias * 0.25), color: '#bae6fd', colorDark: '#0ea5e9' },
      { nombre: 'Embrionaria', max: Math.round(gest.dias * 0.5), color: '#7dd3fc', colorDark: '#0284c7' },
      { nombre: 'Fetal', max: Math.round(gest.dias * 0.75), color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Final', max: gest.dias + 1, color: '#fb923c', colorDark: '#ea580c' },
    ],
    ariaLabel: `Progreso de gestación: día ${Math.min(Math.max(diasTranscurridos, 0), gest.dias)} de ${gest.dias}`,
  };

  return {
    duracionDias: gest.dias,
    fechaEstimadaParto: formatFecha(fpp),
    semanaActual: semanaTexto,
    etapa,
    detalle: `${gest.nombre}: gestación de ${gest.dias} días. Cruza: ${formatFecha(fechaCruza)}. Parto estimado: ${formatFecha(fpp)}. ${diasRestantes > 0 ? `Faltan ~${diasRestantes} días.` : diasRestantes === 0 ? '¡Hoy es el día estimado!' : `La fecha estimada pasó hace ${Math.abs(diasRestantes)} días.`} ${etapa}.`,
    _insight,
    _chart,
  };
}
