/** Facturas (medialunas, etc.) para un desayuno o merienda según adultos, niños y nivel de abundancia. */
export interface Inputs {
  adultos?: number | string;
  ninos?: number | string;
  momento?: string;
  abundancia?: string;
  __country?: string;
}

export interface Outputs {
  facturas: number;
  docenas: number;
  resumen: string;
  _insight?: any;
  _chart?: any;
}

export function facturasPorPersonaDesayuno(i: Inputs): Outputs {
  const adultos = Math.max(0, Math.floor(Number(i.adultos) || 0));
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  const momento = String(i.momento || 'merienda');
  const abundancia = String(i.abundancia || 'normal');

  const fPP: Record<string, number> = { justo: 2, normal: 3, abundante: 4 };
  const f = fPP[abundancia] ?? 3;

  const total = adultos + ninos;
  const facturas = total > 0 ? Math.ceil(adultos * f + ninos * 2) : 0;
  const docenas = facturas > 0 ? Math.round((facturas / 12) * 10) / 10 : 0;

  const resumen = total > 0
    ? `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''}: ${facturas} facturas (${docenas} docenas) para ${momento === 'desayuno' ? 'el desayuno' : 'la merienda'}.`
    : 'Cargá cuántas personas van a desayunar para calcular las facturas.';

  const out: Outputs = { facturas, docenas, resumen };

  if (facturas > 0) {
    out._insight = {
      title: 'Cuántas facturas comprar',
      text: `Para ${adultos} adulto${adultos === 1 ? '' : 's'}${ninos > 0 ? ` y ${ninos} niño${ninos === 1 ? '' : 's'}` : ''} calculá **${facturas} facturas**, o sea **${docenas} docenas**. Regla base: 3 facturas por adulto (2 si es justo, 4 si querés que sobre) y 2 por niño.`,
      tone: 'neutral',
      icon: '🥐',
    };
  }

  return out;
}
