/** Aniversario de pareja — tiempo juntos */
export interface Inputs { fechaInicio: string; }
export interface Outputs { resumen: string; totalDias: number; totalSemanas: number; totalHoras: number; finesDeSemana: number; proximoHito: string; }

export function aniversarioPareja(i: Inputs): Outputs {
  const inicio = new Date(i.fechaInicio + 'T00:00:00');
  const hoy = new Date();
  if (isNaN(inicio.getTime())) throw new Error('Ingresá una fecha válida');
  if (inicio > hoy) throw new Error('La fecha debe ser anterior a hoy');

  const diffMs = hoy.getTime() - inicio.getTime();
  const totalDias = Math.floor(diffMs / 86400000);
  const totalSemanas = Math.floor(totalDias / 7);
  const totalHoras = Math.floor(diffMs / 3600000);
  const finesDeSemana = totalSemanas;

  // Calc years, months, days
  let y = hoy.getFullYear() - inicio.getFullYear();
  let m = hoy.getMonth() - inicio.getMonth();
  let d = hoy.getDate() - inicio.getDate();
  if (d < 0) { m--; const prev = new Date(hoy.getFullYear(), hoy.getMonth(), 0); d += prev.getDate(); }
  if (m < 0) { y--; m += 12; }

  const resumen = y > 0
    ? `${y} año${y > 1 ? 's' : ''}, ${m} mes${m !== 1 ? 'es' : ''} y ${d} día${d !== 1 ? 's' : ''}`
    : m > 0
    ? `${m} mes${m !== 1 ? 'es' : ''} y ${d} día${d !== 1 ? 's' : ''}`
    : `${d} día${d !== 1 ? 's' : ''}`;

  // Next milestone
  const hitos = [100, 200, 365, 500, 1000, 1500, 2000, 2500, 3000, 5000, 7500, 10000];
  let proximoHito = 'Ya pasaron todos los hitos principales. ¡Increíble!';
  for (const h of hitos) {
    if (totalDias < h) {
      const fechaHito = new Date(inicio.getTime() + h * 86400000);
      const faltan = h - totalDias;
      proximoHito = `${h} días juntos: ${fechaHito.toLocaleDateString('es-AR')} (faltan ${faltan} días)`;
      break;
    }
  }

  return { resumen, totalDias, totalSemanas, totalHoras, finesDeSemana, proximoHito };
}
