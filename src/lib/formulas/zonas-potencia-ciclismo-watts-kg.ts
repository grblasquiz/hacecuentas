export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function zonasPotenciaCiclismoWattsKg(i: Inputs): Outputs {
  const ftp = Number(i.ftp) || 0; const peso = Number(i.peso) || 70;
  const z = (p: number) => Math.round(ftp * p);
  const zonas = `Z1 <${z(0.55)} | Z2 ${z(0.55)}-${z(0.75)} | Z3 ${z(0.76)}-${z(0.9)} | Z4 ${z(0.91)}-${z(1.05)} | Z5 ${z(1.06)}-${z(1.2)} | Z6 >${z(1.2)}`;
  return { zonas, ftpWKg: (ftp/peso).toFixed(2) + ' W/kg', resumen: `FTP ${ftp}W = ${(ftp/peso).toFixed(1)} W/kg. Zonas Coggan calculadas.` };
}
