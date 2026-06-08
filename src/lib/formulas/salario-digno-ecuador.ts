/** Salario digno (Ecuador) — costo de la canasta básica familiar ÷ número de perceptores (1,6).
 *  Se compara con el ingreso anual del trabajador (13 componentes: 12 sueldos + décimos + fondos + utilidades). */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  ingresoMensual: number;
  decimos?: number;     // total anual de décimo tercero + décimo cuarto (opcional)
  utilidades?: number;  // utilidades recibidas en el año (opcional)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

// Parámetros referenciales del salario digno (Ministerio del Trabajo).
const CANASTA_BASICA_FAMILIAR = 815;  // costo mensual aprox. de la canasta básica familiar (USD)
const PERCEPTORES = 1.6;              // número de perceptores del hogar

export function compute(i: Inputs): Outputs {
  const ingreso = Number(i.ingresoMensual) || 0;
  // '' → default 0.
  const decimos = Math.max(0, Number(i.decimos) || 0);
  const utilidades = Math.max(0, Number(i.utilidades) || 0);
  if (ingreso <= 0) throw new Error('Ingresá tu ingreso mensual');

  // Salario digno mensual = canasta básica familiar ÷ perceptores.
  const salarioDignoMensual = CANASTA_BASICA_FAMILIAR / PERCEPTORES;
  const salarioDignoAnual = salarioDignoMensual * 12;

  // Ingreso anual del trabajador (componentes del salario digno):
  // 12 sueldos + décimos (13º y 14º) + fondos de reserva + utilidades.
  const sueldosAnuales = ingreso * 12;
  const decimoTercero = sueldosAnuales / 12;          // estimación si no se ingresan los décimos
  const decimoCuarto = ECUADOR_2026.decimoCuarto;
  const decimosCalc = decimos > 0 ? decimos : decimoTercero + decimoCuarto;
  const fondosReserva = sueldosAnuales * ECUADOR_2026.fondosReserva;
  const ingresoAnualTotal = sueldosAnuales + decimosCalc + fondosReserva + utilidades;
  const ingresoMensualEquivalente = ingresoAnualTotal / 12;

  const alcanza = ingresoMensualEquivalente >= salarioDignoMensual;
  const brecha = salarioDignoMensual - ingresoMensualEquivalente;

  const _insight = {
    title: alcanza ? 'Alcanzás el salario digno' : 'No alcanzás el salario digno',
    text: alcanza
      ? `Tu ingreso mensual equivalente (sumando décimos, fondos de reserva y utilidades) es de **${fmtUSDec(ingresoMensualEquivalente)}**, por encima del salario digno de **${fmtUSDec(salarioDignoMensual)}**. Tu empleador no debe compensación adicional por este concepto.`
      : `Tu ingreso mensual equivalente es de **${fmtUSDec(ingresoMensualEquivalente)}**, por debajo del salario digno de **${fmtUSDec(salarioDignoMensual)}**. La brecha es de **${fmtUSDec(brecha)}** mensuales (${fmtUSDec(brecha * 12)} al año). Si la empresa tuvo utilidades, podría corresponder una compensación. Verificá con el Ministerio del Trabajo.`,
    tone: alcanza ? 'good' : 'warning',
    icon: '⚖️',
  };
  const _chart = {
    type: 'gauge',
    value: Math.round(ingresoMensualEquivalente * 100) / 100,
    min: 0,
    max: Math.round(Math.max(salarioDignoMensual, ingresoMensualEquivalente) * 1.2 * 100) / 100,
    label: fmtUSDec(ingresoMensualEquivalente),
    ariaLabel: `Ingreso mensual equivalente ${fmtUSDec(ingresoMensualEquivalente)} frente a salario digno ${fmtUSDec(salarioDignoMensual)}.`,
  };

  return {
    salarioDignoMensual: fmtUSDec(salarioDignoMensual),
    salarioDignoAnual: fmtUSDec(salarioDignoAnual),
    ingresoMensualEquivalente: fmtUSDec(ingresoMensualEquivalente),
    ingresoAnualTotal: fmtUSDec(ingresoAnualTotal),
    alcanza: alcanza ? 'Sí' : 'No',
    detalle: `Salario digno mensual ${fmtUSDec(salarioDignoMensual)} (canasta ${fmtUSDec(CANASTA_BASICA_FAMILIAR)} ÷ ${PERCEPTORES} perceptores). Tu ingreso equivalente: ${fmtUSDec(ingresoMensualEquivalente)}.`,
    _insight,
    _chart,
  };
}
