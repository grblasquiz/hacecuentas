/**
 * Presupuesto para ir al Mundial 2026 desde Paraguay — estimador editable.
 *
 * El Mundial 2026 se juega en Estados Unidos, México y Canadá (11-jun al 19-jul-2026),
 * con Paraguay clasificado (la Albirroja vuelve a un Mundial tras 16 años). Este
 * estimador suma los grandes rubros del viaje —vuelo, alojamiento, entradas y
 * viáticos— y devuelve el total en dólares y su equivalente en guaraníes.
 *
 * Todos los montos son editables (defaults orientativos). Conversión USD→PYG con la
 * cotización de referencia del BCP (TIPO_CAMBIO_PY). Moneda: USD y guaraníes (PYG).
 */
import { fmtPYG, TIPO_CAMBIO_PY } from '../data/paraguay-2026.ts';

export interface Inputs {
  personas?: number;      // cantidad de viajeros
  vueloUsd?: number;      // vuelo ida y vuelta por persona (USD)
  noches?: number;        // noches de alojamiento
  hotelNocheUsd?: number; // costo de hotel por noche por persona (USD)
  entradas?: number;      // cantidad de partidos
  precioEntradaUsd?: number; // precio por entrada (USD)
  viaticosDiaUsd?: number;   // comida, transporte y extras por día por persona (USD)
}
export interface Outputs { [k: string]: any; _insight?: any; _table?: any; }

function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 }).format(Math.round(n));
}

export function compute(i: Inputs): Outputs {
  const personas = Math.max(1, Math.floor(Number(i.personas ?? 1)));
  const vuelo = Math.max(0, Number(i.vueloUsd ?? 1500));
  const noches = Math.max(1, Math.floor(Number(i.noches ?? 10)));
  const hotelNoche = Math.max(0, Number(i.hotelNocheUsd ?? 120));
  const entradas = Math.max(0, Math.floor(Number(i.entradas ?? 3)));
  const precioEntrada = Math.max(0, Number(i.precioEntradaUsd ?? 150));
  const viaticosDia = Math.max(0, Number(i.viaticosDiaUsd ?? 80));

  const alojamiento = noches * hotelNoche;
  const entradasTotal = entradas * precioEntrada;
  const viaticos = noches * viaticosDia;
  const porPersona = vuelo + alojamiento + entradasTotal + viaticos;
  const totalUsd = porPersona * personas;

  const usdPyg = TIPO_CAMBIO_PY.usdPyg;
  const totalPyg = Math.round(totalUsd * usdPyg);
  const porPersonaPyg = Math.round(porPersona * usdPyg);

  const _table = {
    title: `Desglose del presupuesto por persona (${fmtUSD(porPersona)})`,
    headers: ['Rubro', 'USD', 'Guaraníes'],
    rows: [
      ['Vuelo ida y vuelta', fmtUSD(vuelo), fmtPYG(vuelo * usdPyg)],
      [`Alojamiento (${noches} noches)`, fmtUSD(alojamiento), fmtPYG(alojamiento * usdPyg)],
      [`Entradas (${entradas} partidos)`, fmtUSD(entradasTotal), fmtPYG(entradasTotal * usdPyg)],
      [`Viáticos (${noches} días)`, fmtUSD(viaticos), fmtPYG(viaticos * usdPyg)],
      ['Total por persona', fmtUSD(porPersona), fmtPYG(porPersonaPyg)],
    ],
    note: `Montos orientativos y editables. Conversión a la cotización de referencia del BCP (1 US$ = ${usdPyg.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Gs., snapshot ${TIPO_CAMBIO_PY.asOf}). No incluye visa, seguro de viaje ni compras.`,
  };

  const _insight = {
    type: 'highlight',
    icon: '⚽',
    text: `Ir al Mundial 2026 ${personas > 1 ? `con ${personas} personas` : ''} sale unos **${fmtUSD(totalUsd)}** (**${fmtPYG(totalPyg)}**): ${fmtUSD(porPersona)} por persona (vuelo ${fmtUSD(vuelo)}, ${noches} noches de hotel ${fmtUSD(alojamiento)}, ${entradas} entradas ${fmtUSD(entradasTotal)} y viáticos ${fmtUSD(viaticos)}).`,
  };

  return {
    totalUsd: fmtUSD(totalUsd),
    totalGuaranies: fmtPYG(totalPyg),
    porPersonaUsd: fmtUSD(porPersona),
    porPersonaGuaranies: fmtPYG(porPersonaPyg),
    detalle: `Por persona: vuelo ${fmtUSD(vuelo)} + hotel ${fmtUSD(alojamiento)} (${noches} noches) + entradas ${fmtUSD(entradasTotal)} (${entradas}) + viáticos ${fmtUSD(viaticos)} = ${fmtUSD(porPersona)}. Total ${personas} persona(s): ${fmtUSD(totalUsd)} ≈ ${fmtPYG(totalPyg)}.`,
    _insight,
    _table,
  };
}
