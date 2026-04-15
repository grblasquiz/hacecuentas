/** Impermeabilizante / membrana por m² de techo */
export interface ImpermeabilizanteM2Inputs {
  superficieM2: number;
  tipo?: string;
  capas?: string;
}
export interface ImpermeabilizanteM2Outputs {
  cantidadProducto: number;
  unidadProducto: string;
  primerKg: number;
  detalle: string;
}

export function impermeabilizanteM2(inputs: ImpermeabilizanteM2Inputs): ImpermeabilizanteM2Outputs {
  const superficie = Number(inputs.superficieM2);
  const tipo = String(inputs.tipo || 'membrana-liquida');
  const capas = Number(inputs.capas ?? 3);

  if (!superficie || superficie <= 0) throw new Error('Ingresá la superficie del techo en m²');
  if (capas < 1 || capas > 3) throw new Error('Las capas deben ser entre 1 y 3');

  const primerKg = Number((superficie * 0.25).toFixed(1));
  let cantidadProducto: number;
  let unidadProducto: string;
  let detalleExtra: string;

  if (tipo === 'membrana-liquida') {
    // ~1 kg/m² por capa
    cantidadProducto = Number((superficie * 1 * capas).toFixed(1));
    unidadProducto = 'kg';
    const baldes = Math.ceil(cantidadProducto / 20);
    detalleExtra = `${baldes} baldes de 20 kg`;
  } else if (tipo === 'membrana-asfaltica') {
    // 1 rollo = 10 m², con 10% solape real = 9 m² útiles por rollo
    const m2Necesarios = superficie * 1.1 * capas; // +10% solape
    cantidadProducto = Number(m2Necesarios.toFixed(1));
    unidadProducto = 'm² de rollo';
    const rollos = Math.ceil(cantidadProducto / 10);
    detalleExtra = `${rollos} rollos de 10 m²`;
  } else {
    // pintura impermeabilizante ~0.5 kg/m² por capa
    cantidadProducto = Number((superficie * 0.5 * capas).toFixed(1));
    unidadProducto = 'kg';
    const baldes = Math.ceil(cantidadProducto / 20);
    detalleExtra = `${baldes} baldes de 20 kg`;
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });

  return {
    cantidadProducto,
    unidadProducto,
    primerKg,
    detalle: `${fmt.format(superficie)} m² × ${capas} capa(s) de ${tipo.replace(/-/g, ' ')} → ${fmt.format(cantidadProducto)} ${unidadProducto} (${detalleExtra}) + ${fmt.format(primerKg)} kg de primer.`,
  };
}
