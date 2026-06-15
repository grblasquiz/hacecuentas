import { BASE_IMPONIBLE_MAXIMA_APORTES } from './sueldo-ar';
import { aplicarEscalaMensual, MNI_MENSUAL_BASE, INCREMENTO_HIJO_MENSUAL, INCREMENTO_CONYUGE_MENSUAL } from './_ganancias-escala';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _chart?: any; _insight?: any; }

/**
 * Escala salarial FEHGRA / CCT 389/04 — Categoría "B" (restaurante / bar / hotel 3★,
 * la escala de referencia más común), básicos de JUNIO 2026.
 *
 * Tercer tramo del acuerdo paritario UTHGRA–FEHGRA homologado en abril 2026: en junio
 * la suma no remunerativa de abril/mayo quedó incorporada al básico, que pasa a ser 100 %
 * remunerativo. Cada puesto del selector mapea al "Punto" del convenio donde figura el cargo.
 *
 * Fuente oficial (la misma citada en el JSON): escala FEHGRA 389/04 publicada por UTHGRA
 * (uthgramendoza.com.ar/.../escala-fehgra-vigente.pdf), verificada cifra por cifra contra
 * estudiovilaplana.com.ar/sueldos-gastronomicos. Montos en pesos, sin inventar valores.
 * Hoteles 4★ (Cat "A") y 5★ (Cat "Especial") tienen escalas más altas.
 */
const ESCALA_389_04: Record<string, { basico: number; punto: number; rol: string }> = {
  bach:        { basico: 1_038_120, punto: 1, rol: 'Bachero / Lavacopas (Punto 1)' },
  mozo:        { basico: 1_102_324, punto: 2, rol: 'Mozo de mostrador (Punto 2)' },
  'ayuda-coc': { basico: 1_180_295, punto: 3, rol: 'Ayudante de cocina (Punto 3)' },
  cocinero:    { basico: 1_384_689, punto: 6, rol: 'Cocinero / Mozo de salón (Punto 6)' },
  enc:         { basico: 1_538_297, punto: 7, rol: 'Encargado / Jefe de brigada (Punto 7)' },
};
const PUESTO_DEFAULT = 'mozo';

/** Jornada completa del CCT 389/04: 8 h diarias / 48 h semanales. */
const JORNADA_COMPLETA_HS = 48;

export function sueldoGastronomicoUthgraMozoCocinero(i: Inputs): Outputs {
  const puesto = typeof i.puesto === 'string' && ESCALA_389_04[i.puesto] ? i.puesto : PUESTO_DEFAULT;
  const escala = ESCALA_389_04[puesto];
  const antig = Math.max(0, Number(i.antiguedad) || 0);
  const cargas = Number(i.cargas) || 0;
  const conyuge = Number(i.conyuge) || 0;

  // `horas` es required, pero el form manda '' cuando está vacío (Number('') === 0).
  // Default defensivo a jornada completa para no devolver un básico en cero.
  const horasRaw = Number(i.horas);
  const horas = Number.isFinite(horasRaw) && horasRaw > 0 ? horasRaw : JORNADA_COMPLETA_HS;
  // El básico de convenio corresponde a jornada completa (48 h). La jornada reducida
  // prorratea; las horas por encima de 48 NO inflan el básico (el excedente es hora
  // extra al 50/100 %, fuera del alcance de esta calculadora).
  const proporcionHoras = Math.min(horas, JORNADA_COMPLETA_HS) / JORNADA_COMPLETA_HS;

  const basicoConvenio = escala.basico;          // jornada completa, Junio 2026
  const basico = basicoConvenio * proporcionHoras; // prorrateado por horas semanales
  const plusAntig = basico * 0.01 * Math.min(antig, 20); // 1 %/año, tope 20 años (LCT art. 121)
  const bruto = basico + plusAntig;
  const baseAp = Math.min(bruto, BASE_IMPONIBLE_MAXIMA_APORTES); // tope Ley 24.241 art. 9
  const jubilacion = baseAp * 0.11;
  const obraSocial = baseAp * 0.03;
  const pami = baseAp * 0.03;
  const baseGanancias = Math.max(0, bruto - jubilacion - obraSocial - pami - MNI_MENSUAL_BASE - cargas * INCREMENTO_HIJO_MENSUAL - conyuge * INCREMENTO_CONYUGE_MENSUAL);
  const ganancias = aplicarEscalaMensual(baseGanancias).impuesto;
  const neto = bruto - jubilacion - obraSocial - pami - ganancias;
  const sac = bruto / 12;
  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto de bolsillo', value: neto },
      { label: 'Jubilación', value: jubilacion },
      { label: 'Obra social', value: obraSocial },
      { label: 'PAMI', value: pami },
      { label: 'Ganancias', value: ganancias },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(bruto).toLocaleString('es-AR'),
    centerLabel: 'Bruto',
    ariaLabel: 'Composición del sueldo bruto: neto, jubilación, obra social, PAMI y Ganancias.',
  };
  const pctNeto = bruto > 0 ? Math.round((neto / bruto) * 100) : 0;
  const fmt = (n: number) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const jornadaTxt = proporcionHoras < 1 ? ` (jornada de ${fmt(horas)} h sobre 48)` : '';
  const insight = {
    title: 'De tu bruto, cuánto te queda',
    text: `Como **${escala.rol}** del CCT 389/04 con ${fmt(antig)} ${antig === 1 ? 'año' : 'años'} de antigüedad${jornadaTxt}, tu bruto es **$${fmt(bruto)}** y cobrás **$${fmt(neto)}** de bolsillo (**${pctNeto}%**). Los aportes de ley descuentan **$${fmt(jubilacion + obraSocial + pami)}**${ganancias > 0 ? ` y Ganancias se lleva otros $${fmt(ganancias)}` : '; con este sueldo todavía no pagás Ganancias'}.`,
    tone: ganancias > 0 ? 'warn' : 'neutral',
    icon: '🍽️',
  };
  return {
    basico: '$' + fmt(basico),
    bruto: '$' + fmt(bruto),
    neto: '$' + fmt(neto),
    sac: '$' + fmt(sac),
    resumen: `${escala.rol}: básico de convenio $${fmt(basicoConvenio)} (jornada completa)${proporcionHoras < 1 ? `, prorrateado a $${fmt(basico)} por ${fmt(horas)} h` : ''}. Con ${fmt(antig)} ${antig === 1 ? 'año' : 'años'} de antigüedad cobrás ~$${fmt(neto)} netos.`,
    _chart: chart,
    _insight: insight,
  };
}
