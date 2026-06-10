/**
 * Porciones de sushi por persona según tipo de comida.
 *
 * Referencias (Japan Sushi Association + Fine Dining Lovers):
 *   - Principal (almuerzo/cena): 10–12 piezas adulto, 6–8 niño.
 *   - Entrada / picoteo: 5–7 piezas por persona.
 *   - Degustación amplia: 15–20 piezas.
 *   - 1 roll (8 piezas) ≈ 1 maki estándar.
 *
 * Ajuste por hambre del invitado: +20% reservas para quienes comen más que el
 * promedio. Para evento con alcohol, misma referencia (el alcohol no cambia
 * significativamente la ingesta esperada).
 */

export interface Inputs {
  personas: number;
  nivelHambre: string;    // 'entrada' | 'principal' | 'degustacion'
  ninos?: number;
  precioPorPieza?: number; // opcional para costo total
  __lang?: string;
}

export interface Outputs {
  piezasTotales: number;
  rollsEquivalentes: number;
  piezasPorAdulto: number;
  piezasPorNino: number;
  costoEstimado: string;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

const PIEZAS_ADULTO: Record<string, number> = {
  entrada: 6,       // aperitivo
  principal: 11,    // comida principal
  degustacion: 18,  // evento amplio
};

const PIEZAS_NINO: Record<string, number> = {
  entrada: 4,
  principal: 7,
  degustacion: 10,
};

const PIEZAS_POR_ROLL = 8; // maki estándar 8 piezas

export function porcionesSushiPorPersonaPromedio(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const T = ({
    es: {
      errorNivel: 'Seleccioná un tipo de comida válido',
      errorNinos: 'Los niños no pueden superar el total de personas',
      costoPlaceholder: 'Ingresá precio por pieza para estimar costo',
      nivelEntrada: 'entrada/picoteo',
      nivelDegustacion: 'degustación amplia',
      nivelPrincipal: 'comida principal',
      loc: 'es-AR',
      unidadPiezas: 'piezas',
      unidadPieza: 'pieza',
      chartAdultos: 'Adultos',
      chartNinos: 'Niños',
      chartReserva: 'Reserva 10%',
      centerLabel: 'piezas',
      insightTitle: 'Tu pedido de sushi',
      persona: 'persona',
      personas: 'personas',
      nino: 'niño',
      ninos: 'niños',
      resumenTemplate: (ps: number, ns: number, nLabel: string, total: number, rolls: number, pA: number, pN: number) =>
        `Para ${ps} ${ps === 1 ? 'persona' : 'personas'}${ns > 0 ? ` (${ns} ${ns === 1 ? 'niño' : 'niños'})` : ''} en modo ${nLabel}: pedí ~${total} piezas en total (≈ ${rolls} rolls de 8). Base ${pA}/adulto + ${pN}/niño, +10% reserva.`,
    },
    en: {
      errorNivel: 'Select a valid meal type',
      errorNinos: 'Children cannot exceed the total number of people',
      costoPlaceholder: 'Enter price per piece to estimate cost',
      nivelEntrada: 'appetizer/snack',
      nivelDegustacion: 'full tasting',
      nivelPrincipal: 'main meal',
      loc: 'en-US',
      unidadPiezas: 'pieces',
      unidadPieza: 'piece',
      chartAdultos: 'Adults',
      chartNinos: 'Children',
      chartReserva: '10% buffer',
      centerLabel: 'pieces',
      insightTitle: 'Your sushi order',
      persona: 'person',
      personas: 'people',
      nino: 'child',
      ninos: 'children',
      resumenTemplate: (ps: number, ns: number, nLabel: string, total: number, rolls: number, pA: number, pN: number) =>
        `For ${ps} ${ps === 1 ? 'person' : 'people'}${ns > 0 ? ` (${ns} ${ns === 1 ? 'child' : 'children'})` : ''} for ${nLabel}: order ~${total} pieces total (≈ ${rolls} rolls of 8). Base ${pA}/adult + ${pN}/child, +10% buffer.`,
    },
    pt: {
      errorNivel: 'Selecione um tipo de refeição válido',
      errorNinos: 'O número de crianças não pode superar o total de pessoas',
      costoPlaceholder: 'Informe o preço por peça para estimar o custo',
      nivelEntrada: 'entrada/petisco',
      nivelDegustacion: 'degustação ampla',
      nivelPrincipal: 'refeição principal',
      loc: 'pt-BR',
      unidadPiezas: 'peças',
      unidadPieza: 'peça',
      chartAdultos: 'Adultos',
      chartNinos: 'Crianças',
      chartReserva: 'Reserva 10%',
      centerLabel: 'peças',
      insightTitle: 'Seu pedido de sushi',
      persona: 'pessoa',
      personas: 'pessoas',
      nino: 'criança',
      ninos: 'crianças',
      resumenTemplate: (ps: number, ns: number, nLabel: string, total: number, rolls: number, pA: number, pN: number) =>
        `Para ${ps} ${ps === 1 ? 'pessoa' : 'pessoas'}${ns > 0 ? ` (${ns} ${ns === 1 ? 'criança' : 'crianças'})` : ''} em modo ${nLabel}: peça ~${total} peças no total (≈ ${rolls} rolls de 8). Base ${pA}/adulto + ${pN}/criança, +10% de reserva.`,
    },
  } as const)[__lang];

  const personas = Math.max(1, Math.floor(Number(i.personas) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const nivel = String(i.nivelHambre || 'principal').toLowerCase();
  const precio = Math.max(0, Number(i.precioPorPieza) || 0);

  if (!PIEZAS_ADULTO[nivel]) throw new Error(T.errorNivel);
  if (ninos > personas) throw new Error(T.errorNinos);

  const adultos = personas - ninos;
  const piezasPorAdulto = PIEZAS_ADULTO[nivel];
  const piezasPorNino = PIEZAS_NINO[nivel];

  // +10% de reserva: hay siempre quien come más que el promedio.
  // base*110/100 evita el artefacto float de base*1.1 (110×1.1 = 121.0000...01 → ceil 122).
  const base = adultos * piezasPorAdulto + ninos * piezasPorNino;
  const piezasTotales = Math.ceil((base * 110) / 100);
  const rollsEquivalentes = Math.ceil(piezasTotales / PIEZAS_POR_ROLL);

  const precioStr = (Math.round(precio * 100) / 100).toLocaleString(T.loc);
  const costoEstimado =
    precio > 0
      ? `~$${Math.round(piezasTotales * precio).toLocaleString(T.loc)} (${piezasTotales} ${T.unidadPiezas} × $${precioStr}/${T.unidadPieza})`
      : T.costoPlaceholder;

  const nivelLabel = nivel === 'entrada' ? T.nivelEntrada : nivel === 'degustacion' ? T.nivelDegustacion : T.nivelPrincipal;
  const resumen = T.resumenTemplate(personas, ninos, nivelLabel, piezasTotales, rollsEquivalentes, piezasPorAdulto, piezasPorNino);

  const costoFrase =
    precio > 0
      ? ({
          es: ` A $${precioStr}/pieza, presupuestá ~$${Math.round(piezasTotales * precio).toLocaleString(T.loc)}.`,
          en: ` At $${precioStr}/piece, budget ~$${Math.round(piezasTotales * precio).toLocaleString(T.loc)}.`,
          pt: ` A $${precioStr}/peça, reserve ~$${Math.round(piezasTotales * precio).toLocaleString(T.loc)}.`,
        } as const)[__lang]
      : '';
  const _insight = {
    title: T.insightTitle,
    text: ({
      es: `Pedí **${piezasTotales} piezas** (≈ **${rollsEquivalentes} rolls** de 8) para ${personas} ${personas === 1 ? 'persona' : 'personas'}. Los rolls se venden enteros: redondeá siempre para arriba — mejor que sobre una pieza a que falte.${costoFrase}`,
      en: `Order **${piezasTotales} pieces** (≈ **${rollsEquivalentes} rolls** of 8) for ${personas} ${personas === 1 ? 'person' : 'people'}. Restaurants sell whole rolls, so always round up — better one piece over than one short.${costoFrase}`,
      pt: `Peça **${piezasTotales} peças** (≈ **${rollsEquivalentes} rolls** de 8) para ${personas} ${personas === 1 ? 'pessoa' : 'pessoas'}. Os rolls são vendidos inteiros: arredonde sempre para cima — melhor sobrar uma peça do que faltar.${costoFrase}`,
    } as const)[__lang],
    tone: 'positive',
    icon: '🍣',
  };

  const out: Outputs = {
    piezasTotales,
    rollsEquivalentes,
    piezasPorAdulto,
    piezasPorNino,
    costoEstimado,
    resumen,
    _insight,
  };

  const slices = [
    { label: T.chartAdultos, value: adultos * piezasPorAdulto },
    { label: T.chartNinos, value: ninos * piezasPorNino },
    { label: T.chartReserva, value: piezasTotales - base },
  ].filter((s) => s.value > 0);
  if (slices.length > 1) {
    out._chart = {
      type: 'doughnut',
      slices,
      centerValue: String(piezasTotales),
      centerLabel: T.centerLabel,
      ariaLabel: ({
        es: `Desglose del pedido: ${piezasTotales} piezas en total (adultos, niños y reserva del 10%).`,
        en: `Order breakdown: ${piezasTotales} pieces total (adults, children and 10% buffer).`,
        pt: `Detalhe do pedido: ${piezasTotales} peças no total (adultos, crianças e reserva de 10%).`,
      } as const)[__lang],
    };
  }

  return out;
}
