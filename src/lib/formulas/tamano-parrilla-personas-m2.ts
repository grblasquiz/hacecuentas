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
  _insight?: any;
  _chart?: any;
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

  const lastMax = Math.max(8000, Math.ceil(superficieTotal / 1000) * 1000 + 1000);

  return {
    superficieCm2: superficieTotal,
    medidasSugeridas: medidas,
    tipoParrilla,
    detalle: `Para ${personas} personas (asado ${tipo}): necesitás ${fmt.format(superficieTotal)} cm² de parrilla (${(superficieTotal / 10000).toFixed(2)} m²). Medidas sugeridas: ${medidas}. ${tipoParrilla}.`,
    _insight: {
      title: tipoParrilla,
      text: `Para **${fmt.format(personas)} personas** con asado ${tipo} necesitás **${fmt.format(superficieTotal)} cm²** (${(superficieTotal / 10000).toFixed(2)} m²) de parrilla, equivalente a unas medidas de **${medidas}**. Dejá zona de fuego al costado para regular brasas sin amontonar la carne.`,
      tone: 'neutral',
      icon: '🔥',
    },
    _chart: {
      type: 'scale',
      marker: superficieTotal,
      markerLabel: `${fmt.format(superficieTotal)} cm²`,
      min: 0,
      segments: [
        { nombre: 'Portátil / balcón', max: 1500, color: '#34d399', colorDark: '#10b981' },
        { nombre: 'Residencial', max: 3000, color: '#60a5fa', colorDark: '#3b82f6' },
        { nombre: 'Quincho / evento', max: 6000, color: '#fbbf24', colorDark: '#f59e0b' },
        { nombre: 'Extra grande / cruz', max: lastMax, color: '#f87171', colorDark: '#ef4444' },
      ],
      ariaLabel: `Superficie de parrilla de ${fmt.format(superficieTotal)} cm² ubicada en el rango ${tipoParrilla}`,
    },
  };
}
