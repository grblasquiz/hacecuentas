/** Categoría ciclista (Untrained/Cat4/Cat3/Cat1/Pro) según watts/kg en FTP test */
export interface Inputs { ftpWatts: number; pesoKg: number; sexo: 'masculino' | 'femenino'; }
export interface Outputs { wattsPorKg: number; categoria: string; descripcion: string; explicacion: string; }
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
  return {
    wattsPorKg: Number(wkg.toFixed(2)),
    categoria: cat,
    descripcion: desc,
    explicacion: `${ftp} W / ${peso} kg = ${wkg.toFixed(2)} W/kg → categoría **${cat}** (${desc}). Tabla de referencia Coggan ajustada por sexo (${i.sexo}).`,
  };
}
