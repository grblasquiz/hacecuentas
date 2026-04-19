export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ifeIngresoFamiliarEmergenciaHistoria(i: Inputs): Outputs {
  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'$10.000 cada pago × 3 pagos (2020)',
    requisitos:'Desempleo formal, monotributo A/B/C, informales, casas particulares',
    liquidacion:'Mayo-Julio-Octubre 2020'
  };
  return { info:info[c]||'Info no disponible', resumen:`IFE ${c}: ${info[c]||'—'}.` };
}
