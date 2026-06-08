/** Cambio de moneda: USD/EUR/BRL a ARS con múltiples tipos de cambio */
export interface Inputs {
  monto: number;
  moneda: 'usd' | 'eur' | 'brl' | string;
  cotizacionOficial: number;
  cotizacionBlue?: number;
  cotizacionMEP?: number;
  cotizacionTarjeta?: number;
  direccion?: 'a-pesos' | 'a-divisa' | string;
}
export interface Outputs {
  enOficial: number;
  enBlue: number;
  enMEP: number;
  enTarjeta: number;
  brechaPct: number;
  mejorParaComprar: string;
  _insight?: any;
  _chart?: any;
}

export function cambioMoneda(i: Inputs): Outputs {
  const monto = Number(i.monto);
  const oficial = Number(i.cotizacionOficial);
  const blue = Number(i.cotizacionBlue) || oficial * 1.4;
  const mep = Number(i.cotizacionMEP) || oficial * 1.15;
  const tarjeta = Number(i.cotizacionTarjeta) || oficial * 1.3; // ×1,30: percepción 30% que subsiste sólo para turismo en pesos (PAÍS derogado; percepción sobre consumo directo eliminada 01/2026)
  const dir = String(i.direccion || 'a-pesos');
  if (!monto || monto <= 0) throw new Error('Ingresá el monto');
  if (!oficial || oficial <= 0) throw new Error('Ingresá la cotización oficial');

  let valorOf = 0, valorBl = 0, valorMep = 0, valorTarj = 0;
  if (dir === 'a-pesos') {
    valorOf = monto * oficial;
    valorBl = monto * blue;
    valorMep = monto * mep;
    valorTarj = monto * tarjeta;
  } else {
    valorOf = monto / oficial;
    valorBl = monto / blue;
    valorMep = monto / mep;
    valorTarj = monto / tarjeta;
  }

  const brecha = ((blue / oficial) - 1) * 100;
  const mejor = dir === 'a-pesos' ? 'blue (mayor rendimiento)' : 'oficial (menor costo)';
  const brechaR = Number(brecha.toFixed(2));

  const fmtArs = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const divLabel = String(i.moneda || 'usd').toUpperCase();
  const ofR = Math.round(valorOf);
  const blR = Math.round(valorBl);

  // Insight: dependiente de dirección y de la brecha
  let tone: 'good' | 'warn' | 'neutral';
  let insightText: string;
  const brechaTxt = `**${brechaR.toFixed(1)}%**`;
  if (dir === 'a-pesos') {
    const extra = blR - ofR;
    tone = brecha >= 50 ? 'warn' : 'neutral';
    insightText = `Tus ${fmtArs.format(monto)} ${divLabel} valen **$${fmtArs.format(ofR)}** al oficial y **$${fmtArs.format(blR)}** al blue: liquidar en el paralelo te deja **$${fmtArs.format(extra)}** más. La brecha del ${brechaTxt} mide cuánta presión cambiaria hay sobre el peso.`;
  } else {
    tone = brecha >= 50 ? 'warn' : 'neutral';
    insightText = `Con $${fmtArs.format(monto)} comprás **${fmtArs.format(ofR)} ${divLabel}** al oficial pero solo **${fmtArs.format(blR)} ${divLabel}** al blue. La brecha del ${brechaTxt} es lo que pagás de más cuando no accedés al tipo de cambio oficial.`;
  }

  const out: Outputs = {
    enOficial: ofR,
    enBlue: blR,
    enMEP: Math.round(valorMep),
    enTarjeta: Math.round(valorTarj),
    brechaPct: brechaR,
    mejorParaComprar: mejor,
    _insight: {
      title: 'Brecha cambiaria',
      text: insightText,
      tone,
      icon: '💵',
    },
  };

  // Gauge de brecha: zonas de presión cambiaria (solo si la brecha es positiva)
  if (brechaR >= 0) {
    out._chart = {
      type: 'scale',
      marker: brechaR,
      markerLabel: `${brechaR.toFixed(0)}%`,
      min: 0,
      segments: [
        { nombre: 'Baja', max: 20, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Moderada', max: 50, color: '#eab308', colorDark: '#facc15' },
        { nombre: 'Alta', max: 100, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Extrema', max: Math.max(110, Math.ceil(brechaR) + 10), color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Brecha cambiaria entre dólar blue y oficial: ${brechaR.toFixed(0)}%`,
    };
  }

  return out;
}
