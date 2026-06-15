/**
 * Pensión alimenticia (Ecuador) — Tabla de Pensiones Alimenticias Mínimas 2026.
 * Fuente oficial: Ministerio de Desarrollo Humano, Acuerdo Nro. MDH-DM-2026-0005-A
 * (suscrito el 29 de enero de 2026), basado en el SBU 2026 de $482 (Ministerio del Trabajo).
 * https://www.desarrollohumano.gob.ec/wp-content/uploads/2026/02/mdh-dm-2026-0005-a.pdf
 *
 * Reglas del acuerdo aplicadas:
 *  - 6 niveles según el ingreso del alimentante expresado en SBU.
 *  - El ingreso base se toma DESCONTANDO el aporte al IESS (Art. 13, Sentencia 048-13-SCN-CC).
 *  - Para hijos de distinta edad se usa el porcentaje del de MAYOR edad (Art. 14).
 *  - Ingresos < 1 SBU: se toma 1 SBU como mínimo referencial (Disposición General Primera).
 *  - El monto total se divide entre el total de hijos del alimentante (Art. 13).
 *  - Niveles 3 a 6: el acuerdo fija un único porcentaje "para uno o más derechohabientes".
 */
import { ECUADOR_2026, fmtUSDec } from '../data/ecuador-2026.ts';

const SBU = ECUADOR_2026.sbu; // $482 (2026)

// Topes de cada nivel expresados en SBU (Art. 1, Acuerdo MDH-DM-2026-0005-A).
// nivel n cubre ingresos > (tope nivel n-1) y <= topeSBU*SBU; el nivel 6 es abierto.
type Tramo = {
  nivel: number;
  topeSBU: number | null; // null = nivel abierto (sexto)
  // porcentajes por número de derechohabientes y edad (0-2 / 3+)
  uno: { joven: number; mayor: number };
  dos: { joven: number; mayor: number };
  tres: { joven: number; mayor: number };
};

// Tabla oficial 2026 (porcentajes sobre el ingreso del alimentante, ya neto de IESS).
// En los niveles 3-6 el acuerdo establece un único porcentaje "para uno o más derechohabientes":
// por eso uno = dos = tres en esos niveles.
const TABLA: Tramo[] = [
  { nivel: 1, topeSBU: 1.25, uno: { joven: 0.2812, mayor: 0.2949 }, dos: { joven: 0.3971, mayor: 0.4313 }, tres: { joven: 0.5218, mayor: 0.5423 } },
  { nivel: 2, topeSBU: 3.0,  uno: { joven: 0.3484, mayor: 0.3696 }, dos: { joven: 0.4745, mayor: 0.4951 }, tres: { joven: 0.4745, mayor: 0.4951 } },
  { nivel: 3, topeSBU: 4.0,  uno: { joven: 0.3849, mayor: 0.4083 }, dos: { joven: 0.3849, mayor: 0.4083 }, tres: { joven: 0.3849, mayor: 0.4083 } },
  { nivel: 4, topeSBU: 6.5,  uno: { joven: 0.3979, mayor: 0.4221 }, dos: { joven: 0.3979, mayor: 0.4221 }, tres: { joven: 0.3979, mayor: 0.4221 } },
  { nivel: 5, topeSBU: 9.0,  uno: { joven: 0.4114, mayor: 0.4364 }, dos: { joven: 0.4114, mayor: 0.4364 }, tres: { joven: 0.4114, mayor: 0.4364 } },
  { nivel: 6, topeSBU: null, uno: { joven: 0.4253, mayor: 0.4512 }, dos: { joven: 0.4253, mayor: 0.4512 }, tres: { joven: 0.4253, mayor: 0.4512 } },
];

export interface Inputs {
  ingresoMensual: number;   // ingreso BRUTO mensual del alimentante (USD)
  cantidadHijos: number;    // número total de hijos del alimentante
  edadBeneficiario: number; // edad (en años) del beneficiario de mayor edad
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const ingresoBruto = Number(i.ingresoMensual);
  const hijos = Math.round(Number(i.cantidadHijos));
  const edad = Number(i.edadBeneficiario);

  if (!Number.isFinite(ingresoBruto) || ingresoBruto <= 0) throw new Error('Ingresá el ingreso mensual del alimentante');
  if (!Number.isFinite(hijos) || hijos < 1) throw new Error('Ingresá la cantidad de hijos (mínimo 1)');
  if (!Number.isFinite(edad) || edad < 0) throw new Error('Ingresá la edad del beneficiario');

  // Art. 13: el ingreso base se toma descontando el aporte personal al IESS (9,45%).
  const aporteIESS = ingresoBruto * ECUADOR_2026.iessPersonal;
  const ingresoNetoIESS = ingresoBruto - aporteIESS;

  // Disposición General Primera: si el ingreso < 1 SBU, se usa 1 SBU como mínimo referencial.
  const baseAplicada = Math.max(ingresoNetoIESS, SBU);
  const usaMinimoSBU = ingresoNetoIESS < SBU;

  // Ubicar el nivel según el ingreso base expresado en SBU.
  const ingresoEnSBU = baseAplicada / SBU;
  let tramo = TABLA[TABLA.length - 1];
  for (const t of TABLA) {
    if (t.topeSBU === null || ingresoEnSBU <= t.topeSBU) { tramo = t; break; }
  }

  // Porcentaje según cantidad de hijos (Art. 14: edad del de mayor edad → ya viene como input).
  const esMayor = edad >= 3; // 3 años en adelante
  const fila = hijos >= 3 ? tramo.tres : hijos === 2 ? tramo.dos : tramo.uno;
  const porcentaje = esMayor ? fila.mayor : fila.joven;

  // Monto total de la pensión para el conjunto de hijos.
  const montoTotal = baseAplicada * porcentaje;
  // Art. 13: el monto se divide para el total de hijos → valor por hijo.
  const montoPorHijo = montoTotal / hijos;

  const pctTexto = (porcentaje * 100).toFixed(2).replace('.', ',') + '%';
  const grupoEdad = esMayor ? '3 años en adelante' : '0 a 2 años';
  const etiquetaHijos = hijos === 1 ? '1 hijo/a' : hijos === 2 ? '2 hijos/as' : '3 o más hijos/as';

  const _insight = {
    title: `Pensión mínima — Nivel ${tramo.nivel}`,
    text: `Con un ingreso de **${fmtUSDec(ingresoBruto)}** (base de cálculo **${fmtUSDec(baseAplicada)}** tras descontar el IESS), ${hijos} hijo/s y beneficiario de **${grupoEdad}**, la pensión alimenticia **mínima** según la tabla 2026 es **${fmtUSDec(montoTotal)}** en total (**${pctTexto}** del ingreso). Eso equivale a **${fmtUSDec(montoPorHijo)}** por hijo. Es el piso legal: el juez puede fijar un valor mayor, nunca menor.`,
    tone: 'neutral',
    icon: '👨‍👩‍👧',
  };

  const _chart = {
    type: 'donut',
    segments: [
      { label: `Pensión alimenticia (${pctTexto})`, value: Math.round(montoTotal * 100) / 100 },
      { label: 'Resto del ingreso del alimentante', value: Math.round((baseAplicada - montoTotal) * 100) / 100 },
    ],
    ariaLabel: `Pensión mínima ${fmtUSDec(montoTotal)} sobre una base de ${fmtUSDec(baseAplicada)}.`,
  };

  return {
    pensionMinima: fmtUSDec(montoTotal),
    montoPorHijo: fmtUSDec(montoPorHijo),
    porcentaje: pctTexto,
    nivel: `Nivel ${tramo.nivel}`,
    baseCalculo: fmtUSDec(baseAplicada),
    aporteIESS: fmtUSDec(aporteIESS),
    detalle: `Nivel ${tramo.nivel} · ${etiquetaHijos} · ${grupoEdad} → ${pctTexto} de ${fmtUSDec(baseAplicada)} = ${fmtUSDec(montoTotal)} (${fmtUSDec(montoPorHijo)} por hijo)${usaMinimoSBU ? ' · Se aplicó 1 SBU como mínimo referencial (ingreso bajo 1 SBU).' : ''}`,
    _insight,
    _chart,
  };
}
