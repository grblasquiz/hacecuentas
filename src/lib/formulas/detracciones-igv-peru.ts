/** Detracciones SPOT Perú — depósito en cuenta del Banco de la Nación. */
import { fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  montoOperacion: number;
  tipoServicio?: string; // determina el % de detracción
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// % de detracción típicos del Sistema de Pago de Obligaciones Tributarias (SPOT).
const TASAS: Record<string, { pct: number; label: string }> = {
  intermediacion: { pct: 0.04, label: 'Intermediación laboral y tercerización' },
  arrendamiento: { pct: 0.10, label: 'Arrendamiento de bienes muebles' },
  servicios_empresariales: { pct: 0.12, label: 'Otros servicios empresariales' },
  contratos_construccion: { pct: 0.04, label: 'Contratos de construcción' },
};

export function compute(i: Inputs): Outputs {
  const monto = Number(i.montoOperacion) || 0;
  const tipo = String(i.tipoServicio || 'servicios_empresariales');
  if (monto <= 0) throw new Error('Ingresá el monto total de la operación');

  const t = TASAS[tipo] || TASAS.servicios_empresariales;
  const detraccion = monto * t.pct;
  const saldoProveedor = monto - detraccion;

  const _insight = {
    title: 'Tu detracción (SPOT)',
    text: `Sobre una operación de **${fmtPEN(monto)}** por **${t.label}** corresponde una detracción del **${(t.pct * 100).toFixed(0)}%**: **${fmtPEN(detraccion)}** que el cliente deposita en la cuenta de detracciones del **Banco de la Nación** del proveedor. El proveedor recibe directamente **${fmtPEN(saldoProveedor)}**. Las detracciones no son un impuesto extra: ese dinero se usa para pagar IGV, Renta y otros tributos.`,
    tone: 'info',
    icon: '🏦',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Saldo al proveedor', value: Math.round(saldoProveedor) },
      { label: `Detracción ${(t.pct * 100).toFixed(0)}%`, value: Math.round(detraccion) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(detraccion),
    centerLabel: 'A detraer',
    ariaLabel: `Detracción de ${fmtPEN(detraccion)} sobre una operación de ${fmtPEN(monto)}.`,
  };

  return {
    detraccion: fmtPEN(detraccion),
    saldoProveedor: fmtPEN(saldoProveedor),
    porcentaje: `${(t.pct * 100).toFixed(0)}%`,
    detalle: `Operación ${fmtPEN(monto)} · ${t.label} · ${(t.pct * 100).toFixed(0)}% = ${fmtPEN(detraccion)} a la cuenta del Banco de la Nación · saldo ${fmtPEN(saldoProveedor)}.`,
    _insight,
    _chart,
  };
}
