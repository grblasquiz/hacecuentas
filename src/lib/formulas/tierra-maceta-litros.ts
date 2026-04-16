/** Tierra para maceta: volumen en litros */
export interface Inputs {
  forma: string;
  diametro?: number;
  largo?: number;
  ancho?: number;
  alto: number;
  cantidad: number;
}
export interface Outputs {
  litrosPorMaceta: number;
  litrosTotal: number;
  bolsas20L: number;
  bolsas50L: number;
}

export function tierraMacetaLitros(i: Inputs): Outputs {
  const forma = String(i.forma || 'redonda');
  const alto = Number(i.alto);
  const cant = Number(i.cantidad) || 1;
  if (!alto || alto <= 0) throw new Error('Ingresá la profundidad de la maceta');

  let volumenCm3 = 0;
  if (forma === 'redonda') {
    const d = Number(i.diametro);
    if (!d || d <= 0) throw new Error('Ingresá el diámetro de la maceta');
    const r = d / 2;
    volumenCm3 = Math.PI * r * r * alto;
  } else if (forma === 'cuadrada') {
    const lado = Number(i.largo);
    if (!lado || lado <= 0) throw new Error('Ingresá el lado de la maceta');
    volumenCm3 = lado * lado * alto;
  } else {
    const largo = Number(i.largo);
    const ancho = Number(i.ancho);
    if (!largo || largo <= 0 || !ancho || ancho <= 0) throw new Error('Ingresá largo y ancho');
    volumenCm3 = largo * ancho * alto;
  }

  const litros1 = volumenCm3 / 1000;
  const litrosConExtra = litros1 * 1.1;
  const total = litrosConExtra * cant;

  return {
    litrosPorMaceta: Number(litros1.toFixed(1)),
    litrosTotal: Number(total.toFixed(1)),
    bolsas20L: Math.ceil(total / 20),
    bolsas50L: Math.ceil(total / 50),
  };
}
