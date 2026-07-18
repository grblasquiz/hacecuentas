/**
 * Pensión Mujeres Bienestar 2026 — elegibilidad (mujeres de 60 a 64 años) y monto.
 * $3,100 por bimestre en 2026; a los 65 pasa automáticamente a la Pensión de
 * Adultos Mayores ($6,400 bimestrales). Registro nacional más reciente: 22 al 28
 * de junio de 2026 en Módulos de Bienestar. Constantes desde
 * src/lib/data/mexico-2026.ts (MEXICO_2026.bienestar).
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  edad: number;
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

export function compute(i: Inputs): Outputs {
  const { bienestar } = MEXICO_2026;
  const edad = Math.floor(num(i.edad, -1));
  if (edad < 0 || edad > 120) throw new Error('Ingresa tu edad en años (0 a 120)');

  const bimestral = bienestar.mujeres60a64Bimestral;
  const mensual = Math.round((bimestral / 2) * 100) / 100;
  const anual = bimestral * 6;

  if (edad < 60) {
    const faltan = 60 - edad;
    const detalle = `Con ${edad} años todavía no calificas: la Pensión Mujeres Bienestar es para mujeres de 60 a 64 años. Te faltan ${faltan} ${faltan === 1 ? 'año' : 'años'}.`;
    return {
      elegibilidad: `Aún no — faltan ${faltan} ${faltan === 1 ? 'año' : 'años'} para los 60`,
      montoBimestral: `${fmtMXN(bimestral)} cuando cumplas 60 (monto 2026)`,
      mensualEquivalente: fmtMXN(0),
      acumuladoHasta65: `Si entras a los 60: hasta ${fmtMXN(bimestral * 30)} en los 5 años del programa (30 bimestres, a monto 2026)`,
      detalle,
      _insight: {
        title: 'Todavía no, pero conviene agendarlo',
        text: `La **Pensión Mujeres Bienestar** paga **${fmtMXN(bimestral)} cada dos meses** a mujeres de **60 a 64 años**. Con ${edad} años te faltan **${faltan} ${faltan === 1 ? 'año' : 'años'}**. Los registros se abren por convocatoria en los Módulos de Bienestar (el más reciente fue del 22 al 28 de junio de 2026): cuando cumplas 60, acude con acta de nacimiento, INE, CURP, comprobante de domicilio (máx. 6 meses) y teléfono.`,
        tone: 'warn',
        icon: '📅',
      },
    };
  }

  if (edad >= 65) {
    const detalle = `Con ${edad} años ya no corresponde Mujeres Bienestar (60-64): te toca la Pensión para Adultos Mayores de ${fmtMXN(bienestar.adultosMayoresBimestral)} bimestrales.`;
    return {
      elegibilidad: 'No — a los 65+ corresponde la Pensión de Adultos Mayores',
      montoBimestral: `${fmtMXN(bienestar.adultosMayoresBimestral)} (Pensión Adultos Mayores 65+)`,
      mensualEquivalente: fmtMXN(Math.round((bienestar.adultosMayoresBimestral / 2) * 100) / 100),
      acumuladoHasta65: 'Ya pasaste la etapa 60-64',
      detalle,
      _insight: {
        title: 'A los 65+ te corresponde la pensión mayor',
        text: `Con **${edad} años** ya no aplica Mujeres Bienestar: te corresponde la **Pensión para el Bienestar de las Personas Adultas Mayores**, que en 2026 paga **${fmtMXN(bienestar.adultosMayoresBimestral)} por bimestre** (más del doble). Quien ya cobraba Mujeres Bienestar pasa **automáticamente** al cumplir 65, sin volver a registrarse.`,
        tone: 'good',
        icon: '💳',
      },
    };
  }

  // 60 a 64: elegible
  const aniosHasta65 = 65 - edad;
  const bimestresHasta65 = aniosHasta65 * 6;
  const acumulado = bimestral * bimestresHasta65;

  const detalle = `Elegible: ${edad} años (rango 60-64). ${fmtMXN(bimestral)} por bimestre = ${fmtMXN(mensual)}/mes · ${fmtMXN(anual)}/año. Hasta cumplir 65 te quedan ~${bimestresHasta65} bimestres: ~${fmtMXN(acumulado)} acumulados (a monto 2026); después pasas automáticamente a la de Adultos Mayores (${fmtMXN(bienestar.adultosMayoresBimestral)} bim).`;

  const _insight = {
    title: 'Calificas a la Pensión Mujeres Bienestar',
    text: `Con **${edad} años** estás en el rango (60-64): te corresponden **${fmtMXN(bimestral)} cada dos meses** (${fmtMXN(mensual)} mensuales equivalentes, ${fmtMXN(anual)} al año), depositados en la tarjeta del Banco del Bienestar por bimestre adelantado. Hasta cumplir 65 acumularías **~${fmtMXN(acumulado)}** (${bimestresHasta65} bimestres al monto 2026) y luego pasas **automáticamente** a la Pensión de Adultos Mayores de **${fmtMXN(bienestar.adultosMayoresBimestral)}** bimestrales, sin nuevo trámite. Si aún no estás registrada, espera la próxima convocatoria en tu Módulo de Bienestar (la última fue del 22 al 28 de junio de 2026, por letra del primer apellido).`,
    tone: 'success',
    icon: '💜',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Mujeres Bienestar (bim)', 'Adultos Mayores 65+ (bim)'],
    values: [bimestral, bienestar.adultosMayoresBimestral],
    prefix: '$',
    ariaLabel: `Mujeres Bienestar paga ${fmtMXN(bimestral)} por bimestre; al cumplir 65 la pensión sube a ${fmtMXN(bienestar.adultosMayoresBimestral)}.`,
  };

  return {
    elegibilidad: `Sí — ${edad} años, dentro del rango 60-64`,
    montoBimestral: `${fmtMXN(bimestral)} por bimestre (tarjeta Banco del Bienestar)`,
    mensualEquivalente: `${fmtMXN(mensual)} al mes`,
    acumuladoHasta65: `~${fmtMXN(acumulado)} en ${bimestresHasta65} bimestres hasta pasar a la de 65+ (monto 2026)`,
    detalle,
    _insight,
    _chart,
  };
}
