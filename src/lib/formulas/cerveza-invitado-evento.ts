/** Cerveza por invitado */
export interface Inputs { personas: number; horasEvento: number; tipoEvento: string; porcentajeTomadores: number; esVerano: string; }
export interface Outputs { litrosTotal: number; latas473: number; botellasLitro: number; barriles30L: number; hieloNecesario: number; }

export function cervezaInvitadoEvento(i: Inputs): Outputs {
  const p = Number(i.personas);
  const h = Number(i.horasEvento);
  const tipo = String(i.tipoEvento);
  const pct = Number(i.porcentajeTomadores) / 100;
  const verano = String(i.esVerano) === 'si';
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!h || h <= 0) throw new Error('Ingresá horas');

  const litrosHora: Record<string, number> = {
    asado: 0.25, cumpleanos: 0.30, casamiento: 0.20, corporativo: 0.15, fiesta_joven: 0.40, familia: 0.20,
  };
  const lh = litrosHora[tipo] ?? 0.25;
  let litros = p * pct * h * lh;
  if (verano) litros *= 1.25;
  litros *= 1.15; // margen 15%

  const latas = litros * 1000 / 473;
  const botellas = litros;
  const barriles = litros / 30;
  const hielo = litros / 2;

  return {
    litrosTotal: Number(litros.toFixed(1)),
    latas473: Math.ceil(latas),
    botellasLitro: Math.ceil(botellas),
    barriles30L: Number(barriles.toFixed(1)),
    hieloNecesario: Math.ceil(hielo),
  };
}
