export interface Inputs {
  antiguedad_anos: number;
  dias_tomados: number;
  salario_mensual: number;
}

export interface Outputs {
  dias_vacaciones_base: number;
  dias_progresivos: number;
  dias_vacaciones_totales: number;
  dias_saldo: number;
  salario_diario: number;
  pago_vacaciones_saldo: number;
  pago_vacaciones_total: number;
}

export function compute(i: Inputs): Outputs {
  // Validación básica
  if (!i || typeof i.antiguedad_anos !== 'number' || typeof i.dias_tomados !== 'number' || typeof i.salario_mensual !== 'number') {
    return {
      dias_vacaciones_base: 0,
      dias_progresivos: 0,
      dias_vacaciones_totales: 0,
      dias_saldo: 0,
      salario_diario: 0,
      pago_vacaciones_saldo: 0,
      pago_vacaciones_total: 0
    };
  }

  const antiguedad = Math.max(0, i.antiguedad_anos);
  const diasTomados = Math.max(0, i.dias_tomados);
  const salarioMensual = Math.max(0, i.salario_mensual);

  // Fórmula CT Art. 67: 15 días base
  const diasBase = 15;

  // Días progresivos: 1 día cada 3 años después de los 10 años
  // diasProgresivos = ENTERO((antigüedad - 10) / 3) si antigüedad >= 10, sino 0
  const diasProgresivos = antiguedad >= 10 ? Math.floor((antiguedad - 10) / 3) : 0;

  // Total días de derecho
  const diasVacacionesTotales = diasBase + diasProgresivos;

  // Saldo por tomar
  const diasSaldo = Math.max(0, diasVacacionesTotales - diasTomados);

  // Salario diario: se usa divisor 30 según norma chile
  const salarioDiario = salarioMensual / 30;

  // Pago por saldo de vacaciones
  const pagoCacionesSaldo = diasSaldo * salarioDiario;

  // Pago total vacaciones año
  const pagoVacacionesTotal = diasVacacionesTotales * salarioDiario;

  return {
    dias_vacaciones_base: diasBase,
    dias_progresivos: diasProgresivos,
    dias_vacaciones_totales: diasVacacionesTotales,
    dias_saldo: diasSaldo,
    salario_diario: Math.round(salarioDiario * 100) / 100,
    pago_vacaciones_saldo: Math.round(pagoCacionesSaldo * 100) / 100,
    pago_vacaciones_total: Math.round(pagoVacacionesTotal * 100) / 100
  };
}
