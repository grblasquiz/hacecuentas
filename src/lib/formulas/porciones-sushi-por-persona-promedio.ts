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
}

export interface Outputs {
  piezasTotales: number;
  rollsEquivalentes: number;
  piezasPorAdulto: number;
  piezasPorNino: number;
  costoEstimado: string;
  resumen: string;
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
  const personas = Math.max(1, Math.floor(Number(i.personas) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const nivel = String(i.nivelHambre || 'principal').toLowerCase();
  const precio = Math.max(0, Number(i.precioPorPieza) || 0);

  if (!PIEZAS_ADULTO[nivel]) throw new Error('Seleccioná un tipo de comida válido');
  if (ninos > personas) throw new Error('Los niños no pueden superar el total de personas');

  const adultos = personas - ninos;
  const piezasPorAdulto = PIEZAS_ADULTO[nivel];
  const piezasPorNino = PIEZAS_NINO[nivel];

  // +10% de reserva: hay siempre quien come más que el promedio.
  const base = adultos * piezasPorAdulto + ninos * piezasPorNino;
  const piezasTotales = Math.ceil(base * 1.1);
  const rollsEquivalentes = Math.ceil(piezasTotales / PIEZAS_POR_ROLL);

  const costoEstimado =
    precio > 0
      ? `~$${Math.round(piezasTotales * precio).toLocaleString('es-AR')} (${piezasTotales} piezas × $${Math.round(precio)}/pieza)`
      : 'Ingresá precio por pieza para estimar costo';

  const nivelLabel = nivel === 'entrada' ? 'entrada/picoteo' : nivel === 'degustacion' ? 'degustación amplia' : 'comida principal';
  const resumen = `Para ${personas} ${personas === 1 ? 'persona' : 'personas'}${ninos > 0 ? ` (${ninos} ${ninos === 1 ? 'niño' : 'niños'})` : ''} en modo ${nivelLabel}: pedí ~${piezasTotales} piezas en total (≈ ${rollsEquivalentes} rolls de 8). Base ${piezasPorAdulto}/adulto + ${piezasPorNino}/niño, +10% reserva.`;

  return {
    piezasTotales,
    rollsEquivalentes,
    piezasPorAdulto,
    piezasPorNino,
    costoEstimado,
    resumen,
  };
}
