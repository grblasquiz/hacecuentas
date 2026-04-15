/** Espesor de vidrio recomendado para ventanas */
export interface EspesorVidrioInputs {
  anchoM: number;
  altoM: number;
  pisoEdificio?: string;
  zona?: string;
}
export interface EspesorVidrioOutputs {
  espesorMinimo: number;
  tipoVidrio: string;
  superficieM2: number;
  pesoEstimado: number;
  detalle: string;
}

export function espesorVidrio(inputs: EspesorVidrioInputs): EspesorVidrioOutputs {
  const ancho = Number(inputs.anchoM);
  const alto = Number(inputs.altoM);
  const piso = String(inputs.pisoEdificio || 'pb-3');
  const zona = String(inputs.zona || 'interior');

  if (!ancho || ancho <= 0) throw new Error('Ingresá el ancho de la ventana en metros');
  if (!alto || alto <= 0) throw new Error('Ingresá el alto de la ventana en metros');

  const superficie = ancho * alto;

  // Determinar espesor base según superficie
  let espesor: number;
  let tipo: string;

  if (superficie <= 0.5) {
    espesor = 3;
    tipo = 'Float';
  } else if (superficie <= 1) {
    espesor = 4;
    tipo = 'Float';
  } else if (superficie <= 2) {
    espesor = 5;
    tipo = 'Float';
  } else if (superficie <= 3) {
    espesor = 6;
    tipo = 'Templado';
  } else if (superficie <= 5) {
    espesor = 8;
    tipo = 'Templado';
  } else {
    espesor = 10;
    tipo = 'Templado';
  }

  // Ajustar por piso
  if (piso === '4-8') {
    if (superficie > 1 && tipo === 'Float') {
      espesor = Math.max(espesor, 6);
      if (superficie > 2) tipo = 'Templado';
    }
    if (espesor < 4) espesor = 4;
  } else if (piso === '9-mas') {
    if (tipo === 'Float' && superficie > 0.5) {
      tipo = 'Templado';
    }
    espesor = Math.max(espesor, 5);
    if (superficie > 2) espesor = Math.max(espesor, 8);
  }

  // Ajustar por zona
  if (zona === 'costera') {
    espesor = Math.max(espesor, espesor + 1);
    if (superficie > 2 && tipo === 'Float') tipo = 'Templado';
  } else if (zona === 'ventosa') {
    espesor = Math.max(espesor + 2, 5);
    if (superficie > 1) tipo = 'Templado';
  }

  const peso = Number((superficie * espesor * 2.5).toFixed(1));
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    espesorMinimo: espesor,
    tipoVidrio: tipo,
    superficieM2: Number(superficie.toFixed(2)),
    pesoEstimado: peso,
    detalle: `Ventana de ${fmt.format(ancho)} × ${fmt.format(alto)} m (${fmt.format(superficie)} m²), piso ${piso}, zona ${zona} → vidrio ${tipo} de ${espesor} mm, peso estimado ${fmt.format(peso)} kg.`,
  };
}
