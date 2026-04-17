/** Vino por invitado */
export interface Inputs { personas: number; horasEvento: number; tipoEvento: string; porcentajeTomadores: number; }
export interface Outputs { botellasTotal: number; botellasTinto: number; botellasBlanco: number; botellasEspumante: number; copasPorPersona: number; }

export function vinoPorInvitadoHorasEvento(i: Inputs): Outputs {
  const p = Number(i.personas);
  const h = Number(i.horasEvento);
  const tipo = String(i.tipoEvento || 'casamiento');
  const pct = Number(i.porcentajeTomadores) / 100;
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!h || h <= 0) throw new Error('Ingresá horas');

  const copasHora: Record<string, number> = { cocktail: 0.5, cena: 0.6, casamiento: 0.7, corporativo: 0.4, asado: 0.5 };
  const distrib: Record<string, { t: number; b: number; e: number }> = {
    cocktail: { t: 0.2, b: 0.4, e: 0.4 },
    cena: { t: 0.6, b: 0.3, e: 0.1 },
    casamiento: { t: 0.45, b: 0.35, e: 0.2 },
    corporativo: { t: 0.5, b: 0.4, e: 0.1 },
    asado: { t: 0.7, b: 0.2, e: 0.1 },
  };
  const ch = copasHora[tipo] ?? 0.6;
  const d = distrib[tipo] ?? distrib.casamiento;

  const tomadores = p * pct;
  const copasTotal = tomadores * h * ch;
  const botellasBase = copasTotal / 5; // 5 copas x botella
  const botellas = Math.ceil(botellasBase * 1.15);
  const tinto = Math.ceil(botellas * d.t);
  const blanco = Math.ceil(botellas * d.b);
  const espumante = Math.ceil(botellas * d.e);

  return {
    botellasTotal: botellas,
    botellasTinto: tinto,
    botellasBlanco: blanco,
    botellasEspumante: espumante,
    copasPorPersona: Number((h * ch).toFixed(1)),
  };
}
