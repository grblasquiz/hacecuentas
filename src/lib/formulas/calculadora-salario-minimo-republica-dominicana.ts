/**
 * Calculadora de salario mínimo por sector — República Dominicana 2026.
 *
 * R. D. NO tiene un salario mínimo único: el Comité Nacional de Salarios (CNS)
 * lo fija por sector vía resolución. Esta calc es un SELECTOR de sector que
 * devuelve el mínimo mensual vigente + el jornal diario (÷23,83) y el valor de
 * la hora (÷191), usando el divisor universal de nómina dominicano.
 *
 * Data: src/lib/data/republica-dominicana-2026.ts (salarioMinimo.*, divisorDiario, horasMensuales).
 */
import { REPUBLICA_DOMINICANA_2026, fmtDOP } from '../data/republica-dominicana-2026';

export interface SalarioMinimoInputs {
  /** Clave del sector (ver SECTORES). */
  sector?: string;
}

export interface SalarioMinimoOutputs {
  sector: string;
  mensual: number;
  quincenal: number;
  diario: number;
  hora: number;
  mensualTexto: string;
  quincenalTexto: string;
  diarioTexto: string;
  horaTexto: string;
  detalle: string;
  _insight?: any;
  _table?: any;
}

const sm = REPUBLICA_DOMINICANA_2026.salarioMinimo;

/** Catálogo de sectores → monto mensual vigente (RD$) + etiqueta. */
const SECTORES: Record<string, { label: string; mensual: number; nota: string }> = {
  noSectorizadoGrande: {
    label: 'Privado no sectorizado — empresa grande',
    mensual: sm.noSectorizado.grande,
    nota: 'Empresas grandes (151+ trabajadores o ventas > RD$202M/año). Resol. CNS-01-2025, 2ª fase desde feb-2026.',
  },
  noSectorizadoMediana: {
    label: 'Privado no sectorizado — empresa mediana',
    mensual: sm.noSectorizado.mediana,
    nota: 'Medianas (51–150 trabajadores o ventas RD$54M–202M/año). Resol. CNS-01-2025.',
  },
  noSectorizadoPequena: {
    label: 'Privado no sectorizado — empresa pequeña',
    mensual: sm.noSectorizado.pequena,
    nota: 'Pequeñas (11–50 trabajadores o ventas RD$8M–54M/año). Resol. CNS-01-2025.',
  },
  noSectorizadoMicro: {
    label: 'Privado no sectorizado — microempresa',
    mensual: sm.noSectorizado.micro,
    nota: 'Microempresas (≤10 trabajadores o ventas ≤ RD$8M/año). Resol. CNS-01-2025.',
  },
  zonasFrancas: {
    label: 'Zonas francas',
    mensual: sm.zonasFrancas,
    nota: 'Uniforme para zonas francas (no varía por tamaño). Resol. CNS-03-2025, desde jun-2026.',
  },
  hoteleria: {
    label: 'Hotelería y turismo (hoteles/casinos grandes)',
    mensual: sm.hoteleria.hotelesCasinosGrande,
    nota: 'Hoteles y casinos de 151+ empleados. Resol. CNS-04-2025, desde jun-2026. El 10% por servicio no es salario.',
  },
  construccion: {
    label: 'Construcción (operadores de maquinaria pesada)',
    mensual: sm.construccion.operadoresMaquinaPesada,
    nota: 'Operadores de maquinaria pesada. Resol. CNS-02-2026. Otros oficios de construcción se fijan a destajo.',
  },
  publico: {
    label: 'Sector público (referencia)',
    mensual: sm.publicoReferencia,
    nota: 'Cifra de referencia del sector público (la fija el Poder Ejecutivo, estática). No es un mínimo legal indexado.',
  },
};

export function calculadoraSalarioMinimoRepublicaDominicana(i: SalarioMinimoInputs): SalarioMinimoOutputs {
  const key = i.sector && SECTORES[i.sector] ? i.sector : 'noSectorizadoGrande';
  const s = SECTORES[key];
  const mensual = s.mensual;
  const diario = mensual / REPUBLICA_DOMINICANA_2026.divisorDiario; // ÷23,83
  const hora = mensual / REPUBLICA_DOMINICANA_2026.horasMensuales;  // ÷191
  const quincenal = mensual / 2;

  const detalle = `Salario mínimo del sector "${s.label}": ${fmtDOP(mensual)} mensuales = ${fmtDOP(quincenal)} por quincena = ${fmtDOP(diario)} de jornal (÷23,83) = ${fmtDOP(hora)} la hora (÷191).`;

  const _insight = {
    title: `Salario mínimo: ${fmtDOP(mensual)} al mes`,
    text: `El salario mínimo vigente del sector **${s.label}** es de **${fmtDOP(mensual)} mensuales**, equivalentes a **${fmtDOP(diario)} de jornal diario** (mensual ÷ 23,83) y **${fmtDOP(hora)} por hora** (mensual ÷ 191). ${s.nota}`,
    tone: 'info' as const,
    icon: '💵',
  };

  // Tabla comparativa de TODOS los sectores (ordenada de mayor a menor).
  const filas = Object.values(SECTORES)
    .slice()
    .sort((a, b) => b.mensual - a.mensual)
    .map((x) => [
      x.label,
      fmtDOP(x.mensual),
      fmtDOP(x.mensual / REPUBLICA_DOMINICANA_2026.divisorDiario),
      fmtDOP(x.mensual / REPUBLICA_DOMINICANA_2026.horasMensuales),
    ]);

  const _table = {
    title: 'Salario mínimo por sector — República Dominicana 2026',
    headers: ['Sector', 'Mensual', 'Jornal (÷23,83)', 'Hora (÷191)'],
    rows: filas,
    note: 'R. D. no tiene un salario mínimo único: lo fija el CNS por sector. El jornal usa el divisor universal de nómina 23,83 y la hora el divisor 191 (Reglamento 258-93). Montos vigentes 2026 según resoluciones CNS.',
  };

  return {
    sector: s.label,
    mensual: Math.round(mensual * 100) / 100,
    quincenal: Math.round(quincenal * 100) / 100,
    diario: Math.round(diario * 100) / 100,
    hora: Math.round(hora * 100) / 100,
    mensualTexto: fmtDOP(mensual),
    quincenalTexto: fmtDOP(quincenal),
    diarioTexto: fmtDOP(diario),
    horaTexto: fmtDOP(hora),
    detalle,
    _insight,
    _table,
  };
}
