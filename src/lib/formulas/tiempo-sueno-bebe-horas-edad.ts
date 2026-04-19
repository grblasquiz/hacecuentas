export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function tiempoSuenoBebeHorasEdad(i: Inputs): Outputs {
  const m=Number(i.edadMeses)||0;
  let tot=14, n=10, s='2-3 siestas';
  if (m<3) { tot=16; n=9; s='4-5 siestas cortas'; }
  else if (m<12) { tot=14; n=11; s='2-3 siestas'; }
  else if (m<24) { tot=13; n=11; s='1-2 siestas'; }
  else if (m<60) { tot=11; n=10; s='1 siesta o sin'; }
  else { tot=10; n=10; s='Sin siesta'; }
  return { horasTotales:tot+'h', noche:n+'h', siestas:s, resumen:`${m} meses: ${tot}h total, ${n}h noche, ${s}.` };
}
