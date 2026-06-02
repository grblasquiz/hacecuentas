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
  _insight?: any;
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
  const bolsas20 = Math.ceil(total / 20);
  const bolsas50 = Math.ceil(total / 50);

  const _insight = {
    title: 'Cuánto sustrato comprar',
    text: cant > 1
      ? `Para tus **${cant} macetas** vas a necesitar **${total.toFixed(1)} L** de tierra en total (ya incluye 10% extra), o sea **${bolsas20} bolsas de 20 L** (${bolsas50} de 50 L).`
      : `Esta maceta lleva **${total.toFixed(1)} L** de tierra (con 10% extra incluido): te alcanza con **${bolsas20} bolsa${bolsas20 === 1 ? '' : 's'} de 20 L**.`,
    tone: 'neutral',
    icon: '🪴',
  };

  return {
    litrosPorMaceta: Number(litros1.toFixed(1)),
    litrosTotal: Number(total.toFixed(1)),
    bolsas20L: bolsas20,
    bolsas50L: bolsas50,
    _insight,
  };
}
