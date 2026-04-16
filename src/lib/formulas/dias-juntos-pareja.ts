/** Contador de días en pareja */
export interface Inputs { fechaInicio: string; }
export interface Outputs { dias: number; horas: number; minutos: number; hitos: string; }

export function diasJuntosPareja(i: Inputs): Outputs {
  const inicio = new Date(i.fechaInicio);
  const hoy = new Date();
  if (isNaN(inicio.getTime())) throw new Error('Ingresá una fecha válida');
  if (inicio > hoy) throw new Error('La fecha debe ser anterior a hoy');

  const diffMs = hoy.getTime() - inicio.getTime();
  const dias = Math.floor(diffMs / 86400000);
  const horas = Math.floor(diffMs / 3600000);
  const minutos = Math.floor(diffMs / 60000);

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
