/**
 * Calculadora de IVA Uruguay 2026 (22% básica y 10% mínima).
 *
 * Conversor bidireccional:
 *   - sin IVA → con IVA: base × (1 + tasa)
 *   - con IVA → sin IVA: total ÷ (1 + tasa)
 *
 * Tasas DGI 2026 (importadas, no hardcodeadas):
 *   - Básica 22% (mayoría de bienes y servicios)
 *   - Mínima 10% (alimentos de la canasta, medicamentos, salud, hotelería, etc.)
 */
import { URUGUAY_2026, fmtUYU } from '../data/uruguay-2026';

export interface Inputs {
  /** Monto base en pesos. */
  monto: number;
  /** Tasa de IVA: "basica" (22%) o "minima" (10%). */
  tasa: string;
  /** Dirección: "sin_a_con" (agregar IVA) o "con_a_sin" (descontar IVA). */
  direccion: string;
}

export interface Outputs {
  tasa_aplicada: number;
  monto_iva: number;
  precio_sin_iva: number;
  precio_con_iva: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

export function calculadoraIvaUruguay(i: Inputs): Outputs {
  const tasa = i.tasa === 'minima' ? URUGUAY_2026.iva.minima : URUGUAY_2026.iva.basica;
  const monto = Math.max(0, Number(i.monto) || 0);
  const agregar = i.direccion !== 'con_a_sin'; // default: sin → con

  if (monto <= 0) {
    return {
      tasa_aplicada: tasa,
      monto_iva: 0,
      precio_sin_iva: 0,
      precio_con_iva: 0,
      desglose: '—',
      nota: 'Ingresá un monto para calcular el IVA.',
    };
  }

  let sinIva: number;
  let conIva: number;
  if (agregar) {
    sinIva = monto;
    conIva = monto * (1 + tasa);
  } else {
    conIva = monto;
    sinIva = monto / (1 + tasa);
  }
  const montoIva = conIva - sinIva;

  const tasaTxt = `${(tasa * 100).toFixed(0)}%`;
  const desglose = agregar
    ? `${fmtUYU(sinIva)} (neto) + ${fmtUYU(montoIva)} (IVA ${tasaTxt}) = ${fmtUYU(conIva)} (final)`
    : `${fmtUYU(conIva)} (final) − ${fmtUYU(montoIva)} (IVA ${tasaTxt}) = ${fmtUYU(sinIva)} (neto)`;

  return {
    tasa_aplicada: tasa,
    monto_iva: Math.round(montoIva * 100) / 100,
    precio_sin_iva: Math.round(sinIva * 100) / 100,
    precio_con_iva: Math.round(conIva * 100) / 100,
    desglose,
    nota: 'El IVA en Uruguay no tiene tramos: es 22% básica o 10% mínima. La tasa mínima cubre alimentos esenciales, medicamentos, servicios de salud y hotelería. Exportaciones y algunos rubros están exentos (tasa 0%).',
    _insight: {
      type: 'highlight',
      icon: '💡',
      text: agregar
        ? `Sobre ${fmtUYU(sinIva)} netos, el IVA al ${tasaTxt} agrega ${fmtUYU(montoIva)}: el precio final es ${fmtUYU(conIva)}.`
        : `De ${fmtUYU(conIva)} con IVA incluido (${tasaTxt}), el neto es ${fmtUYU(sinIva)} y el IVA contenido ${fmtUYU(montoIva)}.`,
    },
    _table: {
      title: 'IVA Uruguay 2026 — neto, IVA y total para montos frecuentes',
      headers: ['Neto (pesos)', `IVA 22% → total`, `IVA 10% → total`],
      rows: [1000, 5000, 10000, 25000, 50000, 100000].map((base) => [
        fmtUYU(base),
        `${fmtUYU(base * URUGUAY_2026.iva.basica)} → ${fmtUYU(base * (1 + URUGUAY_2026.iva.basica))}`,
        `${fmtUYU(base * URUGUAY_2026.iva.minima)} → ${fmtUYU(base * (1 + URUGUAY_2026.iva.minima))}`,
      ]),
      note: 'Tasa básica 22% y mínima 10% (DGI 2026). Para extraer el IVA de un precio final, dividí por 1,22 (o 1,10). Fórmula: total = neto × (1 + tasa).',
    },
  };
}
