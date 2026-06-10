/**
 * Pensión Bienestar 2026 — qué programa te corresponde y cuánto pagan.
 * Montos bimestrales oficiales (programasparaelbienestar.gob.mx):
 *   65+ años: $6,400 · Mujeres 60–64: $3,100 · Discapacidad: $3,300 ·
 *   Madres trabajadoras: $1,650 por niña/niño (0–4 años).
 * Constantes desde src/lib/data/mexico-2026.ts (MEXICO_2026.bienestar).
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  edad: number;
  sexo?: string;             // 'mujer' | 'hombre'
  discapacidad?: string;     // 'no' | 'si'
  madreTrabajadora?: string; // 'no' | 'si' (hijos de 0 a 4 años a tu cuidado)
  hijosPequenos?: number;    // cuántos hijos de 0 a 4 años (solo si madreTrabajadora = 'si')
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

/** Guard de defaults: '' / null / undefined → default, sin pisar el 0 del usuario. */
function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { bienestar } = MEXICO_2026;

  const edad = Math.floor(num(i.edad, -1));
  if (edad < 0 || edad > 120) throw new Error('Ingresa tu edad en años (0 a 120)');
  const mujer = String(i.sexo || 'mujer') !== 'hombre';
  const conDiscapacidad = String(i.discapacidad) === 'si';
  const madreTrabajadora = String(i.madreTrabajadora) === 'si';
  const hijos = madreTrabajadora ? Math.min(10, Math.max(1, Math.floor(num(i.hijosPequenos, 1)))) : 0;

  // ── Programas a los que calificas hoy ──
  const programas: Array<{ nombre: string; bimestral: number }> = [];
  if (edad >= 65) programas.push({ nombre: 'Pensión para Adultos Mayores (65+)', bimestral: bienestar.adultosMayoresBimestral });
  if (mujer && edad >= 60 && edad <= 64) programas.push({ nombre: 'Pensión Mujeres Bienestar (60–64)', bimestral: bienestar.mujeres60a64Bimestral });
  if (conDiscapacidad && edad <= 64) programas.push({ nombre: 'Pensión para Personas con Discapacidad', bimestral: bienestar.discapacidadBimestral });
  if (madreTrabajadora) programas.push({ nombre: `Apoyo de Madres Trabajadoras (${hijos} ${hijos === 1 ? 'hijo' : 'hijos'} de 0–4 años)`, bimestral: bienestar.madresTrabajadorasBimestral * hijos });

  // ── Próximo cambio por edad ──
  let proximo = '';
  if (edad < 65) {
    const aniosA65 = 65 - edad;
    const bimA65 = aniosA65 * 6;
    if (mujer && edad < 60) {
      const aniosA60 = 60 - edad;
      proximo = `A los 60 años entras a Mujeres Bienestar (${fmtMXN(bienestar.mujeres60a64Bimestral)} bim): faltan ~${aniosA60 * 6} bimestres (${aniosA60} años). A los 65 pasas a Adultos Mayores (${fmtMXN(bienestar.adultosMayoresBimestral)} bim): ~${bimA65} bimestres.`;
    } else {
      proximo = `A los 65 años entras a la Pensión para Adultos Mayores (${fmtMXN(bienestar.adultosMayoresBimestral)} bim): faltan ~${bimA65} bimestres (${aniosA65} años).`;
    }
  } else {
    proximo = 'Ya estás en la edad de la pensión universal (65+); el monto se revisa cada año (en 2026 subió $200 por bimestre).';
  }

  // ── Sin programa hoy ──
  if (programas.length === 0) {
    const _insight = {
      title: 'Todavía no calificas — pero hay fecha',
      text: `Con ${edad} años${mujer ? '' : ' (hombre)'}, sin discapacidad y sin hijos de 0 a 4 años a tu cuidado, **hoy no te corresponde ningún programa de Bienestar con transferencia directa**. ${proximo} El registro se abre por convocatoria en los Módulos de Bienestar (normalmente el mes en que cumples la edad, con CURP, INE y comprobante de domicilio).`,
      tone: 'warn',
      icon: '📅',
    };
    return {
      programa: 'Ninguno por ahora',
      montoBimestral: fmtMXN(0),
      mensualEquivalente: fmtMXN(0),
      anual: fmtMXN(0),
      proximoCambio: proximo,
      _insight,
    };
  }

  // Programa principal = el de mayor monto; los demás se informan (la compatibilidad se verifica en módulos).
  const ordenados = [...programas].sort((a, b) => b.bimestral - a.bimestral);
  const principal = ordenados[0];
  const otros = ordenados.slice(1);

  const bimestral = principal.bimestral;
  const mensual = Math.round((bimestral / 2) * 100) / 100;
  const anual = bimestral * 6;

  const _insight = {
    title: 'Tu pensión Bienestar 2026',
    text: `Te corresponde la **${principal.nombre}**: **${fmtMXN(bimestral)} cada dos meses** (${fmtMXN(mensual)} mensuales equivalentes, ${fmtMXN(anual)} al año). ${otros.length > 0 ? `También calificarías a ${otros.map((o) => `**${o.nombre}** (${fmtMXN(o.bimestral)} bim)`).join(' y ')} — la compatibilidad entre programas se confirma en tu Módulo de Bienestar. ` : ''}${proximo} El pago cae por **bimestre adelantado** en la tarjeta del Banco del Bienestar, según el calendario por letra del apellido.`,
    tone: 'success',
    icon: '💳',
  };

  const _chart = {
    type: 'scale',
    value: bimestral,
    min: 0,
    max: bienestar.adultosMayoresBimestral,
    markers: [
      { label: 'Madres trab.', value: bienestar.madresTrabajadorasBimestral },
      { label: 'Mujeres 60–64', value: bienestar.mujeres60a64Bimestral },
      { label: 'Discapacidad', value: bienestar.discapacidadBimestral },
      { label: '65+', value: bienestar.adultosMayoresBimestral },
    ],
    prefix: '$',
    ariaLabel: `Tu programa paga ${fmtMXN(bimestral)} por bimestre; los montos 2026 van de ${fmtMXN(bienestar.madresTrabajadorasBimestral)} (madres trabajadoras, por hijo) a ${fmtMXN(bienestar.adultosMayoresBimestral)} (adultos mayores 65+).`,
  };

  return {
    programa: principal.nombre + (otros.length > 0 ? ` (también calificas a: ${otros.map((o) => o.nombre).join('; ')})` : ''),
    montoBimestral: `${fmtMXN(bimestral)} por bimestre (pago adelantado en tarjeta Banco del Bienestar)`,
    mensualEquivalente: `${fmtMXN(mensual)} al mes`,
    anual: `${fmtMXN(anual)} al año (6 pagos bimestrales)`,
    proximoCambio: proximo,
    _insight,
    _chart,
  };
}
