/** Valuación de startup pre-revenue con método Berkus */

export interface Inputs {
  ideaAtractiva: number;
  prototipoTecnologia: number;
  equipoGestion: number;
  relacionesEstrategicas: number;
  ventasTraccion: number;
}

export interface Outputs {
  valuacion: number;
  porcentajeMaximo: number;
  diagnostico: string;
  detalle: string;
}

export function valuacionStartupMetodoBerkus(i: Inputs): Outputs {
  const idea = Number(i.ideaAtractiva);
  const proto = Number(i.prototipoTecnologia);
  const equipo = Number(i.equipoGestion);
  const relaciones = Number(i.relacionesEstrategicas);
  const ventas = Number(i.ventasTraccion);

  if (isNaN(idea) || idea < 0 || idea > 500000) throw new Error('Idea atractiva: entre 0 y 500.000');
  if (isNaN(proto) || proto < 0 || proto > 500000) throw new Error('Prototipo: entre 0 y 500.000');
  if (isNaN(equipo) || equipo < 0 || equipo > 500000) throw new Error('Equipo: entre 0 y 500.000');
  if (isNaN(relaciones) || relaciones < 0 || relaciones > 500000) throw new Error('Relaciones: entre 0 y 500.000');
  if (isNaN(ventas) || ventas < 0 || ventas > 500000) throw new Error('Ventas/tracción: entre 0 y 500.000');

  const valuacion = idea + proto + equipo + relaciones + ventas;
  const maximo = 2500000;
  const porcentajeMaximo = (valuacion / maximo) * 100;

  // Find strongest and weakest factors
  const factores = [
    { nombre: 'Idea', valor: idea },
    { nombre: 'Prototipo', valor: proto },
    { nombre: 'Equipo', valor: equipo },
    { nombre: 'Relaciones', valor: relaciones },
    { nombre: 'Ventas/tracción', valor: ventas },
  ];
  const sorted = [...factores].sort((a, b) => b.valor - a.valor);
  const fuerte = sorted[0];
  const debil = sorted[sorted.length - 1];

  let diagnostico: string;
  if (porcentajeMaximo >= 80) {
    diagnostico = 'Startup muy atractiva para inversores ángeles. Valuación alta para pre-revenue.';
  } else if (porcentajeMaximo >= 60) {
    diagnostico = 'Buen perfil de inversión. Fortalecé los factores más débiles para mejorar la valuación.';
  } else if (porcentajeMaximo >= 40) {
    diagnostico = 'Perfil moderado. Necesitás avanzar en al menos 2-3 factores antes de buscar inversión.';
  } else {
    diagnostico = 'Etapa muy temprana. Enfocate en desarrollar el producto y armar equipo antes de buscar capital.';
  }

  const fmt = new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 });

  const detalle =
    `Idea: USD ${fmt.format(idea)} | Prototipo: USD ${fmt.format(proto)} | ` +
    `Equipo: USD ${fmt.format(equipo)} | Relaciones: USD ${fmt.format(relaciones)} | ` +
    `Tracción: USD ${fmt.format(ventas)}. ` +
    `Valuación total: USD ${fmt.format(valuacion)} (${porcentajeMaximo.toFixed(0)}% del máximo). ` +
    `Fortaleza: ${fuerte.nombre} (USD ${fmt.format(fuerte.valor)}). ` +
    `A mejorar: ${debil.nombre} (USD ${fmt.format(debil.valor)}). ` +
    diagnostico;

  return {
    valuacion: Math.round(valuacion),
    porcentajeMaximo: Number(porcentajeMaximo.toFixed(1)),
    diagnostico,
    detalle,
  };
}
