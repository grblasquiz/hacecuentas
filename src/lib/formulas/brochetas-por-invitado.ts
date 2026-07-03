/** Brochetas (pinchos) por invitado según adultos, niños, rol y tipo. */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  rol?: string;
  tipo?: string;
  __country?: string;
}

export interface Outputs {
  brochetas: number;
  carne_kg: number;
  palillos: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function brochetasPorInvitado(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const rol = String(i.rol || 'principal');
  const tipo = String(i.tipo || 'mixto');

  const baseMap: Record<string, number> = { entrada: 1.5, principal: 3 };
  const base = baseMap[rol] ?? 3;

  const total = adultos + ninos;
  const brochetas = total > 0 ? Math.ceil(adultos * base + ninos * base * 0.5) : 0;
  const carne_kg = brochetas > 0 && tipo !== 'veggie' ? Math.ceil(brochetas * 0.08 * 4) / 4 : 0;
  const palillos = brochetas;

  const tipoLabel: Record<string, string> = {
    carne: 'de carne',
    pollo: 'de pollo',
    mixto: 'mixtas',
    veggie: 'veggie',
  };

  const resumen = total > 0
    ? `Para ${adultos} adultos y ${ninos} niños: ${brochetas} brochetas ${tipoLabel[tipo] || 'mixtas'}${carne_kg > 0 ? `, ${carne_kg} kg de carne o pollo` : ''} y ${palillos} palillos.`
    : 'Cargá los invitados para calcular las brochetas.';

  const out: Outputs = { brochetas, carne_kg, palillos, resumen };

  if (total > 0) {
    out._insight = {
      title: 'Cuántas brochetas preparar',
      text: `Para **${total}** invitados calculá **${brochetas}** brochetas${carne_kg > 0 ? ` y **${carne_kg} kg** de carne o pollo` : ''}. Regla práctica: 3 brochetas por adulto como plato principal (1,5 como entrada) y unos 80 g de proteína por brocheta.`,
      tone: 'neutral',
      icon: '🍢',
    };
  }

  return out;
}
