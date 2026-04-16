export interface Inputs { anchoPlacardCm: number; altoPlacardCm: number; profundidadCm: number; tipoUso?: string; }
export interface Outputs { zonaColgar: string; zonaEstantes: string; zonaCajones: string; distribucion: string; }
export function organizadorPlacardEspacios(i: Inputs): Outputs {
  const ancho = Number(i.anchoPlacardCm); const alto = Number(i.altoPlacardCm); const prof = Number(i.profundidadCm);
  if (!ancho || !alto || !prof) throw new Error('Ingresá las medidas del placard');
  const tipo = String(i.tipoUso || 'mixto');
  const pColgar = tipo === 'formal' ? 0.6 : tipo === 'casual' ? 0.3 : tipo === 'ninos' ? 0.25 : 0.45;
  const pEstantes = tipo === 'formal' ? 0.2 : tipo === 'casual' ? 0.4 : tipo === 'ninos' ? 0.45 : 0.3;
  const pCajones = 1 - pColgar - pEstantes;
  const cmColgar = Math.round(ancho * pColgar);
  const cmEstantes = Math.round(ancho * pEstantes);
  const cmCajones = ancho - cmColgar - cmEstantes;
  const altoBarra = tipo === 'formal' ? 120 : tipo === 'ninos' ? 80 : 100;
  return {
    zonaColgar: `${cmColgar} cm de ancho — barra a ${altoBarra} cm del piso, espacio arriba para estante superior`,
    zonaEstantes: `${cmEstantes} cm de ancho — estantes cada 30 cm para remeras, buzos, toallas dobladas`,
    zonaCajones: `${cmCajones} cm de ancho — 3-4 cajones de 15-20 cm alto para ropa interior, medias, accesorios`,
    distribucion: `Colgar: ${Math.round(pColgar*100)}% | Estantes: ${Math.round(pEstantes*100)}% | Cajones: ${Math.round(pCajones*100)}%`,
  };
}