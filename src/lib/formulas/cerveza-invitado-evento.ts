/** Cerveza por invitado */
export interface Inputs { personas: number; horasEvento: number; tipoEvento: string; porcentajeTomadores: number; esVerano: string; }
export interface Outputs { litrosTotal: number; latas473: number; botellasLitro: number; barriles30L: number; hieloNecesario: number; _insight?: any; }

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

  const tomadores = Math.round(p * pct);
  const litrosR = Number(litros.toFixed(1));
  const _insight = {
    title: 'Cuánta cerveza comprar',
    text: `Para **${tomadores}** tomadores en **${h} h** necesitás unos **${litrosR.toLocaleString('es-AR')} L** de cerveza: alcanza con **${Math.ceil(latas)} latas** de 473 ml o **${Math.ceil(botellas)} botellas** de litro${verano ? ', con el plus de verano ya incluido' : ''}. Sumá **${Math.ceil(hielo)} kg de hielo** para enfriarla. Ya está contemplado un 15% de margen para que no falte.`,
    tone: 'neutral',
    icon: '🍺',
  };
  return {
    litrosTotal: litrosR,
    latas473: Math.ceil(latas),
    botellasLitro: Math.ceil(botellas),
    barriles30L: Number(barriles.toFixed(1)),
    hieloNecesario: Math.ceil(hielo),
    _insight,
  };
}
