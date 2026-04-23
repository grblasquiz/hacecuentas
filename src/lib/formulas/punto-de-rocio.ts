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

  return {
    dewPoint: `${Td.toFixed(1)} °C`,
    dewPointNumero: Number(Td.toFixed(2)),
    diferencia: `${diff.toFixed(1)} °C`,
    confort,
    categoria,
    mensaje: `Punto de rocío: ${Td.toFixed(1)} °C con ${T.toFixed(1)} °C y ${RH.toFixed(0)}% HR → ${categoria}.${niebla}`,
  };
}
