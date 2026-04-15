/** Ropa para maleta según días de viaje, clima y posibilidad de lavado */
export interface RopaMaletaInputs {
  diasViaje: number;
  clima?: string;
  puedesLavar?: string;
  estiloViaje?: string;
}
export interface RopaMaletaOutputs {
  remeras: number;
  pantalones: number;
  interior: number;
  mediasPares: number;
  abrigos: number;
  lavados: number;
  detalle: string;
}

export function ropaMaletaDiasViaje(inputs: RopaMaletaInputs): RopaMaletaOutputs {
  const dias = Number(inputs.diasViaje);
  const clima = String(inputs.clima || 'templado');
  const lavar = String(inputs.puedesLavar || 'si') === 'si';
  const estilo = String(inputs.estiloViaje || 'casual');

  if (!dias || dias <= 0) throw new Error('Ingresá los días de viaje');

  // Base: días de ropa a llevar (con lavado: max 7, sin lavado: max días)
  const diasRopa = lavar ? Math.min(dias, 7) : Math.min(dias, 14);
  const cicloLavado = 5; // lavar cada 5 días
  const lavados = lavar ? Math.max(0, Math.ceil((dias - diasRopa) / cicloLavado)) : 0;

  // Ajustes por estilo
  const factorEstilo = estilo === 'mochilero' ? 0.8 : estilo === 'formal' ? 1.3 : 1.0;

  let remeras: number;
  let pantalones: number;
  let abrigos: number;

  switch (clima) {
    case 'calido':
      remeras = Math.max(3, Math.ceil(diasRopa * 0.9 * factorEstilo));
      pantalones = Math.max(1, Math.ceil(diasRopa * 0.3 * factorEstilo)); // shorts + pantalón
      abrigos = 1; // para aires acondicionados
      break;
    case 'frio':
      remeras = Math.max(4, Math.ceil(diasRopa * 0.85 * factorEstilo));
      pantalones = Math.max(2, Math.ceil(diasRopa * 0.35 * factorEstilo));
      abrigos = 3; // buzo + polar + campera
      break;
    case 'mixto':
      remeras = Math.max(4, Math.ceil(diasRopa * 0.85 * factorEstilo));
      pantalones = Math.max(2, Math.ceil(diasRopa * 0.35 * factorEstilo));
      abrigos = 2;
      break;
    default: // templado
      remeras = Math.max(3, Math.ceil(diasRopa * 0.8 * factorEstilo));
      pantalones = Math.max(2, Math.ceil(diasRopa * 0.3 * factorEstilo));
      abrigos = 2; // buzo + campera liviana
  }

  const interior = Math.min(Math.max(diasRopa, 5), 10);
  const medias = Math.min(Math.max(Math.ceil(diasRopa * 0.7), 3), 8);

  const climaLabel: Record<string, string> = {
    calido: 'cálido',
    templado: 'templado',
    frio: 'frío',
    mixto: 'mixto',
  };

  const prendas: string[] = [
    `${remeras} remeras/camisetas`,
    `${pantalones} pantalones/shorts`,
    `${interior} mudas de ropa interior`,
    `${medias} pares de medias`,
    `${abrigos} abrigo${abrigos > 1 ? 's' : ''}/buzo${abrigos > 1 ? 's' : ''}`,
  ];

  if (estilo === 'formal') prendas.push('1 camisa de vestir', '1 pantalón de vestir');
  if (clima === 'calido') prendas.push('2 trajes de baño');
  if (clima === 'frio') prendas.push('Gorro, guantes y bufanda');

  return {
    remeras,
    pantalones,
    interior,
    mediasPares: medias,
    abrigos,
    lavados,
    detalle: `Para ${dias} días en clima ${climaLabel[clima] || clima}${lavar ? ' (con lavado)' : ' (sin lavado)'}: ${prendas.join(', ')}.${lavados > 0 ? ` Lavarás ~${lavados} vez/veces durante el viaje.` : ''}`,
  };
}
