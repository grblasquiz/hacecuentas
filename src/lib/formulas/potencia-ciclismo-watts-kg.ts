/** Calculadora watts/kg y zonas de potencia ciclismo */
export interface Inputs {
  ftp: number;
  peso: number;
}
export interface Outputs {
  wattsKg: number;
  nivel: string;
  z1: string;
  z2: string;
  z3: string;
  z4: string;
  z5: string;
  z6: string;
  mensaje: string;
}

export function potenciaCiclismoWattsKg(i: Inputs): Outputs {
  const ftp = Number(i.ftp);
  const peso = Number(i.peso);
  if (!ftp || ftp <= 0) throw new Error('Ingresá tu FTP');
  if (!peso || peso <= 0) throw new Error('Ingresá tu peso');

  const wattsKg = Number((ftp / peso).toFixed(2));

  let nivel: string;
  if (wattsKg < 2.0) nivel = 'Principiante';
  else if (wattsKg < 2.5) nivel = 'Recreativo';
  else if (wattsKg < 3.0) nivel = 'Intermedio';
  else if (wattsKg < 3.7) nivel = 'Avanzado recreativo';
  else if (wattsKg < 4.5) nivel = 'Competitivo amateur';
  else if (wattsKg < 5.5) nivel = 'Élite / Cat 1-2';
  else nivel = 'Profesional / World Tour';

  // Coggan power zones (% of FTP)
  const z1 = `<${Math.round(ftp * 0.55)} W (<55% FTP) — Recuperación activa`;
  const z2 = `${Math.round(ftp * 0.56)}-${Math.round(ftp * 0.75)} W (56-75%) — Resistencia`;
  const z3 = `${Math.round(ftp * 0.76)}-${Math.round(ftp * 0.90)} W (76-90%) — Tempo`;
  const z4 = `${Math.round(ftp * 0.91)}-${Math.round(ftp * 1.05)} W (91-105%) — Umbral`;
  const z5 = `${Math.round(ftp * 1.06)}-${Math.round(ftp * 1.20)} W (106-120%) — VO2max`;
  const z6 = `${Math.round(ftp * 1.21)}-${Math.round(ftp * 1.50)} W (121-150%) — Anaeróbica`;

  return {
    wattsKg,
    nivel,
    z1, z2, z3, z4, z5, z6,
    mensaje: `FTP: ${ftp}W / ${peso}kg = ${wattsKg} W/kg. Nivel: ${nivel}.`
  };
}