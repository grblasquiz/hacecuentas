/** Audible Ingreso Audiolibro */
export interface Inputs { precioAudiolibro: number; ventasMensuales: number; exclusividad: string; compartirNarrador: string; }
export interface Outputs { royaltyPorVenta: string; ingresoMensual: string; ingresoAnual: string; netoAutor: string; _insight?: any; _chart?: any; }

export function audibleIngresoAudiolibro(i: Inputs): Outputs {
  const p = Number(i.precioAudiolibro);
  const v = Number(i.ventasMensuales) || 0;
  const exc = String(i.exclusividad);
  const nar = String(i.compartirNarrador);
  if (p <= 0) throw new Error('Precio inválido');
  const royPct = exc.startsWith('Exclusivo') ? 0.40 : 0.25;
  const royVenta = p * royPct;
  const mensual = royVenta * v;
  const anual = mensual * 12;
  const compartir = nar.startsWith('Sí');
  const netoAutor = compartir ? anual * 0.5 : anual;
  const fmtUSD = (n: number) => '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  const _insight = {
    title: exc.startsWith('Exclusivo') ? 'Royalty exclusivo (40%)' : 'Royalty no exclusivo (25%)',
    text: `Cobrás **${royPct * 100}% por venta** (${fmtUSD(royVenta)} de cada ${fmtUSD(p)}). Con ${v} ventas/mes son **${fmtUSD(anual)}/año** brutos${compartir ? `, y al repartir 50% con el narrador te quedan **${fmtUSD(netoAutor)}/año**` : `, que cobrás íntegros (**${fmtUSD(netoAutor)}/año**) al no compartir narrador`}.`,
    tone: (exc.startsWith('Exclusivo') ? 'good' : 'neutral') as 'good' | 'neutral',
    icon: '🎧',
  };

  const out: Outputs = {
    royaltyPorVenta: `$${royVenta.toFixed(2)} USD (${(royPct*100)}% de $${p})`,
    ingresoMensual: `$${mensual.toFixed(2)} USD/mes`,
    ingresoAnual: `$${anual.toFixed(2)} USD/año`,
    netoAutor: compartir ? `$${netoAutor.toFixed(2)} USD/año (50% tras narrador)` : `$${netoAutor.toFixed(2)} USD/año (sin compartir)`,
    _insight,
  };

  // Donut solo cuando se reparte con el narrador: el bruto anual se divide autor / narrador
  if (compartir && anual > 0) {
    out._chart = {
      type: 'doughnut',
      slices: [
        { label: 'Tu parte (autor)', value: Math.round(netoAutor) },
        { label: 'Narrador (50%)', value: Math.round(anual - netoAutor) },
      ],
      prefix: '$',
      centerValue: fmtUSD(anual),
      centerLabel: 'Royalty anual',
      ariaLabel: `Reparto del royalty anual de ${fmtUSD(anual)}: ${fmtUSD(netoAutor)} para el autor y ${fmtUSD(anual - netoAutor)} para el narrador.`,
    };
  }

  return out;
}
