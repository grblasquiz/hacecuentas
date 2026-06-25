/** Tiempo estimado para leer un libro o artículo */
export interface Inputs { cantidadPalabras: number; velocidadLectura?: string; }
export interface Outputs { minutosLectura: number; horasLectura: number; paginasEquivalentes: number; detalle: string; _table?: any; _insight?: any; }

// Math central: minutos = palabras / ppm. La usa el resultado principal Y cada fila de la tabla.
function minutosLeer(palabras: number, ppm: number): number {
  return palabras / ppm;
}

export function tiempoLectura(i: Inputs): Outputs {
  const palabras = Number(i.cantidadPalabras);
  const vel = String(i.velocidadLectura || 'normal');
  if (!palabras || palabras <= 0) throw new Error('Ingresá la cantidad de palabras');

  const ppmMap: Record<string, number> = { lento: 150, normal: 250, rapido: 350 };
  const ppm = ppmMap[vel] || 250;

  const minutos = minutosLeer(palabras, ppm);
  const horas = minutos / 60;
  const paginas = Math.round(palabras / 250);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const hs = Math.floor(horas);
  const mins = Math.round((horas - hs) * 60);
  const tiempoFmt = `${hs > 0 ? hs + ' h ' : ''}${mins} min`;
  const velLabel: Record<string, string> = { lento: 'pausado', normal: 'medio', rapido: 'veloz' };
  const ritmo = velLabel[vel] || 'medio';

  let insightText: string; let insightTone: 'good' | 'warn' | 'neutral';
  if (horas >= 5) {
    insightText = `Son **${fmt.format(palabras)} palabras** (~${paginas} páginas): a ritmo ${ritmo} (**${ppm} ppm**) te lleva unas **${tiempoFmt}**. Conviene partirlo en varias sesiones.`;
    insightTone = 'neutral';
  } else if (minutos <= 30) {
    insightText = `Lectura corta: **${fmt.format(palabras)} palabras** a **${ppm} ppm** son apenas **${tiempoFmt}**. Lo despachás en una sentada.`;
    insightTone = 'good';
  } else {
    insightText = `A ritmo ${ritmo} (**${ppm} ppm**), esas **${fmt.format(palabras)} palabras** (~${paginas} páginas) te llevan **${tiempoFmt}**. Un rato cómodo de lectura.`;
    insightTone = 'good';
  }

  const fmtTiempo = (m: number) => {
    const h = Math.floor(m / 60);
    const mn = Math.round(m - h * 60);
    return h > 0 ? `${h} h ${mn} min` : `${mn} min`;
  };

  // Velocidades derivadas del propio ppmMap del input (150/250/350) + una extra,
  // garantizando que la velocidad elegida por el usuario siempre tenga su fila.
  const velocidades: { etiqueta: string; ppm: number }[] = [
    { etiqueta: 'Lenta', ppm: ppmMap.lento },
    { etiqueta: 'Media', ppm: ppmMap.normal },
    { etiqueta: 'Rápida', ppm: ppmMap.rapido },
    { etiqueta: 'Muy rápida', ppm: 450 },
  ];

  return {
    minutosLectura: Number(minutos.toFixed(1)),
    horasLectura: Number(horas.toFixed(2)),
    paginasEquivalentes: paginas,
    detalle: `A ${ppm} palabras/min, leer ${fmt.format(palabras)} palabras te lleva ${tiempoFmt} (~${paginas} páginas).`,
    _table: {
      title: `Cuánto tardás en leer ${fmt.format(palabras)} palabras según tu velocidad`,
      headers: ['Velocidad', 'Palabras/min', 'Tiempo'],
      align: ['left', 'right', 'right'],
      rows: velocidades.map((v) => {
        const m = minutosLeer(palabras, v.ppm);
        const esTuyo = v.ppm === ppm;
        return [esTuyo ? `${v.etiqueta} (tu ritmo)` : v.etiqueta, String(v.ppm), fmtTiempo(m)];
      }),
      note: `Misma cantidad de palabras (${fmt.format(palabras)}) leída a distintas velocidades. El lector promedio ronda las 200-250 palabras/min; con técnica de lectura veloz se llega a 300-400.`,
    },
    _insight: { title: 'Tu tiempo de lectura', text: insightText, tone: insightTone, icon: '📖' },
  };
}
