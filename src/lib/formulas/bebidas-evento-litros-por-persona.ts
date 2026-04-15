/** Calculadora de bebidas para evento o fiesta */
export interface Inputs {
  personas: number;
  duracionHoras: number;
  tipoBebida?: string;
  temporada?: string;
}
export interface Outputs {
  litrosTotales: number;
  litrosCerveza: number;
  botellasVino: number;
  litrosGaseosa: number;
  detalle: string;
}

export function bebidasEventoLitrosPorPersona(i: Inputs): Outputs {
  const personas = Number(i.personas);
  const horas = Number(i.duracionHoras);
  const tipo = i.tipoBebida || 'mixto';
  const temporada = i.temporada || 'intermedia';

  if (!personas || personas <= 0) throw new Error('Ingresá la cantidad de personas');
  if (!horas || horas <= 0) throw new Error('Ingresá la duración del evento');

  // Factor estacional
  const factorTemp: Record<string, number> = {
    verano: 1.20,
    intermedia: 1.0,
    invierno: 0.85,
  };
  const ft = factorTemp[temporada] || 1.0;

  // Consumo base por persona por hora (litros de alcohol)
  const alcoholPorPersonaHora = 0.35 * ft;
  // No alcohólica
  const noAlcPorPersonaHora = 0.25 * ft;

  // Factor de decrecimiento: últimas horas se toma menos
  const horasEfectivas = horas <= 4 ? horas : 4 + (horas - 4) * 0.7;

  const totalAlcohol = personas * alcoholPorPersonaHora * horasEfectivas;
  const totalNoAlc = personas * noAlcPorPersonaHora * horasEfectivas;

  let litrosCerveza = 0;
  let litrosVino = 0;
  let litrosDestilado = 0;

  if (tipo === 'cerveza') {
    litrosCerveza = totalAlcohol * 0.85;
    litrosVino = totalAlcohol * 0.15;
  } else if (tipo === 'vino') {
    litrosVino = totalAlcohol * 0.80;
    litrosCerveza = totalAlcohol * 0.20;
  } else if (tipo === 'mixto') {
    litrosCerveza = totalAlcohol * 0.40;
    litrosVino = totalAlcohol * 0.30;
    litrosDestilado = totalAlcohol * 0.30;
  } else {
    // sin alcohol
    litrosCerveza = 0;
    litrosVino = 0;
    litrosDestilado = 0;
  }

  const botellasVino = Math.ceil(litrosVino / 0.75);
  const litrosGaseosa = tipo === 'sin_alcohol'
    ? Math.ceil(totalAlcohol + totalNoAlc)
    : Math.ceil(totalNoAlc + litrosDestilado * 2.5); // Fernet/gin necesita gaseosa

  const litrosTotales = Math.ceil(litrosCerveza + litrosVino + litrosDestilado + litrosGaseosa);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  return {
    litrosTotales,
    litrosCerveza: Math.ceil(litrosCerveza),
    botellasVino,
    litrosGaseosa,
    detalle: `Para ${personas} personas, ${horas} hs (${temporada}): ${fmt.format(Math.ceil(litrosCerveza))} L cerveza, ${botellasVino} botellas de vino${litrosDestilado > 0 ? `, ${Math.ceil(litrosDestilado)} L destilados` : ''}, ${litrosGaseosa} L gaseosa/agua. Total: ${litrosTotales} litros.`,
  };
}
