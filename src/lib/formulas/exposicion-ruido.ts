/** Tiempo máximo de exposición segura a ruido (NIOSH) */
export interface Inputs { nivelDecibeles: number; }
export interface Outputs { tiempoMaximoSeguro: string; nivelRiesgo: string; equivalente: string; detalle: string; _insight?: any; _chart?: any; }

export function exposicionRuido(i: Inputs): Outputs {
  const dB = Number(i.nivelDecibeles);
  if (isNaN(dB) || dB < 0) throw new Error('Ingresá un nivel de decibeles válido');

  // Equivalentes sonoros
  const equivalentes: [number, number, string][] = [
    [0, 30, 'Susurro, habitación silenciosa'],
    [30, 50, 'Biblioteca, oficina tranquila'],
    [50, 60, 'Conversación normal'],
    [60, 70, 'Restaurante, oficina ruidosa'],
    [70, 80, 'Aspiradora, tránsito urbano'],
    [80, 85, 'Tránsito pesado, despertador'],
    [85, 90, 'Cortadora de césped, secador de pelo'],
    [90, 100, 'Moto, licuadora industrial'],
    [100, 110, 'Recital de rock, motosierra'],
    [110, 120, 'Estadio de fútbol, sirena'],
    [120, 200, 'Despegue de avión, umbral de dolor'],
  ];

  let equiv = 'Fuera de rango';
  for (const [min, max, desc] of equivalentes) {
    if (dB >= min && dB < max) { equiv = desc; break; }
  }

  // Tiempo seguro NIOSH: T = 480 / 2^((dB-85)/3)
  let tiempoMin: number;
  let tiempoStr: string;
  let riesgo: string;

  if (dB < 70) {
    tiempoStr = 'Sin límite';
    riesgo = 'Sin riesgo';
  } else if (dB < 85) {
    tiempoMin = 480 / Math.pow(2, (dB - 85) / 3);
    tiempoStr = `~${Math.round(tiempoMin / 60)} horas`;
    riesgo = 'Bajo';
  } else {
    tiempoMin = 480 / Math.pow(2, (dB - 85) / 3);
    if (tiempoMin >= 60) {
      const hs = Math.floor(tiempoMin / 60);
      const mins = Math.round(tiempoMin % 60);
      tiempoStr = mins > 0 ? `${hs} h ${mins} min` : `${hs} h`;
    } else if (tiempoMin >= 1) {
      tiempoStr = `${tiempoMin.toFixed(1)} minutos`;
    } else {
      tiempoStr = `${(tiempoMin * 60).toFixed(0)} segundos`;
    }

    if (dB <= 90) riesgo = 'Moderado — usar protección en exposiciones prolongadas';
    else if (dB <= 100) riesgo = 'Alto — protección auditiva recomendada';
    else if (dB <= 110) riesgo = 'Muy alto — protección obligatoria';
    else riesgo = 'Severo — daño inmediato posible';
  }

  const tone = dB >= 85 ? 'warn' : dB >= 70 ? 'neutral' : 'good';

  return {
    tiempoMaximoSeguro: tiempoStr,
    nivelRiesgo: riesgo,
    equivalente: equiv,
    detalle: `A ${dB} dB (${equiv}), el tiempo máximo de exposición segura es de ${tiempoStr}. Nivel de riesgo: ${riesgo}.`,
    _insight: {
      title: 'Tu exposición al ruido',
      text: dB < 70
        ? `A **${dB} dB** (${equiv}) estás en zona segura: podés exponerte **sin límite** sin riesgo auditivo.`
        : dB < 85
          ? `A **${dB} dB** (${equiv}) el riesgo es bajo, pero el límite seguro baja a **${tiempoStr}**. Recién a 85 dB el daño se vuelve acumulativo.`
          : `A **${dB} dB** (${equiv}) cada salto de 3 dB corta el tiempo seguro a la mitad: solo **${tiempoStr}** sin protección. ${riesgo}.`,
      tone,
      icon: dB >= 100 ? '🔇' : dB >= 85 ? '🎧' : '🔊',
    },
    _chart: {
      type: 'scale',
      marker: dB,
      markerLabel: `${dB} dB`,
      min: 0,
      segments: [
        { nombre: 'Seguro', max: 70, color: '#22c55e', colorDark: '#16a34a' },
        { nombre: 'Bajo', max: 85, color: '#84cc16', colorDark: '#65a30d' },
        { nombre: 'Moderado', max: 90, color: '#eab308', colorDark: '#ca8a04' },
        { nombre: 'Alto', max: 100, color: '#f97316', colorDark: '#ea580c' },
        { nombre: 'Muy alto', max: 110, color: '#ef4444', colorDark: '#dc2626' },
        { nombre: 'Severo', max: Math.max(120, Math.ceil(dB) + 5), color: '#b91c1c', colorDark: '#991b1b' },
      ],
      ariaLabel: `Nivel sonoro de ${dB} dB sobre una escala de riesgo auditivo de 0 a 120+ dB.`,
    },
  };
}
