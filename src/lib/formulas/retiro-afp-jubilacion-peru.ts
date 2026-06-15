/**
 * Calculadora de retiro AFP 95,5% y jubilación — Perú 2026.
 *
 * Proyecta el saldo del fondo AFP a los 65 años (saldo actual + aportes futuros
 * capitalizados a una rentabilidad anual) y compara DOS opciones de la reforma
 * de pensiones (Ley 32123, Ley de Modernización del Sistema Previsional):
 *   A) Retirar el 95,5% del fondo en una sola entrega (el 4,5% va a EsSalud).
 *   B) Recibir una pensión mensual estimada (retiro programado: el fondo se
 *      distribuye a lo largo de la expectativa de vida y sigue rentando).
 *
 * Datos 2026:
 *  - 95,5% al afiliado / 4,5% a EsSalud (Ley 30425 y 30478; restituido por Ley 32123).
 *    Fuente: SBS, https://www.sbs.gob.pe/usuarios/informacion-de-pensiones/otros-beneficios-del-spp/entrega-de-hasta-el-955-del-fondo-de-pensiones
 *  - Aporte obligatorio al fondo: 10% de la remuneración. Fuente: SBS / Asociación AFP, 2026.
 *  - Edad de jubilación ordinaria: 65 años. Jubilación anticipada (REJA): 55 años.
 *    Fuente: Ley 32123, https://gestion.pe/tu-dinero/reforma-para-afp-ya-es-ley-que-pasara-con-el-retiro-del-955-y-la-jubilacion-anticipada-noticia/
 *  - El retiro del 95,5% al jubilarse aplica a quienes tenían 40 años o más al
 *    25-set-2024 (afiliados más jóvenes ya no acceden a esa opción).
 *  - Expectativa de vida a los 65 años (tablas de mortalidad SBS, vigentes desde 2019):
 *    ~22 años (hombre, ~87,5) / ~26 años (mujer, ~90,8). Fuente: SBS / El Comercio.
 */
import { fmtPEN } from '../data/peru-2026.ts';

// Aporte obligatorio al fondo de capitalización (CIC). Fuente: SBS / Asociación AFP, 2026.
const APORTE_FONDO = 0.10;
// Entrega máxima al afiliado al jubilarse (el 4,5% restante va a EsSalud).
// Fuente: SBS, Ley 30425/30478, restituido por Ley 32123, 2026.
const PORCENTAJE_RETIRO = 0.955;
const PORCENTAJE_ESSALUD = 0.045;
const EDAD_JUBILACION = 65;
// Expectativa de vida a los 65 (tablas de mortalidad SBS). Fuente: SBS / El Comercio.
const EXPECTATIVA_ANIOS = { hombre: 22, mujer: 26 } as const; // 87 / 91 años aprox.

export interface Inputs {
  saldoActual: number;       // saldo acumulado en el fondo AFP hoy (S/)
  edadActual: number;        // edad actual (años)
  aporteMensual?: number;    // aporte mensual al fondo (S/). Si falta, se deriva del sueldo
  sueldoMensual?: number;    // sueldo bruto mensual (S/), para derivar el aporte (10%)
  rentabilidadAnual?: number; // rentabilidad nominal anual del fondo (%), default 6
  sexo?: string;             // 'hombre' | 'mujer' (expectativa de vida)
}
export interface Outputs { [k: string]: any; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const saldoActual = Number(i.saldoActual) || 0;
  const edadActual = Number(i.edadActual) || 0;
  const sueldo = Number(i.sueldoMensual) || 0;
  // Aporte mensual: el que ingresa el usuario o, si no, el 10% del sueldo bruto.
  let aporteMensual = Number(i.aporteMensual);
  if (!Number.isFinite(aporteMensual) || aporteMensual <= 0) {
    aporteMensual = sueldo > 0 ? sueldo * APORTE_FONDO : 0;
  }
  const sexo = String(i.sexo || 'hombre') === 'mujer' ? 'mujer' : 'hombre';

  if (edadActual <= 0 || edadActual > 100) throw new Error('Ingresá tu edad actual (1–100)');
  if (saldoActual < 0) throw new Error('El saldo del fondo no puede ser negativo');
  if (saldoActual <= 0 && aporteMensual <= 0) {
    throw new Error('Ingresá tu saldo actual del fondo o tu sueldo/aporte mensual');
  }
  if (edadActual >= EDAD_JUBILACION) {
    throw new Error('Esta calculadora proyecta el fondo hasta los 65; ingresá una edad menor a 65');
  }

  // Rentabilidad anual del fondo (default 6% nominal, conservador para fondo mixto).
  // El form manda '' cuando el campo queda vacío, y Number('') === 0 (no NaN),
  // así que un campo vacío NO debe interpretarse como 0% sino como el default 6%.
  const rRaw = i.rentabilidadAnual;
  let rAnual = (rRaw === '' || rRaw === null || rRaw === undefined)
    ? 6
    : Number(rRaw);
  if (!Number.isFinite(rAnual) || rAnual < 0) rAnual = 6;
  const rMensual = Math.pow(1 + rAnual / 100, 1 / 12) - 1;

  const aniosFaltan = EDAD_JUBILACION - edadActual;
  const mesesFaltan = aniosFaltan * 12;

  // --- 1) Proyección del fondo a los 65 ---
  // Valor futuro del saldo actual + valor futuro de una serie de aportes mensuales.
  const fvSaldo = saldoActual * Math.pow(1 + rMensual, mesesFaltan);
  const fvAportes = rMensual > 0
    ? aporteMensual * ((Math.pow(1 + rMensual, mesesFaltan) - 1) / rMensual)
    : aporteMensual * mesesFaltan;
  const fondoProyectado = fvSaldo + fvAportes;
  const totalAportado = saldoActual + aporteMensual * mesesFaltan;
  const rendimientoGanado = fondoProyectado - totalAportado;

  // --- 2) Opción A: retiro del 95,5% ---
  const retiro955 = fondoProyectado * PORCENTAJE_RETIRO;
  const aEsSalud = fondoProyectado * PORCENTAJE_ESSALUD;

  // --- 3) Opción B: pensión mensual (retiro programado) ---
  // El fondo (100%) se distribuye durante la expectativa de vida y sigue rentando.
  // Pago mensual de una anualidad: P = Fondo · r / (1 − (1+r)^−n).
  const aniosExpectativa = EXPECTATIVA_ANIOS[sexo];
  const mesesExpectativa = aniosExpectativa * 12;
  const pensionMensual = rMensual > 0
    ? (fondoProyectado * rMensual) / (1 - Math.pow(1 + rMensual, -mesesExpectativa))
    : fondoProyectado / mesesExpectativa;
  // Cuántos años de pensión "compra" el retiro 95,5% si lo gasta a ese mismo ritmo.
  const mesesQueDuraElRetiro = pensionMensual > 0 ? retiro955 / pensionMensual : 0;

  const _insight = {
    title: 'Retirar el 95,5% vs. cobrar pensión',
    text:
      `A los 65 tu fondo proyectado sería **${fmtPEN(fondoProyectado)}**. ` +
      `Si retirás el **95,5%** recibís **${fmtPEN(retiro955)}** de una sola vez ` +
      `(${fmtPEN(aEsSalud)} van a EsSalud). ` +
      `Si en cambio elegís **pensión**, cobrarías unos **${fmtPEN(pensionMensual)}** por mes ` +
      `durante tu expectativa de vida (~${aniosExpectativa} años). ` +
      `Ese mismo monto retirado de golpe te alcanzaría ~**${(mesesQueDuraElRetiro / 12).toFixed(1)} años** ` +
      `si lo gastaras al mismo ritmo que la pensión.`,
    tone: 'neutral',
    icon: '📊',
  };

  const _chart = {
    type: 'bar',
    bars: [
      { label: 'Aportado', value: Math.round(totalAportado) },
      { label: 'Rendimiento', value: Math.round(rendimientoGanado) },
      { label: 'Retiro 95,5%', value: Math.round(retiro955) },
      { label: 'A EsSalud 4,5%', value: Math.round(aEsSalud) },
    ].filter((b) => b.value > 0),
    prefix: 'S/ ',
    ariaLabel:
      `Fondo proyectado ${fmtPEN(fondoProyectado)}: aportado ${fmtPEN(totalAportado)}, ` +
      `rendimiento ${fmtPEN(rendimientoGanado)}. Retiro del 95,5% = ${fmtPEN(retiro955)}, ` +
      `4,5% a EsSalud = ${fmtPEN(aEsSalud)}.`,
  };

  return {
    fondoProyectado: fmtPEN(fondoProyectado),
    retiro955: fmtPEN(retiro955),
    pensionMensual: fmtPEN(pensionMensual),
    aEsSalud: fmtPEN(aEsSalud),
    totalAportado: fmtPEN(totalAportado),
    rendimientoGanado: fmtPEN(rendimientoGanado),
    aniosFaltan: `${aniosFaltan} año${aniosFaltan === 1 ? '' : 's'}`,
    detalle:
      `Aporte ${fmtPEN(aporteMensual)}/mes durante ${aniosFaltan} años a ${rAnual}% anual → ` +
      `fondo ${fmtPEN(fondoProyectado)}. Retiro 95,5% = ${fmtPEN(retiro955)} · ` +
      `pensión ≈ ${fmtPEN(pensionMensual)}/mes (~${aniosExpectativa} años).`,
    _insight,
    _chart,
  };
}
