/** Agua diaria para periquitos: ml por día según cantidad, clima, dieta y cría. */
export interface Inputs {
  cantidad?: number;
  climaCalido?: boolean;
  criando?: boolean;
  dieta?: string;
}
export interface Outputs {
  aguaDiaMl: number;
  aguaPorAve: number;
  cambioAguaHoras: string;
  bebederoSugerido: string;
  senalesDeshidratacion: string;
}

export function aguaPeriquitoDiaria(i: Inputs): Outputs {
  const cant = Math.max(1, Math.round(Number(i.cantidad ?? 1)));
  const calor = i.climaCalido === true;
  const criando = i.criando === true;
  const dieta = String(i.dieta || 'mix');

  // Base por ave en ml/día
  let porAve = 7;

  // Dieta afecta consumo
  if (dieta === 'mix') porAve = 8;         // solo semillas secas
  else if (dieta === 'mixto') porAve = 6;   // verduras aportan agua
  else if (dieta === 'pellet') porAve = 7;

  if (calor) porAve *= 1.5;
  if (criando) porAve *= 1.8;

  const total = porAve * cant;

  const cambio = calor || criando ? 'cada 12 horas (2 veces al día)' : 'cada 24 horas';

  const bebedero = cant <= 2
    ? 'Bebedero de tubo de 60-80 ml + plato ancho opcional para baño'
    : 'Bebedero de tubo 120+ ml y plato ancho grande aparte';

  const senales = 'Plumas erizadas, ojos hundidos, letargo, heces muy secas, piel arrugada en patas. Es emergencia.';

  return {
    aguaDiaMl: Math.round(total * 10) / 10,
    aguaPorAve: Math.round(porAve * 10) / 10,
    cambioAguaHoras: cambio,
    bebederoSugerido: bebedero,
    senalesDeshidratacion: senales,
  };
}
