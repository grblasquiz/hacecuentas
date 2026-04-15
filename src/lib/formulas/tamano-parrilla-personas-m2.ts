/** Calculadora de tamaño de parrilla ideal según personas */
export interface Inputs {
  personas: number;
  tipoAsado?: string;
}
export interface Outputs {
  superficieCm2: number;
  medidasSugeridas: string;
  tipoParrilla: string;
  detalle: string;
}

export function tamanoParrillaPersonasM2(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const tipo = i.tipoAsado || 'estandar';

  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');

  // 250 cm² por persona base
  let cm2PorPersona = 250;

  const factorTipo: Record<string, number> = {
    solo_carne: 1.0,
    estandar: 1.10,
    completo: 1.25,
  };
  cm2PorPersona *= factorTipo[tipo] || 1.10;

  const superficieTotal = Math.ceil(personas * cm2PorPersona);

  // Sugerir medidas
  let medidas: string;
  let tipoParrilla: string;

  if (superficieTotal <= 1500) {
    const largo = 40;
    const ancho = Math.ceil(superficieTotal / largo);
    medidas = `${largo}×${ancho} cm (portátil)`;
    tipoParrilla = 'Parrilla portátil o de balcón';
  } else if (superficieTotal <= 3000) {
    const largo = 60;
    const ancho = Math.ceil(superficieTotal / largo);
    medidas = `${largo}×${ancho} cm`;
    tipoParrilla = 'Parrilla estándar residencial';
  } else if (superficieTotal <= 6000) {
    const largo = 80;
    const ancho = Math.ceil(superficieTotal / largo);
    medidas = `${largo}×${ancho} cm o ${Math.ceil(superficieTotal / 50)}×50 cm`;
    tipoParrilla = 'Parrilla grande (quincho o evento)';
  } else {
    const largo = 120;
    const ancho = Math.ceil(superficieTotal / largo);
    medidas = `${largo}×${ancho} cm o más`;
    tipoParrilla = 'Parrilla extra grande o asador de cruz';
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    superficieCm2: superficieTotal,
    medidasSugeridas: medidas,
    tipoParrilla,
    detalle: `Para ${personas} personas (asado ${tipo}): necesitás ${fmt.format(superficieTotal)} cm² de parrilla (${(superficieTotal / 10000).toFixed(2)} m²). Medidas sugeridas: ${medidas}. ${tipoParrilla}.`,
  };
}
