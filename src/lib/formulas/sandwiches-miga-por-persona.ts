/** Sándwiches de miga por persona según adultos, niños y momento del evento. */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  momento?: string;
  __country?: string;
}

export interface Outputs {
  sandwiches: number;
  docenas: number;
  planchas: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function sandwichesMigaPorPersona(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const momento = String(i.momento || 'copetin_previa');

  const baseMap: Record<string, number> = { copetin_previa: 3, merienda: 2, principal: 5 };
  const base = baseMap[momento] ?? 3;

  const total = adultos + ninos;
  const sandwiches = total > 0 ? Math.ceil(adultos * base + ninos * base * 0.6) : 0;
  const docenas = sandwiches > 0 ? Math.round((sandwiches / 12) * 10) / 10 : 0;
  const planchas = sandwiches > 0 ? Math.ceil(sandwiches / 9) : 0;

  const resumen = total > 0
    ? `Para ${adultos} adultos y ${ninos} niños: ${sandwiches} sándwiches de miga (${docenas} docenas), es decir ${planchas} ${planchas === 1 ? 'plancha' : 'planchas'} de miga.`
    : 'Cargá los invitados para calcular los sándwiches.';

  const out: Outputs = { sandwiches, docenas, planchas, resumen };

  if (total > 0) {
    out._insight = {
      title: 'Cuántos sándwiches de miga pedir',
      text: `Para **${total}** invitados calculá **${sandwiches}** sándwiches de miga (**${docenas}** docenas, ${planchas} ${planchas === 1 ? 'plancha' : 'planchas'}). Regla práctica: 3 unidades por persona en el copetín de la previa, 2 en la merienda y 5 si son la comida principal.`,
      tone: 'neutral',
      icon: '🥪',
    };
  }

  return out;
}
