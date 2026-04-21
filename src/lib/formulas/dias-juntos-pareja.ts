/** Contador de días en pareja */
export interface Inputs { fechaInicio: string; }
export interface Outputs { dias: number; horas: number; minutos: number; hitos: string; }

export function diasJuntosPareja(i: Inputs): Outputs {
  const parts = String(i.fechaInicio || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const inicio = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(inicio.getTime())) throw new Error('Ingresá una fecha válida');
  if (inicio > hoy) throw new Error('La fecha debe ser anterior a hoy');

  const diffMs = hoy.getTime() - inicio.getTime();
  const dias = Math.round(diffMs / 86400000);
  const horas = dias * 24;
  const minutos = dias * 24 * 60;

  const hitosArr = [100, 200, 365, 500, 730, 1000, 1500, 2000, 3000, 5000, 10000];
  const hitosTexto = hitosArr.map(h => {
    if (dias >= h) {
      return `✓ ${h} días — ¡cumplido!`;
    } else {
      const fechaHito = new Date(inicio.getTime() + h * 86400000);
      const faltan = h - dias;
      return `○ ${h} días — ${fechaHito.toLocaleDateString('es-AR')} (faltan ${faltan} días)`;
    }
  }).join('\n');

  return { dias, horas, minutos, hitos: hitosTexto };
}
