export interface Inputs { anchoPared: number; altoPared: number; uso?: string; }
export interface Outputs { anchoEspejo: number; altoEspejo: number; alturaColgar: number; consejo: string; _insight?: any; }
export function espejoTamanoPared(i: Inputs): Outputs {
  const ap = Number(i.anchoPared); const hp = Number(i.altoPared);
  if (!ap || !hp) throw new Error('Ingresá las medidas de la pared');
  const uso = String(i.uso || 'decorativo');
  let ancho = 0, alto = 0, centroH = 0, consejo = '';
  if (uso === 'cuerpo_entero') { ancho = Math.min(Math.round(ap * 0.3), 70); alto = Math.min(180, hp - 30); centroH = Math.round(alto/2 + 15); consejo = 'Espejo cuerpo entero: el borde superior debe quedar ~15 cm sobre tu cabeza.'; }
  else if (uso === 'medio_cuerpo') { ancho = Math.min(Math.round(ap * 0.5), 90); alto = Math.min(80, 70); centroH = 145; consejo = 'Centrado a la altura de los ojos (~145 cm). Ideal sobre lavatorio.'; }
  else if (uso === 'decorativo') { ancho = Math.round(ap * 0.5); alto = Math.round(ancho * 0.75); centroH = Math.round(hp * 0.55); consejo = 'Regla del 2/3: el espejo decorativo debe ocupar entre 50-66% del ancho del mueble debajo.'; }
  else { ancho = Math.round(ap * 0.4); alto = Math.round(ancho * 1.2); centroH = 150; consejo = 'En recibidor: espejo vertical centrado da sensación de amplitud.'; }
  const usoLabel: Record<string, string> = {
    cuerpo_entero: 'cuerpo entero',
    medio_cuerpo: 'medio cuerpo',
    decorativo: 'decorativo',
  };
  const label = usoLabel[uso] || 'recibidor';
  const ocupaAncho = Math.round(ancho / ap * 100);
  const insightText = `Para tu pared de **${ap}×${hp} cm**, el espejo ${label} ideal mide **${ancho}×${alto} cm** (ocupa ~**${ocupaAncho}%** del ancho) y va colgado con el centro a **${centroH} cm** del piso. ${consejo}`;

  return {
    anchoEspejo: ancho,
    altoEspejo: alto,
    alturaColgar: centroH,
    consejo,
    _insight: {
      title: 'Medida y altura del espejo',
      text: insightText,
      tone: 'neutral',
      icon: '🪞',
    },
  };
}