/** Calculadora de Almacenamiento para Juegos */
export interface Inputs {
  juegosAAA: number;
  juegosIndie: number;
  juegosMMO: number;
  gbSistema: number;
}
export interface Outputs {
  totalGb: number;
  totalTb: number;
  ssdRecomendado: string;
  mensaje: string;
}

export function almacenamientoJuegosGb(i: Inputs): Outputs {
  const aaa = Number(i.juegosAAA) || 0;
  const indie = Number(i.juegosIndie) || 0;
  const mmo = Number(i.juegosMMO) || 0;
  const sistema = Number(i.gbSistema) || 100;

  if (aaa < 0 || indie < 0 || mmo < 0) throw new Error('Las cantidades no pueden ser negativas');
  if (aaa + indie + mmo === 0) throw new Error('Ingresá al menos un juego');

  // Average sizes (2026)
  const gbAAA = aaa * 85;
  const gbIndie = indie * 6;
  const gbMMO = mmo * 65;
  const gbJuegos = gbAAA + gbIndie + gbMMO;
  const totalGb = gbJuegos + sistema;
  const totalConMargen = Math.ceil(totalGb * 1.1); // 10% free space recommended
  const totalTb = totalConMargen / 1000;

  let ssdRecomendado: string;
  if (totalConMargen <= 500) ssdRecomendado = 'SSD de 512 GB — suficiente para tu biblioteca actual.';
  else if (totalConMargen <= 1000) ssdRecomendado = 'SSD de 1 TB — el más popular para gaming.';
  else if (totalConMargen <= 2000) ssdRecomendado = 'SSD de 2 TB — ideal para bibliotecas grandes.';
  else ssdRecomendado = `SSD de ${Math.ceil(totalTb)} TB o combo 2 TB + 2 TB para tu biblioteca masiva.`;

  return {
    totalGb: totalConMargen,
    totalTb: Number(totalTb.toFixed(2)),
    ssdRecomendado,
    mensaje: `Juegos AAA: ${gbAAA} GB, Indie: ${gbIndie} GB, MMO: ${gbMMO} GB. Total juegos: ${gbJuegos} GB + ${sistema} GB sistema + 10% margen = ${totalConMargen} GB.`,
  };
}
