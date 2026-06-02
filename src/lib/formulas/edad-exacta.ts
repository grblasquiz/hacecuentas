/** Edad exacta en años, meses, días, horas */
export interface Inputs { fechaNacimiento: string; __lang?: string; }
export interface Outputs { resumen: string; totalDias: number; totalHoras: number; totalMinutos: number; proximoCumple: string; _insight?: any; }

export function edadExacta(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  const parts = String(i.fechaNacimiento || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error(__lang === 'en' ? 'Enter a valid date' : 'Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const nac = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  if (isNaN(nac.getTime())) throw new Error(__lang === 'en' ? 'Enter a valid date' : 'Ingresá una fecha válida');
  if (nac > hoy) throw new Error(__lang === 'en' ? 'The date must be before today' : 'La fecha debe ser anterior a hoy');

  let y = hoy.getFullYear() - nac.getFullYear();
  let m = hoy.getMonth() - nac.getMonth();
  let d = hoy.getDate() - nac.getDate();
  if (d < 0) { m--; const prev = new Date(hoy.getFullYear(), hoy.getMonth(), 0); d += prev.getDate(); }
  if (m < 0) { y--; m += 12; }

  const diffMs = hoy.getTime() - nac.getTime();
  const totalDias = Math.floor(diffMs / 86400000);
  const totalHoras = Math.floor(diffMs / 3600000);
  const totalMinutos = Math.floor(diffMs / 60000);

  const resumen = __lang === 'en'
    ? `${y} year${y!==1?'s':''}, ${m} month${m!==1?'s':''} and ${d} day${d!==1?'s':''}`
    : `${y} año${y!==1?'s':''}, ${m} mes${m!==1?'es':''} y ${d} día${d!==1?'s':''}`;

  // Próximo cumpleaños
  let proxAnio = hoy.getFullYear();
  let prox = new Date(proxAnio, nac.getMonth(), nac.getDate());
  if (prox <= hoy) { proxAnio++; prox = new Date(proxAnio, nac.getMonth(), nac.getDate()); }
  const faltanDias = Math.ceil((prox.getTime() - hoy.getTime()) / 86400000);
  const proximoCumple = __lang === 'en'
    ? `${prox.toLocaleDateString('en-US')} (${faltanDias} days away) — you turn ${y + 1}`
    : `${prox.toLocaleDateString('es-AR')} (faltan ${faltanDias} días) — cumplís ${y + 1}`;

  const _insight = {
    title: __lang === 'en' ? 'Your exact age' : 'Tu edad exacta',
    text: __lang === 'en'
      ? `You have lived **${resumen}** — that's **${totalDias.toLocaleString('en-US')} days** in total. Your next birthday is in **${faltanDias} day${faltanDias!==1?'s':''}**, when you turn **${y + 1}**.`
      : `Viviste **${resumen}** — son **${totalDias.toLocaleString('es-AR')} días** en total. Tu próximo cumpleaños es en **${faltanDias} día${faltanDias!==1?'s':''}**, cuando cumplís **${y + 1}**.`,
    tone: 'neutral',
    icon: '🎂',
  };

  return { resumen, totalDias, totalHoras, totalMinutos, proximoCumple, _insight };
}
