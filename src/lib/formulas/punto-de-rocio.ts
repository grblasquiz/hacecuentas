/** Punto de rocío (dew point) — Magnus-Tetens.
 *  Td = (b·α)/(a−α), con α = ln(RH/100) + a·T/(b+T); a=17.625, b=243.04 (°C). */
export interface Inputs {
  temperatura: number;    // °C
  humedadRelativa: number; // %
}
export interface Outputs {
  dewPoint: string;        // "22.5 °C"
  dewPointNumero: number;
  diferencia: string;      // T - Td, en °C
  confort: string;
  categoria: string;
  mensaje: string;
  _insight?: any;
  _chart?: any;
}

export function puntoDeRocio(i: Inputs): Outputs {
  const T = Number(i.temperatura);
  const RH = Number(i.humedadRelativa);
  if (!Number.isFinite(T) || T < -50 || T > 60) throw new Error('Temperatura fuera de rango (-50 a 60 °C).');
  if (!Number.isFinite(RH) || RH <= 0 || RH > 100) throw new Error('Humedad relativa debe estar entre 1 y 100 %.');

  const a = 17.625;
  const b = 243.04;
  const alpha = Math.log(RH / 100) + (a * T) / (b + T);
  const Td = (b * alpha) / (a - alpha);
  const diff = T - Td;

  let categoria = 'Ideal';
  let confort = 'Aire agradable, sin sensación pegajosa.';
  if (Td >= 24) { categoria = 'Sofocante'; confort = 'Humedad muy incómoda, sudor no evapora, pegajoso intenso.'; }
  else if (Td >= 21) { categoria = 'Opresivo'; confort = 'Ambiente cargado, pegajoso, cuesta respirar.'; }
  else if (Td >= 18) { categoria = 'Húmedo'; confort = 'Notable sensación pegajosa, sudor no seca bien.'; }
  else if (Td >= 13) { categoria = 'Confortable'; confort = 'Humedad perceptible pero agradable.'; }
  else if (Td >= 5) { categoria = 'Ideal'; confort = 'Aire fresco y seco, sensación óptima.'; }
  else if (Td >= -5) { categoria = 'Seco'; confort = 'Aire muy seco, piel y mucosas pueden resentirse.'; }
  else { categoria = 'Muy seco / helado'; confort = 'Aire extremadamente seco, riesgo de resequedad severa.'; }

  const niebla = diff <= 2.5 ? ' Posibilidad alta de niebla o rocío.' : '';

  const tone = Td >= 18 ? 'warn' : (Td >= 5 && Td < 13) ? 'good' : 'neutral';
  const icon = Td >= 18 ? '🥵' : Td < 5 ? '🌵' : '💧';
  const nieblaTxt = diff <= 2.5
    ? ` Como el aire está a solo **${diff.toFixed(1)} °C** del punto de rocío, hay alta chance de niebla o rocío.`
    : '';
  const insightText = `Con **${T.toFixed(1)} °C** y **${RH.toFixed(0)}%** de humedad, el punto de rocío es **${Td.toFixed(1)} °C** (${categoria.toLowerCase()}). ${confort}${nieblaTxt}`;

  const lastMax = Math.max(30, Math.ceil(Td) + 1);
  const gaugeMin = Math.min(-10, Math.floor(Td) - 1);
  return {
    dewPoint: `${Td.toFixed(1)} °C`,
    dewPointNumero: Number(Td.toFixed(2)),
    diferencia: `${diff.toFixed(1)} °C`,
    confort,
    categoria,
    mensaje: `Punto de rocío: ${Td.toFixed(1)} °C con ${T.toFixed(1)} °C y ${RH.toFixed(0)}% HR → ${categoria}.${niebla}`,
    _insight: { title: `Punto de rocío: ${categoria}`, text: insightText, tone, icon },
    _chart: {
      type: 'scale',
      marker: Number(Td.toFixed(1)),
      markerLabel: `${Td.toFixed(1)} °C`,
      min: gaugeMin,
      segments: [
        { nombre: 'Muy seco', max: 5, color: '#0891b2', colorDark: '#22d3ee' },
        { nombre: 'Ideal / fresco', max: 13, color: '#16a34a', colorDark: '#22c55e' },
        { nombre: 'Confortable', max: 18, color: '#84cc16', colorDark: '#a3e635' },
        { nombre: 'Húmedo', max: 21, color: '#f59e0b', colorDark: '#fbbf24' },
        { nombre: 'Opresivo', max: 24, color: '#f97316', colorDark: '#fb923c' },
        { nombre: 'Sofocante', max: lastMax, color: '#dc2626', colorDark: '#ef4444' },
      ],
      ariaLabel: `Punto de rocío ${Td.toFixed(1)} grados en escala de confort de humedad`,
    },
  };
}
