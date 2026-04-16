export interface Inputs { altoCuadro: number; ubicacion?: string; }
export interface Outputs { alturaCentro: number; alturaClavo: number; regla: string; consejo: string; }
export function cuadroAlturaColgar(i: Inputs): Outputs {
  const alto = Number(i.altoCuadro); if (!alto) throw new Error('Ingresá el alto del cuadro');
  const ubi = String(i.ubicacion || 'pared_sola');
  let centro = 150; let regla = ''; let consejo = '';
  if (ubi === 'pared_sola') { centro = 150; regla = 'Regla del museo: centro del cuadro a 150 cm del piso'; consejo = 'A la altura de los ojos estando de pie. Funciona para la mayoría de las personas.'; }
  else if (ubi === 'sobre_sofa') { centro = 140; regla = '15-25 cm sobre el respaldo del sofá'; consejo = 'El borde inferior del cuadro debe quedar 15-25 cm sobre el respaldo. No centrar en la pared total.'; }
  else if (ubi === 'sobre_cama') { centro = 135; regla = '15-20 cm sobre la cabecera'; consejo = 'El cuadro debe flotar sobre la cabecera, no apoyarse. Que no sea más ancho que la cama.'; }
  else if (ubi === 'pasillo') { centro = 155; regla = 'Ligeramente más alto: centro a 155 cm'; consejo = 'En pasillos se ven caminando, por eso van un poco más altos. Para escaleras, seguí la línea de la escalera.'; }
  else { centro = 130; regla = 'Centro más bajo: 130 cm (se ve sentado)'; consejo = 'En comedores se aprecian sentados, por eso el centro baja a 130 cm.'; }
  const clavo = centro + Math.round(alto * 0.4);
  return { alturaCentro: centro, alturaClavo: clavo, regla, consejo };
}