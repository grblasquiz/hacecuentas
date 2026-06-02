/**
 * Calculadora de Fecha de Parto de Perra - Gestación 63 días
 */
export interface GestacionPerraInputs { fechaMonta: string; tamano: string; }
export interface GestacionPerraOutputs { fechaPartoEstimada: string; rangoFechas: string; semanaGestacion: string; diasRestantes: string; _insight?: any; _chart?: any; }

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
  hoy.setHours(0, 0, 0, 0);
  const diasTranscurridos = Math.round((hoy.getTime() - fechaMonta.getTime()) / (1000 * 60 * 60 * 24));
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

  let _tone: 'good' | 'warn' | 'neutral' = 'neutral';
  let _text = '';
  if (diasTranscurridos < 0) {
    _tone = 'neutral';
    _text = `La monta es a futuro. Si se concreta, el parto caería alrededor del **${fmtDate(fechaParto)}** (rango normal de 58 a 68 días).`;
  } else if (diasTranscurridos > 68) {
    _tone = 'warn';
    _text = `Ya pasaron **${diasTranscurridos} días** desde la monta y se superó el rango normal de parto. Consultá al veterinario cuanto antes.`;
  } else if (diasTranscurridos >= 47) {
    _tone = 'warn';
    _text = `Última semana: tu perra va por la **semana ${semana} de 9** y faltan **~${Math.max(diasRestantes, 0)} días**. Preparale un lugar tranquilo para parir y tené el veterinario a mano.`;
  } else {
    _tone = 'good';
    _text = `Van **${diasTranscurridos} de ~63 días** (semana ${semana} de 9). El parto estimado es el **${fmtDate(fechaParto)}**, faltan ~${diasRestantes} días.`;
  }
  const _insight = { title: 'Cómo viene la gestación', text: _text, tone: _tone, icon: '🐶' };

  const _marker = Math.min(Math.max(diasTranscurridos, 0), 63);
  const _chart = {
    type: 'scale',
    marker: _marker,
    markerLabel: diasTranscurridos < 0 ? 'Sin comenzar' : `Día ${Math.min(diasTranscurridos, 63)}`,
    min: 0,
    segments: [
      { nombre: 'Implantación', max: 21, color: '#bae6fd', colorDark: '#0ea5e9' },
      { nombre: 'Embrionaria', max: 35, color: '#7dd3fc', colorDark: '#0284c7' },
      { nombre: 'Fetal', max: 47, color: '#fbbf24', colorDark: '#f59e0b' },
      { nombre: 'Parto', max: 64, color: '#fb923c', colorDark: '#ea580c' },
    ],
    ariaLabel: `Progreso de gestación canina: día ${_marker} de 63`,
  };

  return {
    fechaPartoEstimada: fmtDate(fechaParto),
    rangoFechas: `Entre ${fmtDate(rangoMin)} y ${fmtDate(rangoMax)}`,
    semanaGestacion,
    diasRestantes: diasRestantes > 0 ? `${diasRestantes} días` : diasRestantes === 0 ? '¡Hoy es el día estimado!' : `Pasaron ${Math.abs(diasRestantes)} días de la fecha estimada`,
    _insight,
    _chart,
  };
}
