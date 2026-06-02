export interface Inputs {
  personasPorMesa: number;
  mesas: number;
  duracionHoras: number;
  porcentajeBebedores: number;
  tipoComida: string;
  proporcionTinto: number;
  proporcionBlanco: number;
  proporcionEspumante: number;
}

export interface Outputs {
  botellasTotalEvento: number;
  botellasPorMesa: number;
  botellasTinto: number;
  botellasBlanco: number;
  botellasEspumante: number;
  copasPerCapita: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Copas por botella estándar (750 ml / 150 ml por copa)
const COPAS_POR_BOTELLA = 5;

// Factor de consumo por tipo de comida (copas por bebedor por hora)
const FACTOR_COMIDA: Record<string, number> = {
  cocktail: 0.8,
  brunch: 0.9,
  almuerzo: 1.0,
  cena: 1.2,
};

export function compute(i: Inputs): Outputs {
  const personasPorMesa = Math.max(1, Math.round(Number(i.personasPorMesa) || 1));
  const mesas = Math.max(1, Math.round(Number(i.mesas) || 1));
  const duracionHoras = Math.max(0.5, Number(i.duracionHoras) || 1);
  const porcentajeBebedores = Math.min(100, Math.max(0, Number(i.porcentajeBebedores) || 80));
  const tipoComida = i.tipoComida && FACTOR_COMIDA[i.tipoComida] !== undefined ? i.tipoComida : "cena";
  const proporcionTinto = Math.max(0, Number(i.proporcionTinto) || 0);
  const proporcionBlanco = Math.max(0, Number(i.proporcionBlanco) || 0);
  const proporcionEspumante = Math.max(0, Number(i.proporcionEspumante) || 0);

  const factor = FACTOR_COMIDA[tipoComida];

  // Bebedores efectivos por mesa
  const bebedoresPorMesa = personasPorMesa * (porcentajeBebedores / 100);

  // Copas por bebedor durante todo el evento
  const copasPorBebedor = factor * duracionHoras;

  // Copas totales por mesa
  const copasTotalesMesa = bebedoresPorMesa * copasPorBebedor;

  // Botellas por mesa (exacto, sin redondear aún)
  const botellasPorMesaExacto = copasTotalesMesa / COPAS_POR_BOTELLA;

  // Total de botellas para el evento (redondeado hacia arriba)
  const botellasTotalExacto = botellasPorMesaExacto * mesas;
  const botellasTotalEvento = Math.ceil(botellasTotalExacto);

  // Distribución por tipo (ceil para no quedarse corto)
  const botellasTinto = Math.ceil(botellasTotalEvento * (proporcionTinto / 100));
  const botellasBlanco = Math.ceil(botellasTotalEvento * (proporcionBlanco / 100));
  const botellasEspumante = Math.ceil(botellasTotalEvento * (proporcionEspumante / 100));

  // Copas per cápita (solo entre bebedores)
  const copasPerCapita = copasPorBebedor;

  // Botellas por mesa redondeadas a 2 decimales para mostrar
  const botellasPorMesa = Math.round(botellasPorMesaExacto * 100) / 100;

  // Resumen textual
  const totalInvitados = personasPorMesa * mesas;
  const sumaProporciones = proporcionTinto + proporcionBlanco + proporcionEspumante;
  const advertenciaProporciones =
    sumaProporciones !== 100
      ? ` (Nota: los porcentajes suman ${sumaProporciones}%, no 100%.)`
      : "";

  const detalle =
    `${totalInvitados} invitados en ${mesas} mesa(s), ` +
    `${porcentajeBebedores}% beben vino, ` +
    `evento de ${duracionHoras}h (${tipoComida}). ` +
    `Factor: ${factor} copas/h. ` +
    `Copas por bebedor: ${copasPerCapita.toFixed(1)}. ` +
    `Tinto: ${botellasTinto} bot. | Blanco: ${botellasBlanco} bot. | Espumante: ${botellasEspumante} bot.` +
    advertenciaProporciones;

  const tone = sumaProporciones !== 100 ? 'warn' : 'neutral';
  const _insight = {
    title: 'Vino total del evento',
    text: `Con **${totalInvitados} invitados** en **${mesas} mesa(s)**, ${porcentajeBebedores}% tomando vino en un evento de **${duracionHoras} h** (${tipoComida}), necesitás **${botellasTotalEvento} botellas** (~${botellasPorMesa} por mesa).` + (sumaProporciones !== 100 ? ` Ojo: las proporciones suman **${sumaProporciones}%**, no 100%; ajustá tinto/blanco/espumante.` : ` Reparto: **${botellasTinto} tinto**, **${botellasBlanco} blanco**, **${botellasEspumante} espumante**.`),
    tone,
    icon: '🍷',
  };

  const sumaTipos = botellasTinto + botellasBlanco + botellasEspumante;
  const _chart = sumaTipos > 0 ? {
    type: 'doughnut',
    slices: [
      { label: 'Tinto', value: botellasTinto },
      { label: 'Blanco', value: botellasBlanco },
      { label: 'Espumante', value: botellasEspumante },
    ],
    centerValue: `${sumaTipos}`,
    centerLabel: 'botellas',
    ariaLabel: `Reparto del vino: ${botellasTinto} tinto, ${botellasBlanco} blanco y ${botellasEspumante} espumante`,
  } : undefined;

  return {
    botellasTotalEvento,
    botellasPorMesa,
    botellasTinto,
    botellasBlanco,
    botellasEspumante,
    copasPerCapita: Math.round(copasPerCapita * 100) / 100,
    detalle,
    _insight,
    _chart,
  };
}
