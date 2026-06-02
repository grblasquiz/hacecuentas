export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function ifeIngresoFamiliarEmergenciaHistoria(i: Inputs): Outputs {
  const c=String(i.consulta||'monto');
  const info: Record<string,string> = {
    monto:'$10.000 cada pago × 3 pagos (2020)',
    requisitos:'Desempleo formal, monotributo A/B/C, informales, casas particulares',
    liquidacion:'Mayo-Julio-Octubre 2020'
  };
  const insightText: Record<string,string> = {
    monto:'El IFE fueron **$10.000 por pago**, en **3 tandas** durante 2020. Es un dato **histórico**: el beneficio ya no está vigente.',
    requisitos:'Cubría **desempleados formales, monotributistas A/B/C, trabajadores informales y de casas particulares**. Programa **cerrado**, no se puede gestionar hoy.',
    liquidacion:'Se liquidó en **mayo, julio y octubre de 2020**. Fue un beneficio **excepcional por la pandemia**, no se reedita con estas reglas.',
  };
  const insight = {
    title: 'IFE: un beneficio histórico (2020)',
    text: insightText[c] || 'El IFE fue un beneficio excepcional de 2020 y **ya no está vigente**.',
    tone: 'neutral',
    icon: '🗂️',
  };
  return { info:info[c]||'Info no disponible', resumen:`IFE ${c}: ${info[c]||'—'}.`, _insight: insight };
}
