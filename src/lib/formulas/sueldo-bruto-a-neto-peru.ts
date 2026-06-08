/** Sueldo bruto ↔ neto Perú — convierte en ambos sentidos (descuento pensión + renta 5ta). */
import { PERU_2026, impuestoRenta5taAnual, fmtPEN } from '../data/peru-2026.ts';

export interface Inputs {
  monto: number;
  direccion?: string;     // 'bruto_a_neto' | 'neto_a_bruto'
  sistemaPension?: string; // 'onp' | 'afp'
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Neto a partir de un bruto dado (mismo cálculo que sueldo-neto-peru).
function netoDeBruto(bruto: number, tasaPension: number): { neto: number; pension: number; renta: number } {
  const pension = bruto * tasaPension;
  const ingresoAnual = bruto * 14; // 12 sueldos + 2 gratificaciones
  const rentaMensual = impuestoRenta5taAnual(ingresoAnual) / 12;
  return { neto: bruto - pension - rentaMensual, pension, renta: rentaMensual };
}

export function compute(i: Inputs): Outputs {
  const monto = Number(i.monto) || 0;
  const direccion = String(i.direccion || 'bruto_a_neto') === 'neto_a_bruto' ? 'neto_a_bruto' : 'bruto_a_neto';
  const sistema = String(i.sistemaPension || 'onp') === 'afp' ? 'afp' : 'onp';
  if (monto <= 0) throw new Error('Ingresá el monto del sueldo');

  const tasaPension = sistema === 'afp' ? PERU_2026.afp.totalAprox : PERU_2026.onp;
  const nombrePension = sistema === 'afp' ? 'AFP ~12,5%' : 'ONP 13%';

  let bruto: number, neto: number, pension: number, renta: number;

  if (direccion === 'bruto_a_neto') {
    bruto = monto;
    const r = netoDeBruto(bruto, tasaPension);
    neto = r.neto; pension = r.pension; renta = r.renta;
  } else {
    // neto objetivo → bruto: bisección (la renta de 5ta hace no lineal la inversa).
    const objetivo = monto;
    let lo = objetivo, hi = objetivo * 2.5;
    // Asegurar que hi sea suficiente.
    while (netoDeBruto(hi, tasaPension).neto < objetivo && hi < objetivo * 10) hi *= 1.5;
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      if (netoDeBruto(mid, tasaPension).neto < objetivo) lo = mid; else hi = mid;
    }
    bruto = (lo + hi) / 2;
    const r = netoDeBruto(bruto, tasaPension);
    neto = r.neto; pension = r.pension; renta = r.renta;
  }

  const _insight = {
    title: direccion === 'bruto_a_neto' ? 'De bruto a neto' : 'De neto a bruto',
    text: direccion === 'bruto_a_neto'
      ? `Un sueldo bruto de **${fmtPEN(bruto)}** te deja **${fmtPEN(neto)}** en mano tras descontar **${fmtPEN(pension)}** de pensión (${nombrePension})${renta > 0 ? ` y **${fmtPEN(renta)}** de renta de 5ta` : ' (no pagás renta de 5ta)'}.`
      : `Para llevarte **${fmtPEN(neto)}** netos en mano, tu empleador debe pactar un sueldo bruto de **${fmtPEN(bruto)}**: ahí se descuentan **${fmtPEN(pension)}** de pensión (${nombrePension})${renta > 0 ? ` y **${fmtPEN(renta)}** de renta de 5ta` : ''}.`,
    tone: 'good',
    icon: '💵',
  };
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Neto', value: Math.round(neto) },
      { label: 'Pensión', value: Math.round(pension) },
      { label: 'Renta 5ta', value: Math.round(renta) },
    ].filter((s) => s.value > 0),
    prefix: 'S/ ',
    centerValue: fmtPEN(bruto),
    centerLabel: 'Sueldo bruto',
    ariaLabel: `Bruto ${fmtPEN(bruto)}, neto ${fmtPEN(neto)}, pensión ${fmtPEN(pension)}, renta de 5ta ${fmtPEN(renta)}.`,
  };

  return {
    bruto: fmtPEN(bruto),
    neto: fmtPEN(neto),
    pension: fmtPEN(pension),
    renta5ta: fmtPEN(renta),
    detalle: `Bruto ${fmtPEN(bruto)} − pensión ${fmtPEN(pension)} (${sistema === 'afp' ? 'AFP' : 'ONP'})${renta > 0 ? ` − renta 5ta ${fmtPEN(renta)}` : ''} = neto ${fmtPEN(neto)}.`,
    _insight,
    _chart,
  };
}
