/** Edad exacta en años, meses, días, horas */
export interface Inputs { fechaNacimiento: string; }
export interface Outputs { resumen: string; totalDias: number; totalHoras: number; totalMinutos: number; proximoCumple: string; }

export function edadExacta(i: Inputs): Outputs {
  const nac = new Date(i.fechaNacimiento + 'T00:00:00');
  const hoy = new Date();
  if (isNaN(nac.getTime())) throw new Error('Ingresá una fecha válida');
  if (nac > hoy) throw new Error('La fecha debe ser anterior a hoy');

  let y = hoy.getFullYear() - nac.getFullYear();
  let m = hoy.getMonth() - nac.getMonth();
  let d = hoy.getDate() - nac.getDate();
  if (d < 0) { m--; const prev = new Date(hoy.getFullYear(), hoy.getMonth(), 0); d += prev.getDate(); }
  if (m < 0) { y--; m += 12; }

  const diffMs = hoy.getTime() - nac.getTime();
  const totalDias = Math.floor(diffMs / 86400000);
  const totalHoras = Math.floor(diffMs / 3600000);
  const totalMinutos = Math.floor(diffMs / 60000);

  const resumen = `${y} año${y!==1?'s':''}, ${m} mes${m!==1?'es':''} y ${d} día${d!==1?'s':''}`;

  // Próximo cumpleaños
  let proxAnio = hoy.getFullYear();
  let prox = new Date(proxAnio, nac.getMonth(), nac.getDate());
  if (prox <= hoy) { proxAnio++; prox = new Date(proxAnio, nac.getMonth(), nac.getDate()); }
  const faltanDias = Math.ceil((prox.getTime() - hoy.getTime()) / 86400000);
  const proximoCumple = `${prox.toLocaleDateString('es-AR')} (faltan ${faltanDias} días) — cumplís ${y + 1}`;

  return { resumen, totalDias, totalHoras, totalMinutos, proximoCumple };
}
