/** Categoría ciclista (Untrained/Cat4/Cat3/Cat1/Pro) según watts/kg en FTP test */
export interface Inputs { ftpWatts: number; pesoKg: number; sexo: 'masculino' | 'femenino'; }
export interface Outputs { wattsPorKg: number; categoria: string; descripcion: string; explicacion: string; _insight?: any; _chart?: any; }
export function ciclismoPowerWKgCategoriaFtp(i: Inputs): Outputs {
  const ftp = Number(i.ftpWatts);
  const peso = Number(i.pesoKg);
  if (!ftp || ftp <= 0) throw new Error('Ingresá FTP en watts');
  if (!peso || peso <= 0) throw new Error('Ingresá peso en kg');
  const wkg = ftp / peso;
  // Tabla Coggan (clásica) ajustada por sexo
  const tablaM = [
    [5.05, 'World Class', 'Profesional World Tour'],
    [4.55, 'Excelente', 'Cat 1 / Pro Continental'],
    [4.10, 'Muy bueno', 'Cat 2'],
    [3.65, 'Bueno', 'Cat 3'],
    [3.20, 'Moderado', 'Cat 4'],
    [2.40, 'Recreativo', 'Cat 5 / aficionado fit'],
    [0, 'Untrained', 'Sedentario / sin entrenamiento'],
  ] as const;
  const tablaF = [
    [4.30, 'World Class', 'Profesional UCI WWT'],
    [3.85, 'Excelente', 'Elite nacional'],
    [3.50, 'Muy bueno', 'Master competitiva'],
    [3.05, 'Bueno', 'Cat 3 femenina'],
    [2.65, 'Moderado', 'Cat 4 femenina'],
    [2.05, 'Recreativo', 'Aficionada fit'],
    [0, 'Untrained', 'Sedentaria / sin entrenamiento'],
  ] as const;
  const tabla = i.sexo === 'femenino' ? tablaF : tablaM;
  let cat = 'Untrained', desc = '';
  for (const [umbral, nombre, descripcion] of tabla) {
    if (wkg >= (umbral as number)) { cat = nombre as string; desc = descripcion as string; break; }
  }

  // Gauge: zonas ascendentes de W/kg derivadas de la tabla (umbral = piso de cada categoría)
  const asc = [...tabla].reverse(); // de menor a mayor umbral
  const palette = ['#94a3b8', '#60a5fa', '#22d3ee', '#34d399', '#a3e635', '#f59e0b', '#dc2626'];
  const paletteDark = ['#cbd5e1', '#93c5fd', '#67e8f9', '#6ee7b7', '#bef264', '#fbbf24', '#ef4444'];
  const segments = asc.map((row, idx) => {
    const nombre = row[1] as string;
    const next = asc[idx + 1];
    const rawMax = next ? (next[0] as number) : Math.max(wkg + 0.5, (row[0] as number) + 0.6);
    return {
      nombre,
      max: idx === asc.length - 1 ? Math.max(rawMax, wkg + 0.3) : rawMax,
      color: palette[idx % palette.length],
      colorDark: paletteDark[idx % paletteDark.length],
    };
  });

  const esCompetitivo = wkg >= (i.sexo === 'femenino' ? 3.05 : 3.65);
  return {
    wattsPorKg: Number(wkg.toFixed(2)),
    categoria: cat,
    descripcion: desc,
    explicacion: `${ftp} W / ${peso} kg = ${wkg.toFixed(2)} W/kg → categoría **${cat}** (${desc}). Tabla de referencia Coggan ajustada por sexo (${i.sexo}).`,
    _insight: {
      title: `Nivel: ${cat}`,
      text: `Con **${ftp} W** de FTP y **${peso} kg** das **${wkg.toFixed(2)} W/kg**, que te ubica en **${cat}** (${desc}) según la tabla Coggan ${i.sexo === 'femenino' ? 'femenina' : 'masculina'}. Bajar peso o subir el FTP te corre de categoría.`,
      tone: esCompetitivo ? 'good' : 'neutral',
      icon: '🚴',
    },
    _chart: {
      type: 'scale',
      marker: Number(wkg.toFixed(2)),
      markerLabel: `${wkg.toFixed(2)} W/kg`,
      min: 0,
      segments,
      ariaLabel: `Relación potencia-peso de ${wkg.toFixed(2)} vatios por kilo, categoría ${cat} en la escala Coggan`,
    },
  };
}
