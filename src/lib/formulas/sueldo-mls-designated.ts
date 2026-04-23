/** Sueldo MLS Designated Player + salary cap 2025 */
export interface Inputs {
  tipoJugador: 'roster-senior' | 'dp' | 'young-dp' | 'tam' | 'minimo-supplemental';
  salarioAnualUsd: number;
  edad?: number;
}
export interface Outputs {
  salaryCapHit: number;
  cuentaParaCap: boolean;
  esDp: boolean;
  reglaAplicada: string;
  salaryCapTotal: number;
  maxBudgetCharge: number;
  mensaje: string;
}

// Cifras MLS 2025 (USD)
const SALARY_CAP = 5_470_000;
const MAX_BUDGET_CHARGE = 743_750; // DP hit máximo 2025
const MIN_SENIOR = 104_000;
const MIN_SUPPLEMENTAL = 71_401;
const YOUNG_DP_AGE = 23;

export function sueldoMlsDesignated(i: Inputs): Outputs {
  const tipo = i.tipoJugador;
  const salario = Math.max(0, Number(i.salarioAnualUsd) || 0);
  const edad = Number(i.edad) || 0;

  let capHit = 0;
  let cuentaParaCap = true;
  let esDp = false;
  let regla = '';

  switch (tipo) {
    case 'roster-senior':
      capHit = salario;
      regla = 'Jugador senior: ocupa slot del cap con el total de su salario (mínimo USD 104k).';
      if (salario > MAX_BUDGET_CHARGE) {
        regla += ` Pasa el umbral DP (USD ${MAX_BUDGET_CHARGE.toLocaleString('en-US')}): requiere designación DP.`;
      }
      break;
    case 'dp':
      capHit = MAX_BUDGET_CHARGE;
      esDp = true;
      regla = `Designated Player: sólo impacta USD ${MAX_BUDGET_CHARGE.toLocaleString('en-US')} al cap sin importar salario real (sobrante lo paga el club).`;
      break;
    case 'young-dp':
      capHit = edad <= 20 ? 200_000 : edad <= YOUNG_DP_AGE ? 400_000 : MAX_BUDGET_CHARGE;
      esDp = true;
      regla = `Young DP (${edad <= 20 ? '≤20' : '21–23'} años): hit reducido (USD ${capHit.toLocaleString('en-US')}).`;
      break;
    case 'tam':
      capHit = Math.min(salario, MAX_BUDGET_CHARGE);
      cuentaParaCap = salario <= MAX_BUDGET_CHARGE;
      regla = 'TAM (Targeted Allocation Money): el club usa TAM para bajar el hit del cap por debajo del umbral DP.';
      break;
    case 'minimo-supplemental':
      capHit = 0; // slots 21-30 no cuentan para cap
      cuentaParaCap = false;
      regla = `Supplemental roster (slots 21–30): no cuenta al cap. Mínimo USD ${MIN_SUPPLEMENTAL.toLocaleString('en-US')}.`;
      break;
  }

  return {
    salaryCapHit: Math.round(capHit),
    cuentaParaCap,
    esDp,
    reglaAplicada: regla,
    salaryCapTotal: SALARY_CAP,
    maxBudgetCharge: MAX_BUDGET_CHARGE,
    mensaje: `Cap hit: USD ${Math.round(capHit).toLocaleString('en-US')}. ${regla}`,
  };
}
