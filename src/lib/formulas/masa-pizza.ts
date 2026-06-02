/** Ingredientes de masa de pizza según cantidad */
export interface Inputs { cantidadPizzas: number; diametroCm?: number; estiloMasa?: string; }
export interface Outputs { harina: number; agua: number; sal: number; levadura: number; aceite: number; detalle: string; _insight?: any; _chart?: any; }

export function masaPizza(i: Inputs): Outputs {
  const pizzas = Number(i.cantidadPizzas);
  const diametro = Number(i.diametroCm) || 30;
  const estilo = String(i.estiloMasa || 'media');

  if (!pizzas || pizzas <= 0) throw new Error('Ingresá la cantidad de pizzas');
  if (diametro < 15 || diametro > 60) throw new Error('El diámetro debe estar entre 15 y 60 cm');

  // Harina base para pizza de 30 cm según estilo
  const harinaPorEstilo: Record<string, number> = { fina: 180, media: 220, gruesa: 260 };
  const hidratacion: Record<string, number> = { fina: 0.55, media: 0.62, gruesa: 0.68 };

  const harinaBase = harinaPorEstilo[estilo] || 220;
  const hidrat = hidratacion[estilo] || 0.62;

  // Ajuste por diámetro (escala con el área)
  const factorArea = Math.pow(diametro / 30, 2);
  const harinaPorPizza = harinaBase * factorArea;
  const harinaTotal = Math.round(harinaPorPizza * pizzas);

  const agua = Math.round(harinaTotal * hidrat);
  const sal = Math.round(harinaTotal * 0.018);
  const levadura = Math.round(harinaTotal * 0.015);
  const aceite = Math.round(harinaTotal * 0.05);

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const estiloLabel: Record<string, string> = { fina: 'fina', media: 'media', gruesa: 'gruesa' };

  const pesoTotal = harinaTotal + agua + sal + levadura + aceite;
  const hidratPct = Math.round(hidrat * 100);

  return {
    harina: harinaTotal,
    agua,
    sal,
    levadura,
    aceite,
    detalle: `Para ${pizzas} pizza${pizzas > 1 ? 's' : ''} de ${diametro} cm (masa ${estiloLabel[estilo] || estilo}): ${fmt.format(harinaTotal)} g harina, ${fmt.format(agua)} ml agua, ${fmt.format(sal)} g sal, ${fmt.format(levadura)} g levadura fresca, ${fmt.format(aceite)} ml aceite. Levadura seca: ${fmt.format(Math.round(levadura / 3))} g.`,
    _insight: {
      title: 'Tu masa de pizza',
      text: `Para **${pizzas} pizza${pizzas > 1 ? 's' : ''}** de ${diametro} cm necesitás **${fmt.format(harinaTotal)} g de harina** y ${fmt.format(agua)} ml de agua: una hidratación del **${hidratPct}%**, típica de masa ${estiloLabel[estilo] || estilo}. Pesá la sal y la levadura: son chicas pero definen el resultado.`,
      tone: 'neutral',
      icon: '🍕',
    },
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Harina', value: harinaTotal },
        { label: 'Agua', value: agua },
        { label: 'Aceite', value: aceite },
        { label: 'Sal', value: sal },
        { label: 'Levadura', value: levadura },
      ],
      prefix: '',
      centerValue: `${fmt.format(pesoTotal)} g`,
      centerLabel: 'Masa total',
      ariaLabel: `Composición de la masa: ${fmt.format(harinaTotal)} g de harina, ${fmt.format(agua)} ml de agua, y el resto entre aceite, sal y levadura, total ${fmt.format(pesoTotal)} g`,
    },
  };
}
