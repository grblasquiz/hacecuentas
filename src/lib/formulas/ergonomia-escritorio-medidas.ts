/** Ergonomía de escritorio - medidas ideales */
export interface Inputs { estatura: number; }
export interface Outputs { alturaSilla: number; alturaEscritorio: number; alturaMonitor: number; distanciaMonitor: string; mensaje: string; _insight?: any; }

export function ergonomiaEscritorioMedidas(i: Inputs): Outputs {
  const estatura = Number(i.estatura);
  if (!estatura || estatura < 140) throw new Error('Ingresá tu estatura');

  // Seat height: ~25% of stature (popliteal height)
  const alturaSilla = Math.round(estatura * 0.25);
  // Desk height: elbow height seated (seat + upper leg + lower arm ≈ seat + 25-28cm)
  const alturaEscritorio = Math.round(alturaSilla + estatura * 0.16);
  // Monitor top: eye height seated ≈ seat height + torso + head to eye
  const alturaMonitor = Math.round(alturaSilla + estatura * 0.36);
  // Distance: arm's length, ~50-70 cm
  const distanciaMonitor = `${Math.round(estatura * 0.32)}-${Math.round(estatura * 0.38)} cm (un brazo de distancia)`;

  const _insight = {
    title: 'Tu puesto a medida',
    text: `Para tus **${estatura} cm**, regulá la silla a **${alturaSilla} cm** y el escritorio a **${alturaEscritorio} cm**, con los codos a ~90°. El borde superior del monitor va a **${alturaMonitor} cm** del piso (a la altura de los ojos) y a **${distanciaMonitor}**.`,
    tone: 'good',
    icon: '🪑',
  };

  return {
    alturaSilla,
    alturaEscritorio,
    alturaMonitor,
    distanciaMonitor,
    mensaje: `Silla: ${alturaSilla} cm. Escritorio: ${alturaEscritorio} cm. Monitor (borde superior): ${alturaMonitor} cm desde el piso. Distancia: ${distanciaMonitor}.`,
    _insight
  };
}