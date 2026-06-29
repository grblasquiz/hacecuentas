/**
 * Descuento de pensión alimenticia en nómina — México 2026.
 *
 * Calcula el monto a retener por pensión alimenticia (por porcentaje del neto o monto fijo),
 * el salario que queda libre, y una ALERTA de referencia cuando el descuento supera ~50%.
 *
 * ⚠️ El tope ~50% NO es una regla legal fija: el Código Civil Federal (Art. 311) ordena que la
 * pensión sea proporcional a la posibilidad del deudor y la necesidad del acreedor, y lo fija el
 * juez caso por caso. El ~50% es una práctica judicial orientativa frecuente, no un límite legal.
 * El monto y el porcentaje real los determina la sentencia. Sí es regla legal que el descuento
 * respete el salario mínimo del trabajador (LFT Art. 110 fracc. V): no puede dejarlo por debajo,
 * salvo orden judicial expresa que disponga lo contrario.
 *
 * Salario mínimo diario 2026: fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  sueldoNetoMensual: number;
  tipoDescuento: string; // 'porcentaje' | 'monto-fijo'
  valor: number;
}

export interface Outputs {
  baseDescuento: number;
  montoPension: number;
  topeAlerta: string;
  restante: number;
  detalle: string;
  _insight?: any;
}

const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');

export function descuentoPensionAlimenticiaNominaMexico(i: Inputs): Outputs {
  const sueldoNetoMensual = Number(i.sueldoNetoMensual);
  const tipo = (i.tipoDescuento || 'porcentaje').toLowerCase();
  const valor = Math.max(0, Number(i.valor) || 0);

  if (!sueldoNetoMensual || sueldoNetoMensual <= 0)
    throw new Error('Ingresá tu sueldo neto mensual');

  const baseDescuento = sueldoNetoMensual;

  let montoPension =
    tipo === 'porcentaje' ? baseDescuento * valor / 100 : valor;

  // Protección del salario mínimo (LFT Art. 110-V): no se descuenta por debajo del mínimo
  // mensual, salvo orden judicial expresa. Salario mínimo diario × 30 como referencia mensual.
  const salarioMinMensual = MEXICO_2026.salarioMinimo.generalDiario * 30;
  let protegido = false;
  if (sueldoNetoMensual <= salarioMinMensual) {
    montoPension = 0;
    protegido = true;
  }
  // El descuento tampoco puede dejar al trabajador por debajo del mínimo.
  if (!protegido && sueldoNetoMensual - montoPension < salarioMinMensual) {
    montoPension = Math.max(0, sueldoNetoMensual - salarioMinMensual);
  }

  const pct = baseDescuento > 0 ? montoPension / baseDescuento : 0;
  const restante = sueldoNetoMensual - montoPension;

  let topeAlerta: string;
  if (protegido) {
    topeAlerta = 'Sueldo ≤ salario mínimo: protegido (sin descuento salvo orden judicial expresa)';
  } else if (pct > 0.5) {
    topeAlerta = 'Supera el límite prudente habitual (~50%) — referencia, no regla legal';
  } else {
    topeAlerta = 'Dentro del rango típico (≤50%)';
  }

  const detalle =
    `Sobre un sueldo neto de ${fmt(sueldoNetoMensual)}, ` +
    (tipo === 'porcentaje'
      ? `el ${valor}% equivale a una pensión de ${fmt(montoPension)}. `
      : `la pensión fijada es de ${fmt(montoPension)}. `) +
    `Te quedan ${fmt(restante)} libres. ${topeAlerta}.`;

  let insight: any;
  if (protegido) {
    insight = {
      title: 'Salario mínimo protegido',
      text: `Tu sueldo neto (**${fmt(sueldoNetoMensual)}**) está en el nivel del salario mínimo o por debajo. La LFT (Art. 110) protege ese mínimo: **no se descuenta** salvo que una orden judicial lo disponga expresamente.`,
      tone: 'neutral' as const,
      icon: '🛡️',
    };
  } else if (pct > 0.5) {
    insight = {
      title: 'El descuento supera el ~50%',
      text: `La pensión de **${fmt(montoPension)}** es el **${(pct * 100).toFixed(0)}%** de tu neto y te dejaría **${fmt(restante)}**. El ~50% es una **referencia orientativa de la práctica judicial, no un límite legal**: el juez fija el monto según la necesidad del acreedor y tu posibilidad (Código Civil Art. 311). Si te aprieta, podés pedir revisión.`,
      tone: 'warn' as const,
      icon: '⚖️',
    };
  } else {
    insight = {
      title: 'Descuento dentro del rango típico',
      text: `La pensión de **${fmt(montoPension)}** representa el **${(pct * 100).toFixed(0)}%** de tu neto; te quedan **${fmt(restante)}**. Está dentro del rango que los jueces suelen considerar razonable (≤50% como referencia, no como tope legal).`,
      tone: 'good' as const,
      icon: '⚖️',
    };
  }

  return {
    baseDescuento: Math.round(baseDescuento * 100) / 100,
    montoPension: Math.round(montoPension * 100) / 100,
    topeAlerta,
    restante: Math.round(restante * 100) / 100,
    detalle,
    _insight: insight,
  };
}
