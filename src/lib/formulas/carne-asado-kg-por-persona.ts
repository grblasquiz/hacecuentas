/** Calculadora de carne para asado por persona */
export interface Inputs {
  adultos: number;
  menores?: number;
  tipoEvento?: string;
  hayEntrada?: string;
  incluirAchuras?: string;
}
export interface Outputs {
  kgCarne: number;
  kgAchuras: number;
  cantidadChorizos: number;
  cantidadMorcillas: number;
  detalle: string;
}

export function carneAsadoKgPorPersona(i: Inputs): Outputs {
  const adultos = Number(i.adultos);
  const menores = Number(i.menores) || 0;
  const evento = i.tipoEvento || 'almuerzo';
  const hayEntrada = i.hayEntrada === 'si';
  const conAchuras = i.incluirAchuras !== 'no';

  if (!adultos || adultos <= 0) throw new Error('Ingresá la cantidad de adultos');

  // Gramos por adulto según contexto
  let gramosPorAdulto = 500;
  if (evento === 'cena') gramosPorAdulto = 450;
  if (evento === 'evento_largo') gramosPorAdulto = 380;
  if (hayEntrada) gramosPorAdulto -= 80;

  const gramosPorMenor = 220;

  const kgCarneBruto = (adultos * gramosPorAdulto + menores * gramosPorMenor) / 1000;
  const kgCarne = Math.ceil(kgCarneBruto * 2) / 2; // Redondear a 0.5 kg

  // Achuras y embutidos
  const kgAchuras = conAchuras ? Math.ceil((adultos * 0.1) * 2) / 2 : 0;
  const chorizos = conAchuras ? adultos + Math.ceil(menores * 0.5) : 0;
  const morcillas = conAchuras ? Math.ceil(adultos * 0.5) : 0;

  const totalPersonas = adultos + menores;

  return {
    kgCarne: kgCarne,
    kgAchuras: kgAchuras,
    cantidadChorizos: chorizos,
    cantidadMorcillas: morcillas,
    detalle: `Para ${totalPersonas} personas (${adultos} adultos + ${menores} menores): ${kgCarne} kg de carne (${gramosPorAdulto} g/adulto, ${gramosPorMenor} g/menor)${conAchuras ? `, ${kgAchuras} kg de achuras, ${chorizos} chorizos y ${morcillas} morcillas` : ''}. Tipo: ${evento}${hayEntrada ? ' con entrada previa' : ''}.`,
  };
}
