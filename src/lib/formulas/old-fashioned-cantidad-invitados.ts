/** Old Fashioned */
export interface Inputs { personas: number; tragosPorPersona: number; mlbourbonPorTrago: number; mljarabesimplePorTrago: number; mlbitterangosturaPorTrago: number; }
export interface Outputs { totalTragos: number; totalbourbon: string; totaljarabesimple: string; totalbitterangostura: string; listaCompras: string; _insight?: any; _chart?: any; }

export function oldFashionedCantidadInvitados(i: Inputs): Outputs {
  const p = Number(i.personas);
  const t = Number(i.tragosPorPersona);
  const b = Number(i.mlbourbonPorTrago);
  const j = Number(i.mljarabesimplePorTrago);
  const bit = Number(i.mlbitterangosturaPorTrago);
  if (!p || p <= 0) throw new Error('Ingresá personas');
  if (!t || t <= 0) throw new Error('Ingresá tragos por persona');

  const tot = p * t;
  const tB = b * tot;
  const tJ = j * tot;
  const tBit = bit * tot;
  const fmt = (ml: number) => `${ml}ml (${(ml / 1000).toFixed(2)}L)`;
  const lista = `Bourbon: ${fmt(Math.ceil(tB * 1.15))} (${Math.ceil(tB * 1.15 / 750)} botellas) | Jarabe: ${fmt(Math.ceil(tJ * 1.15))} | Angostura: ${Math.ceil(tBit / 2)} dashes | Naranjas: ${Math.ceil(tot / 4)}`;

  const botellas = Math.ceil(tB * 1.15 / 750);
  const totalMl = tB + tJ + tBit;
  const _insight = {
    title: 'Tu pedido de Old Fashioned',
    text: `Para **${p} persona(s)** a **${t} trago(s)** cada una salen **${tot} Old Fashioned**. Vas a necesitar **${(tB / 1000).toFixed(2)} L de bourbon** (comprá **${botellas} botella(s)** de 750 ml para tener un 15% de margen) y **${Math.ceil(tBit / 2)} dashes** de Angostura.`,
    tone: 'neutral' as const,
    icon: '🥃',
  };
  const _chart = totalMl > 0 ? {
    type: 'doughnut' as const,
    slices: [
      { label: 'Bourbon', value: Number(tB.toFixed(1)) },
      { label: 'Jarabe simple', value: Number(tJ.toFixed(1)) },
      { label: 'Angostura', value: Number(tBit.toFixed(1)) },
    ],
    suffix: ' ml',
    centerValue: `${Math.round(totalMl).toLocaleString('es-AR')} ml`,
    centerLabel: `${tot} tragos`,
    ariaLabel: 'Composición en mililitros de los ingredientes para todos los Old Fashioned: bourbon, jarabe simple y Angostura',
  } : undefined;

  return {
    totalTragos: tot,
    totalbourbon: fmt(tB),
    totaljarabesimple: fmt(tJ),
    totalbitterangostura: `${tBit} ml (${Math.ceil(tBit / 2)} dashes)`,
    listaCompras: lista,
    _insight,
    _chart,
  };
}
