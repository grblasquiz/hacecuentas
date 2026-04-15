/** Tamaño ideal de cucha/caseta según tamaño del perro */
export interface Inputs {
  largoPerro: number;
  alturaPerro: number;
}
export interface Outputs {
  anchoCucha: number;
  largoCucha: number;
  altoCucha: number;
  tamanoAbertura: string;
  detalle: string;
}

export function tamanoCuchaPerro(i: Inputs): Outputs {
  const largo = Number(i.largoPerro);
  const altura = Number(i.alturaPerro);

  if (!largo || largo <= 0) throw new Error('Ingresá el largo de tu perro');
  if (!altura || altura <= 0) throw new Error('Ingresá la altura de tu perro');

  // Fórmulas estándar de diseño de cuchas
  const largoCucha = Math.round(largo * 1.25);
  const anchoCucha = Math.round(largo * 0.85);
  const altoCucha = Math.round(altura * 1.25);

  // Abertura
  const anchoAbertura = Math.round(altura * 0.50);
  const altoAbertura = Math.round(altura * 0.80);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    anchoCucha,
    largoCucha,
    altoCucha,
    tamanoAbertura: `${fmt.format(anchoAbertura)} × ${fmt.format(altoAbertura)} cm`,
    detalle: `Para un perro de ${fmt.format(largo)} cm de largo y ${fmt.format(altura)} cm de alto: cucha de ${fmt.format(largoCucha)} × ${fmt.format(anchoCucha)} × ${fmt.format(altoCucha)} cm (L×A×H). Abertura: ${fmt.format(anchoAbertura)} × ${fmt.format(altoAbertura)} cm.`,
  };
}
