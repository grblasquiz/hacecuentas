/**
 * Costo de la universidad privada en Ecuador (USD — país dolarizado).
 *
 * Suma matrícula + arancel/pensión por semestre a lo largo de toda la carrera,
 * con descuento opcional por beca (% aplicado al arancel del período).
 *
 * Esquemas reales: USFQ cobra arancel por semestre regular (~$4.440–$5.862) más
 * matrícula (~$441–$584); UDLA/PUCE cobran arancel del período + matrícula.
 * Para el alumno lo comparable es el costo POR SEMESTRE, así que el cálculo parte
 * de ahí (no del crédito suelto, que solo aplica a carga parcial en algunas U).
 * Fuentes en src/lib/data/ecuador-2026.ts (UNIVERSIDADES_PRIVADAS_EC_2026).
 */
import { fmtUSDec } from '../data/ecuador-2026.ts';

export interface Inputs {
  /** Arancel / pensión por semestre (USD). En USFQ es el "arancel"; en UDLA/PUCE el arancel del período. */
  aranceleSemestre: number;
  /** Número de semestres de la carrera (pregrado ≈ 8–10; medicina hasta 12). */
  semestres: number;
  /** Matrícula que se paga cada semestre (USD). Opcional, default 0. */
  matriculaSemestre?: number;
  /** Beca o descuento sobre el arancel (% de 0 a 100). Opcional, default 0. */
  becaPct?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _chart?: any;
}

function num(v: unknown): number {
  if (v === '' || v === null || v === undefined) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function compute(i: Inputs): Outputs {
  const arancel = num(i.aranceleSemestre);
  const semestres = num(i.semestres);
  const matricula = num(i.matriculaSemestre);
  let becaPct = num(i.becaPct);

  if (arancel <= 0) throw new Error('Ingresá el arancel o pensión por semestre');
  if (semestres <= 0) throw new Error('Ingresá el número de semestres de la carrera');
  // Acotar la beca a [0, 100] para evitar montos negativos.
  if (becaPct < 0) becaPct = 0;
  if (becaPct > 100) becaPct = 100;

  const beca = becaPct / 100;
  const arancelConBeca = arancel * (1 - beca);          // pensión efectiva por semestre tras la beca
  const ahorroBecaSemestre = arancel - arancelConBeca;  // lo que descuenta la beca cada semestre

  // Costo de un semestre (lo que pagás cada período)
  const costoSemestre = arancelConBeca + matricula;

  // Totales a lo largo de la carrera
  const arancelTotal = arancelConBeca * semestres;
  const matriculaTotal = matricula * semestres;
  const ahorroBecaTotal = ahorroBecaSemestre * semestres;
  const costoTotal = arancelTotal + matriculaTotal;

  // Equivalencias útiles
  const costoAnual = costoSemestre * 2;                  // 2 semestres por año académico
  const anos = semestres / 2;
  const mesesCarrera = anos * 12;
  const costoMensualizado = mesesCarrera > 0 ? costoTotal / mesesCarrera : 0;

  const _insight = {
    title: 'Lo que cuesta la carrera completa',
    text:
      `Terminar la carrera en **${semestres} semestre${semestres === 1 ? '' : 's'}** ` +
      `(~${anos % 1 === 0 ? anos : anos.toFixed(1)} año${anos === 1 ? '' : 's'}) sale **${fmtUSDec(costoTotal)}**: ` +
      `pagás unos **${fmtUSDec(costoSemestre)}** por semestre (~${fmtUSDec(costoMensualizado)}/mes prorrateado).` +
      (becaPct > 0
        ? ` La beca del **${becaPct}%** te ahorra **${fmtUSDec(ahorroBecaTotal)}** en toda la carrera.`
        : ` Sin beca; un descuento del 25% bajaría el total a ${fmtUSDec((arancel * 0.75 + matricula) * semestres)}.`),
    tone: 'neutral' as const,
    icon: '🎓',
  };

  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'Aranceles/pensiones', value: Math.round(arancelTotal * 100) / 100 },
      { label: 'Matrículas', value: Math.round(matriculaTotal * 100) / 100 },
    ],
    prefix: '$',
    centerValue: fmtUSDec(costoTotal),
    centerLabel: 'Costo total',
    ariaLabel: `Costo total de la carrera ${fmtUSDec(costoTotal)}: aranceles ${fmtUSDec(arancelTotal)} y matrículas ${fmtUSDec(matriculaTotal)}.`,
  };

  return {
    costoTotal: fmtUSDec(costoTotal),
    costoSemestre: fmtUSDec(costoSemestre),
    costoAnual: fmtUSDec(costoAnual),
    costoMensualizado: fmtUSDec(costoMensualizado),
    arancelTotal: fmtUSDec(arancelTotal),
    matriculaTotal: fmtUSDec(matriculaTotal),
    ahorroBeca: fmtUSDec(ahorroBecaTotal),
    detalle:
      `${semestres} semestres × (arancel ${fmtUSDec(arancelConBeca)} + matrícula ${fmtUSDec(matricula)}) = ${fmtUSDec(costoTotal)}.` +
      (becaPct > 0 ? ` Beca ${becaPct}% aplicada (ahorro ${fmtUSDec(ahorroBecaTotal)}).` : ''),
    _insight,
    _chart,
  };
}
