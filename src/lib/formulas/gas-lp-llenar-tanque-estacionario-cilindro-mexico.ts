/**
 * Gas LP México — cuánto cuesta llenar el tanque estacionario (litros) o el
 * cilindro (kg). Precio SEMANAL de la CNE como default editable (CDMX, semana
 * 12-18 jul 2026: $19.56/kg y $10.56/litro). Los estacionarios se cargan a un
 * máximo de ~85% por seguridad. Constantes desde src/lib/data/mexico-2026.ts.
 */
import { GAS_LP_CDMX_JUL_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  tipoRecipiente: string;      // 'estacionario' (litros) | 'cilindro' (kg)
  capacidad: number;           // litros (estacionario) o kg (cilindro)
  nivelActualPct?: number;     // % actual del tanque (0-100)
  nivelObjetivoPct?: number;   // % objetivo (default 85 estacionario / 100 cilindro)
  precioLitro?: number;        // $/L para estacionario (default CNE CDMX)
  precioKg?: number;           // $/kg para cilindro (default CNE CDMX)
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

function num(v: unknown, d: number): number {
  if (v === '' || v === null || v === undefined) return d;
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
}

const round2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const esCilindro = String(i.tipoRecipiente || 'estacionario') === 'cilindro';
  const capacidad = num(i.capacidad, esCilindro ? 30 : 300);
  if (!(capacidad > 0)) throw new Error('Ingresa la capacidad de tu tanque o cilindro');

  const nivelActual = Math.min(100, Math.max(0, num(i.nivelActualPct, esCilindro ? 0 : 20)));
  const objetivoDefault = esCilindro ? 100 : GAS_LP_CDMX_JUL_2026.llenadoMaxEstacionario * 100;
  const nivelObjetivo = Math.min(100, Math.max(0, num(i.nivelObjetivoPct, objetivoDefault)));
  if (nivelObjetivo <= nivelActual) throw new Error('El nivel objetivo debe ser mayor que el nivel actual');

  const precioLitro = Math.max(0, num(i.precioLitro, GAS_LP_CDMX_JUL_2026.precioLitro));
  const precioKg = Math.max(0, num(i.precioKg, GAS_LP_CDMX_JUL_2026.precioKg));

  const fraccion = (nivelObjetivo - nivelActual) / 100;
  const unidades = round2(capacidad * fraccion);       // litros o kg a cargar
  const precioUnitario = esCilindro ? precioKg : precioLitro;
  const costo = round2(unidades * precioUnitario);
  const unidad = esCilindro ? 'kg' : 'L';
  // Relación física aproximada del gas LP: 1 litro ≈ 0.54 kg (así convierte la propia CNE sus dos precios).
  const kgEquivalentes = esCilindro ? unidades : round2(unidades * 0.54);

  const fmtU = (n: number) => n.toLocaleString('es-MX', { maximumFractionDigits: 1 });
  const detalle = esCilindro
    ? `Cilindro de ${fmtU(capacidad)} kg del ${fmtU(nivelActual)}% al ${fmtU(nivelObjetivo)}%: ${fmtU(unidades)} kg × ${fmtMXN(precioKg)}/kg = ${fmtMXN(costo)}.`
    : `Tanque estacionario de ${fmtU(capacidad)} L del ${fmtU(nivelActual)}% al ${fmtU(nivelObjetivo)}%: ${fmtU(unidades)} L × ${fmtMXN(precioLitro)}/L = ${fmtMXN(costo)} (~${fmtU(kgEquivalentes)} kg de gas).`;

  const sobrellenado = !esCilindro && nivelObjetivo > 90;
  const _insight = {
    title: `Llenar tu ${esCilindro ? 'cilindro' : 'tanque estacionario'} cuesta ${fmtMXN(costo)}`,
    text: `Cargar **${fmtU(unidades)} ${unidad}** (del ${fmtU(nivelActual)}% al ${fmtU(nivelObjetivo)}%) cuesta **${fmtMXN(costo)}** al precio ingresado de **${fmtMXN(precioUnitario)}/${unidad}**. ${sobrellenado ? '⚠️ Los tanques estacionarios se cargan a un **máximo de ~85%** por seguridad (el gas necesita espacio para expandirse): pocas gaseras aceptan pasar de ahí. ' : ''}El precio máximo del gas LP lo publica la **CNE cada semana** por municipio: revisa el de tu zona antes de pedir la pipa, porque el default de esta calculadora es el de CDMX.`,
    tone: sobrellenado ? 'warn' : 'neutral',
    icon: '🔥',
  };

  const _chart = {
    type: 'bar' as const,
    labels: ['Nivel actual', 'Nivel objetivo'],
    values: [Math.round(capacidad * nivelActual / 100), Math.round(capacidad * nivelObjetivo / 100)],
    suffix: esCilindro ? ' kg' : ' L',
    ariaLabel: `El tanque pasa de ${fmtU(capacidad * nivelActual / 100)} a ${fmtU(capacidad * nivelObjetivo / 100)} ${unidad}.`,
  };

  return {
    cargaNecesaria: `${fmtU(unidades)} ${unidad}${esCilindro ? '' : ` (~${fmtU(kgEquivalentes)} kg)`}`,
    costoLlenado: fmtMXN(costo),
    precioAplicado: `${fmtMXN(precioUnitario)} por ${unidad} (editable; CNE lo actualiza cada semana)`,
    detalle,
    _insight,
    _chart,
  };
}
