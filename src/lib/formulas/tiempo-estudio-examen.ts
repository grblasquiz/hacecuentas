/** Calculadora Horas de Estudio */
export interface Inputs { paginas: number; velocidadPagHora: number; dificultad: string; diasDisponibles: number; }
export interface Outputs { horasTotales: number; horasPorDia: number; repasos: string; recomendacion: string; _insight?: any; _chart?: any; }

export function tiempoEstudioExamen(i: Inputs): Outputs {
  const pag = Number(i.paginas);
  const vel = Number(i.velocidadPagHora);
  const dias = Number(i.diasDisponibles);
  if (pag <= 0) throw new Error('Las páginas deben ser mayor a 0');
  if (vel <= 0) throw new Error('La velocidad debe ser mayor a 0');
  if (dias <= 0) throw new Error('Los días deben ser mayor a 0');

  const factores: Record<string, number> = { facil: 1, media: 1.5, dificil: 2, muy_dificil: 2.5 };
  const factor = factores[i.dificultad] || 1.5;

  const horasLectura = pag / vel;
  const horasConDificultad = horasLectura * factor;
  const horasConRepaso = horasConDificultad * 1.3; // +30% repaso
  const horasPorDia = horasConRepaso / dias;

  let rec: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;
  if (horasPorDia <= 3) { rec = 'Ritmo cómodo. Tenés tiempo de sobra.'; insightTone = 'good'; insightIcon = '📖'; }
  else if (horasPorDia <= 5) { rec = 'Ritmo normal. Organizate bien y llegás.'; insightTone = 'neutral'; insightIcon = '📚'; }
  else if (horasPorDia <= 7) { rec = 'Ritmo intenso. Priorizá los temas más importantes.'; insightTone = 'warn'; insightIcon = '⏰'; }
  else { rec = 'Ritmo extremo. Considerá priorizar o pedir más tiempo.'; insightTone = 'warn'; insightIcon = '🚨'; }

  const hd = Number(horasPorDia.toFixed(1));
  const ht = Number(horasConRepaso.toFixed(1));
  const insightText = `Para cubrir **${pag} páginas** en **${dias} ${dias === 1 ? 'día' : 'días'}** necesitás **${hd} h por día** (${ht} h en total, repaso incluido). ${rec}`;

  // Gauge: ritmo diario según las mismas zonas de la recomendación
  const lastMax = Math.max(9, Math.ceil(hd + 1));

  return {
    horasTotales: ht,
    horasPorDia: hd,
    repasos: `Lectura: ${horasLectura.toFixed(1)}h + Dificultad (×${factor}): ${horasConDificultad.toFixed(1)}h + Repaso (30%): ${horasConRepaso.toFixed(1)}h total`,
    recomendacion: rec,
    _insight: { title: 'Tu ritmo diario', text: insightText, tone: insightTone, icon: insightIcon },
    _chart: {
      type: 'scale',
      marker: hd,
      markerLabel: `${hd} h/día`,
      min: 0,
      segments: [
        { nombre: 'Cómodo', max: 3, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Normal', max: 5, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Intenso', max: 7, color: '#f59e0b', colorDark: '#d97706' },
        { nombre: 'Extremo', max: lastMax, color: '#ef4444', colorDark: '#dc2626' },
      ],
      ariaLabel: `Ritmo de estudio de ${hd} horas por día sobre la escala cómodo-normal-intenso-extremo`,
    },
  };
}
