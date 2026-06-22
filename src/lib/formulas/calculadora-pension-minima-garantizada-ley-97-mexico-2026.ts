/**
 * Pensión Mínima / Garantizada (PMG) Ley 97 — México 2026.
 *
 * ¿Calificás a la Pensión Garantizada y de cuánto sería?
 *   - Requisito de semanas 2026: 875 (sube 25/año hasta 1.000 en 2031) — LSS Art. 170.
 *   - Edad: 60 (cesantía en edad avanzada) o 65 (vejez).
 *   - Monto: la reforma DOF 16-dic-2020 reemplazó el monto único por una tabla por rango de
 *     SBC (en UMA), edad y semanas. Va de ~$3.500 a ~$10.600 mensuales (2026, actualizado por INPC).
 *     Acá se estima por interpolación según el SBC promedio en UMA; el monto exacto sale de la
 *     tabla del Art. 170 (SBC × edad × semanas).
 *
 * Constantes (semanas requeridas, montos PMG, UMA): fuente única src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, fmtMXN } from '../data/mexico-2026.ts';

export interface Inputs {
  semanasCotizadas?: number;       // total de semanas cotizadas
  edad?: number;                   // edad al pensionarse
  sbcPromedioMensual?: number;     // SBC promedio mensual (últimas 250 semanas)
  __lang?: string;
}

export interface Outputs {
  califica: number;                // 1 = sí, 0 = no
  pensionGarantizadaMensual: number;
  pensionGarantizadaAnual: number;
  semanasRequeridas: number;
  semanasFaltantes: number;
  sbcEnUma: number;
  motivoNoCalifica: string;
  detalle: string;
  formula: string;
  _insight?: any;
  _table?: any;
  _chart?: any;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function compute(i: Inputs): Outputs {
  const semanas = Math.max(0, Math.floor(Number(i.semanasCotizadas) || 0));
  const edad = Math.max(0, Math.floor(Number(i.edad) || 0));
  const sbcMensual = Number(i.sbcPromedioMensual);

  if (!Number.isFinite(sbcMensual) || sbcMensual <= 0) {
    throw new Error('Ingresá tu SBC promedio mensual (salario base de cotización).');
  }
  if (semanas <= 0) {
    throw new Error('Ingresá tus semanas cotizadas.');
  }

  const { pmgLey97, uma } = MEXICO_2026;
  const semanasRequeridas = pmgLey97.semanasRequeridas2026;
  const edadMinima = pmgLey97.edadCesantia; // 60 (cesantía); 65 = vejez

  // SBC promedio expresado en UMA mensuales (la tabla del Art. 170 usa el salario en UMA).
  const sbcEnUma = r2(sbcMensual / uma.mensual);

  // ── Requisitos de la Pensión Garantizada ──
  const cumpleSemanas = semanas >= semanasRequeridas;
  const cumpleEdad = edad >= edadMinima;
  const califica = cumpleSemanas && cumpleEdad;
  const semanasFaltantes = Math.max(0, semanasRequeridas - semanas);

  let motivoNoCalifica = '';
  if (!cumpleSemanas && !cumpleEdad) {
    motivoNoCalifica = `Te faltan ${semanasFaltantes} semanas y todavía no llegás a la edad mínima (${edadMinima} años).`;
  } else if (!cumpleSemanas) {
    motivoNoCalifica = `Te faltan ${semanasFaltantes} semanas (necesitás ${semanasRequeridas} en 2026).`;
  } else if (!cumpleEdad) {
    motivoNoCalifica = `Cumplís las semanas, pero te falta llegar a la edad mínima de ${edadMinima} años (cesantía) o 65 (vejez).`;
  }

  // ── Estimación del monto por interpolación según SBC en UMA ──
  // La tabla Art. 170 da más PMG a mayor SBC, edad y semanas. Modelamos el monto entre el piso
  // (~$3.500) y el techo (~$10.600) interpolando linealmente el SBC desde 1 UMA hasta ~12 UMA.
  const UMA_PISO = 1;   // SBC ≈ 1 UMA → piso de la tabla
  const UMA_TECHO = 12; // SBC ≈ 12 UMA o más → techo de la tabla
  const t = Math.min(1, Math.max(0, (sbcEnUma - UMA_PISO) / (UMA_TECHO - UMA_PISO)));
  const montoEstimado = r2(pmgLey97.montoMin + t * (pmgLey97.montoMax - pmgLey97.montoMin));

  const pensionGarantizadaMensual = califica ? montoEstimado : 0;
  const pensionGarantizadaAnual = r2(pensionGarantizadaMensual * 12); // sin aguinaldo de pensión

  const detalle = califica
    ? `Califica: ${semanas} ≥ ${semanasRequeridas} semanas y ${edad} ≥ ${edadMinima} años. ` +
      `SBC ${fmtMXN(sbcMensual)} = ${sbcEnUma} UMA → PMG estimada ${fmtMXN(pensionGarantizadaMensual)}/mes (${fmtMXN(pensionGarantizadaAnual)}/año).`
    : `No califica aún. ${motivoNoCalifica} SBC ${fmtMXN(sbcMensual)} = ${sbcEnUma} UMA.`;

  const formula = `PMG 2026 ≈ interpolación($3.500 → $10.600) según SBC en UMA (${sbcEnUma}) = ${fmtMXN(montoEstimado)}/mes ${califica ? '(calificás)' : '(no calificás aún)'}`;

  const _insight = califica
    ? {
        title: 'Calificás a la Pensión Garantizada',
        text: `Con **${semanas} semanas** y **${edad} años** cumplís los requisitos 2026 (${semanasRequeridas} semanas + ${edadMinima}/65 años). Tu SBC de **${fmtMXN(sbcMensual)}** (${sbcEnUma} UMA) ubica tu pensión garantizada estimada en **${fmtMXN(pensionGarantizadaMensual)}/mes**. Si tu AFORE alcanza para una pensión mayor por renta vitalicia o retiros programados, cobrás esa; la PMG es el **piso** que el Estado garantiza.`,
        tone: 'good' as const,
        icon: '👵',
      }
    : {
        title: 'Todavía no calificás a la PMG',
        text: `${motivoNoCalifica} ${semanasFaltantes > 0 ? `Son unos **${(semanasFaltantes / 52).toFixed(1)} años** más de cotización (o aportación voluntaria / Modalidad 40 para sumar semanas).` : 'En cuanto cumplas la edad mínima podés solicitarla.'} El requisito de semanas sube **25 por año** hasta **1.000 en 2031**, así que conviene no demorar el trámite.`,
        tone: 'warn' as const,
        icon: '👵',
      };

  const _table = {
    title: 'Pensión Garantizada Ley 97 — requisitos y monto 2026',
    headers: ['Concepto', 'Tu caso', 'Requisito / rango 2026'],
    rows: [
      ['Semanas cotizadas', String(semanas), `≥ ${semanasRequeridas} (sube 25/año → 1.000 en 2031)`],
      ['Edad', `${edad} años`, `≥ ${edadMinima} (cesantía) o 65 (vejez)`],
      ['SBC promedio', `${fmtMXN(sbcMensual)} (${sbcEnUma} UMA)`, 'A mayor SBC, mayor PMG'],
      ['¿Califica?', califica ? 'Sí ✓' : 'No', '—'],
      ['PMG mensual estimada', califica ? fmtMXN(pensionGarantizadaMensual) : '—', `${fmtMXN(MEXICO_2026.pmgLey97.montoMin)} a ${fmtMXN(MEXICO_2026.pmgLey97.montoMax)}`],
    ],
    note: 'Tabla del Art. 170 LSS (reforma DOF 16-dic-2020): la pensión garantizada depende del SBC en UMA, la edad y las semanas; va de ~$3.500 a ~$10.600 mensuales en 2026 (promedio del sistema ≈ $6.600), actualizada por INPC. El monto mostrado es una estimación por interpolación de SBC; el oficial sale del cruce exacto SBC × edad × semanas.',
  };

  const _chart = califica
    ? {
        type: 'gauge' as const,
        value: Math.round(pensionGarantizadaMensual),
        min: MEXICO_2026.pmgLey97.montoMin,
        max: MEXICO_2026.pmgLey97.montoMax,
        prefix: '$',
        label: 'PMG estimada / mes',
        ariaLabel: `Pensión garantizada estimada de ${fmtMXN(pensionGarantizadaMensual)} dentro del rango 2026.`,
      }
    : undefined;

  return {
    califica: califica ? 1 : 0,
    pensionGarantizadaMensual,
    pensionGarantizadaAnual,
    semanasRequeridas,
    semanasFaltantes,
    sbcEnUma,
    motivoNoCalifica,
    detalle,
    formula,
    _insight,
    _table,
    _chart,
  };
}
