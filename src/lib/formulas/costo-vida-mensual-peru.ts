/**
 * Costo de vida mensual en Perú 2026 — estima el gasto de un hogar sumando
 * vivienda + alimentación + transporte + servicios (luz, agua, gas, internet).
 *
 * Anclas de datos 2026 (verificadas):
 * - Canasta básica alimentaria (línea de pobreza extrema) INEI: S/ 260 por persona/mes (2025, último publicado).
 *   fuente: INEI vía La República/Infobae, https://larepublica.pe/economia/2026/05/05/canasta-basica-sube-en-peru-un-hogar-necesita-s1848-al-mes-para-no-ser-pobre-segun-el-inei-358025
 * - Agua potable Sedapal doméstico 2026 (desde ene-2026): S/ 2,20/m³ (0-10 m³) y S/ 2,36/m³ (10-20 m³).
 *   fuente: Sunass Res. dic-2025, https://www.gob.pe/institucion/sunass/noticias/1329685-sunass-explica-incremento-tarifario-del-agua-potable-en-lima
 * - Luz residencial BT5B Lima 2026: ~S/ 0,68/kWh (tramo 31-140 kWh).
 *   fuente: Osinergmin, https://www.osinergmin.gob.pe/Paginas/Folletos/folletos/tarifa_electrica_residencial.html
 * - Balón GLP 10 kg doméstico 2026: ~S/ 50 (rango S/ 33-60 en grifos según Facilito).
 *   fuente: Osinergmin Facilito, https://www.osinergmin.gob.pe
 * - Pasaje Metropolitano Lima 2026: S/ 3,20 troncal adulto (se mantiene en 2026).
 *   fuente: ATU, https://andina.pe
 * - RMV Perú 2026: S/ 1.130 (DS 006-2024-TR).
 */
import { PERU_2026, fmtPEN } from '../data/peru-2026.ts';

// --- Constantes de costo 2026 (S/), verificadas ---
const CANASTA_ALIMENTARIA_PERSONA = 260;   // INEI línea de pobreza extrema (canasta básica alimentaria) por persona/mes
const NINO_FACTOR_ALIMENTO = 0.7;          // un menor consume ~70% de la canasta alimentaria de un adulto

// Servicios — base mensual de un hogar tipo (consumo modesto), Lima
const AGUA_BASE_LIMA = 45;        // ~14 m³ a tarifa Sedapal 2026 + cargo fijo + alcantarillado (S/ 2,20-2,36/m³)
const AGUA_POR_PERSONA = 12;      // m³ extra por integrante adicional, valorizado
const LUZ_BASE_LIMA = 70;         // ~100 kWh/mes a S/ 0,68 (BT5B) + cargo fijo
const LUZ_POR_PERSONA = 18;       // consumo eléctrico extra por integrante
const GAS_BALON = 50;             // balón GLP 10 kg (Osinergmin Facilito 2026)
const GAS_BALONES_BASE = 1;       // hogar chico: ~1 balón/mes
const INTERNET_HOGAR = 90;        // plan fibra/hogar 2026 (referencial, mercado)

// Transporte — pasaje urbano Lima 2026
const PASAJE_LIMA = 3.2;          // Metropolitano troncal adulto 2026 (ATU)
const VIAJES_MES_ADULTO = 44;     // ~2 viajes/día × 22 días laborables
const VIAJES_MES_NINO = 30;       // colegio ida/vuelta, medio pasaje promedio

// Factor regional: provincia es más barata que Lima en vivienda y servicios
const FACTOR_REGION = {
  lima: 1.0,
  provincia: 0.78, // ciudades del interior: alquiler y servicios ~22% menores en promedio
} as const;

// Nivel de vida: multiplica alimentación, transporte y "extras" (no la vivienda, que va por separado)
const FACTOR_NIVEL = {
  austero: 0.85,   // cocina en casa, transporte público, sin extras
  medio: 1.15,     // algunas comidas fuera, combina público/apps
  comodo: 1.7,     // come fuera seguido, taxi/apps, mejores servicios
} as const;

// Alquiler de referencia 2026 por tipo (Lima); se ajusta por región con FACTOR_REGION
const ALQUILER_LIMA = {
  habitacion: 700,     // habitación/cuarto compartido
  depa1: 1600,         // depa 1 ambiente / 1 dormitorio (zona intermedia)
  depa2: 2400,         // depa 2 dormitorios
  depa3: 3200,         // depa 3 dormitorios / familiar
  propio: 0,           // vivienda propia sin alquiler
} as const;

export interface Inputs {
  adultos: number;
  ninos?: number;            // menores en el hogar
  region?: string;           // 'lima' | 'provincia'
  vivienda?: string;         // 'habitacion' | 'depa1' | 'depa2' | 'depa3' | 'propio'
  nivel?: string;            // 'austero' | 'medio' | 'comodo'
  alquilerCustom?: number;   // si el usuario sabe su alquiler exacto, pisa el de referencia
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const adultos = Math.floor(Number(i.adultos) || 0);
  const ninos = Math.max(0, Math.floor(Number(i.ninos) || 0));
  if (adultos <= 0) throw new Error('Ingresá al menos 1 adulto en el hogar');

  const regionRaw = String(i.region || 'lima');
  const region = (regionRaw in FACTOR_REGION ? regionRaw : 'lima') as keyof typeof FACTOR_REGION;
  const nivelRaw = String(i.nivel || 'medio');
  const nivel = (nivelRaw in FACTOR_NIVEL ? nivelRaw : 'medio') as keyof typeof FACTOR_NIVEL;
  const viviendaRaw = String(i.vivienda || 'depa2');
  const viviendaKey = (viviendaRaw in ALQUILER_LIMA ? viviendaRaw : 'depa2') as keyof typeof ALQUILER_LIMA;

  const fReg = FACTOR_REGION[region];
  const fNivel = FACTOR_NIVEL[nivel];
  const personas = adultos + ninos;

  // 1) Vivienda (alquiler) — custom pisa al de referencia; ajustado por región
  const alquilerCustomRaw = i.alquilerCustom;
  const tieneCustom = alquilerCustomRaw !== undefined && alquilerCustomRaw !== null && String(alquilerCustomRaw) !== '';
  const alquilerRef = ALQUILER_LIMA[viviendaKey] * fReg;
  const vivienda = tieneCustom ? Math.max(0, Number(alquilerCustomRaw)) : alquilerRef;

  // 2) Alimentación — ancla INEI (canasta alimentaria) × nivel de vida
  const alimentoAdultos = adultos * CANASTA_ALIMENTARIA_PERSONA;
  const alimentoNinos = ninos * CANASTA_ALIMENTARIA_PERSONA * NINO_FACTOR_ALIMENTO;
  const alimentacion = (alimentoAdultos + alimentoNinos) * fNivel;

  // 3) Transporte — pasaje urbano × viajes/mes × nivel × región
  const transporteAdultos = adultos * VIAJES_MES_ADULTO * PASAJE_LIMA;
  const transporteNinos = ninos * VIAJES_MES_NINO * (PASAJE_LIMA / 2); // medio pasaje escolar
  const transporte = (transporteAdultos + transporteNinos) * fNivel * fReg;

  // 4) Servicios — luz + agua + gas + internet (escala con integrantes; agua/luz por región)
  const agua = (AGUA_BASE_LIMA + Math.max(0, personas - 2) * AGUA_POR_PERSONA) * fReg;
  const luz = (LUZ_BASE_LIMA + Math.max(0, personas - 2) * LUZ_POR_PERSONA) * fReg;
  const balones = GAS_BALONES_BASE + (personas >= 4 ? 1 : 0); // hogar de 4+ suele usar ~2 balones/mes
  const gas = balones * GAS_BALON;
  const internet = INTERNET_HOGAR; // tarifa nacional, no varía mucho por región
  const servicios = agua + luz + gas + internet;

  // Total
  const total = vivienda + alimentacion + transporte + servicios;
  const porPersona = total / personas;
  const enRMV = total / PERU_2026.rmv; // cuántas RMV cubre el gasto del hogar

  const r = (n: number) => Math.round(n);

  const composicion = ninos > 0
    ? `${adultos} adulto${adultos > 1 ? 's' : ''} y ${ninos} menor${ninos > 1 ? 'es' : ''}`
    : `${adultos} adulto${adultos > 1 ? 's' : ''}`;
  const regionTxt = region === 'lima' ? 'Lima' : 'provincia';

  const _insight = {
    title: `Costo de vida de tu hogar en ${regionTxt}`,
    text: `Un hogar de **${composicion}** en **${regionTxt}** gasta alrededor de **${fmtPEN(total)} al mes** (nivel ${nivel}). El mayor peso suele ser la **vivienda** (${fmtPEN(vivienda)}), seguida de la **alimentación** (${fmtPEN(alimentacion)}). Eso equivale a **${enRMV.toFixed(1)} sueldos mínimos** (RMV S/ 1.130) y a **${fmtPEN(porPersona)} por persona**.`,
    tone: total > PERU_2026.rmv * 2 ? 'warn' : 'good',
    icon: '🏠',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Vivienda', value: r(vivienda) },
      { label: 'Alimentación', value: r(alimentacion) },
      { label: 'Transporte', value: r(transporte) },
      { label: 'Servicios', value: r(servicios) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(total),
    centerLabel: 'Gasto mensual',
    ariaLabel: `Costo de vida mensual de ${fmtPEN(total)} repartido en vivienda ${fmtPEN(vivienda)}, alimentación ${fmtPEN(alimentacion)}, transporte ${fmtPEN(transporte)} y servicios ${fmtPEN(servicios)}.`,
  };

  return {
    total: fmtPEN(total),
    vivienda: fmtPEN(vivienda),
    alimentacion: fmtPEN(alimentacion),
    transporte: fmtPEN(transporte),
    servicios: fmtPEN(servicios),
    porPersona: fmtPEN(porPersona),
    enRMV: `${enRMV.toFixed(1)} RMV`,
    detalleServicios: `Luz ${fmtPEN(luz)} · Agua ${fmtPEN(agua)} · Gas ${fmtPEN(gas)} · Internet ${fmtPEN(internet)}`,
    detalle: `Vivienda ${fmtPEN(vivienda)} + Alimentación ${fmtPEN(alimentacion)} + Transporte ${fmtPEN(transporte)} + Servicios ${fmtPEN(servicios)} = ${fmtPEN(total)}/mes para ${personas} persona${personas > 1 ? 's' : ''}.`,
    _insight,
    _chart,
  };
}
