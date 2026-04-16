/** Cortina: medida según ventana */
export interface Inputs { anchoVentana: number; altoVentana: number; alturaBarral: number; estilo?: string; pliegue?: string; }
export interface Outputs { anchoTelaTotal: number; largoTela: number; metrosTela: number; anchoPorPano: number; }

export function cortinaMedidaVentana(i: Inputs): Outputs {
  const ancho = Number(i.anchoVentana);
  const altoVent = Number(i.altoVentana);
  const altBarral = Number(i.alturaBarral);
  if (!ancho || !altBarral) throw new Error('Ingresá las medidas');
  const estilo = String(i.estilo || 'piso');
  const factor = Number(i.pliegue) || 1.5;

  const anchoBarral = ancho + 40; // 20cm extra cada lado
  const anchoTela = Math.round(anchoBarral * factor);
  const DOBLADILLO = 25; // 10 arriba + 15 abajo

  let largo = 0;
  if (estilo === 'marco') largo = altoVent + 20; // 10cm arriba + 10 abajo del marco
  else if (estilo === 'piso') largo = altBarral - 1;
  else largo = altBarral + 15; // pooling

  const largoTela = largo + DOBLADILLO;
  const anchoPorPano = Math.round(anchoTela / 2);
  const anchoRollo = 150; // tela estándar 150cm
  const panosNecesarios = Math.ceil(anchoTela / anchoRollo);
  const metrosTela = (largoTela / 100) * panosNecesarios;

  return {
    anchoTelaTotal: anchoTela,
    largoTela: largoTela,
    metrosTela: Number(metrosTela.toFixed(1)),
    anchoPorPano: anchoPorPano,
  };
}
