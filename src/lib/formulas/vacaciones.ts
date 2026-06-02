/**
 * Calculadora de vacaciones proporcionales Argentina
 * LCT art. 150:
 *   - Hasta 5 años de antigüedad: 14 días corridos
 *   - Entre 5 y 10 años: 21 días
 *   - Entre 10 y 20 años: 28 días
 *   - Más de 20 años: 35 días
 *
 * Proporcional: días_totales × (meses_trabajados / 12)
 */

export interface VacacionesInputs {
  antiguedadAnios: number;
  mesesTrabajados: number;
  sueldoBruto: number;
}

export interface VacacionesOutputs {
  diasCorridos: number;
  diasHabiles: number;
  montoVacaciones: number;
  valorDia: number;
  formula: string;
  _insight?: any;
  _chart?: any;
}

export function vacaciones(inputs: VacacionesInputs): VacacionesOutputs {
  const antiguedad = Number(inputs.antiguedadAnios);
  const meses = Math.min(12, Math.max(0, Number(inputs.mesesTrabajados)));
  const sueldoBruto = Number(inputs.sueldoBruto);

  if (antiguedad < 0) throw new Error('Ingresá una antigüedad válida');
  if (!meses) throw new Error('Ingresá los meses trabajados');
  if (!sueldoBruto || sueldoBruto <= 0) throw new Error('Ingresá el sueldo bruto');

  let diasTotalesAnual: number;
  if (antiguedad < 5) diasTotalesAnual = 14;
  else if (antiguedad < 10) diasTotalesAnual = 21;
  else if (antiguedad < 20) diasTotalesAnual = 28;
  else diasTotalesAnual = 35;

  const diasCorridos = Math.round((diasTotalesAnual * meses) / 12);
  const diasHabiles = Math.round(diasCorridos * 5 / 7);

  // Valor día vacacional: sueldo_bruto / 25 (LCT art 155)
  const valorDia = sueldoBruto / 25;
  const montoVacaciones = valorDia * diasCorridos;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const montoRedondeado = Math.round(montoVacaciones);

  const _insight = {
    title: 'Lo que te corresponde',
    text: `Con **${antiguedad} año${antiguedad === 1 ? '' : 's'}** de antigüedad te tocan **${diasTotalesAnual} días corridos** al año; proporcional a **${meses} mes${meses === 1 ? '' : 'es'}** trabajados son **${diasCorridos} días corridos**. A razón de sueldo/25, el cobro estimado es de **$${fmt(montoRedondeado)}**.`,
    tone: 'good' as const,
    icon: '🌴',
  };

  // Donut: días corridos = días hábiles + fines de semana
  const finesDeSemana = Math.max(0, diasCorridos - diasHabiles);
  const _chart =
    diasCorridos > 0
      ? {
          type: 'doughnut',
          slices: [
            { label: 'Días hábiles', value: diasHabiles },
            { label: 'Fines de semana', value: finesDeSemana },
          ],
          centerValue: String(diasCorridos),
          centerLabel: 'días corridos',
          ariaLabel: `De los ${diasCorridos} días corridos de vacaciones, ${diasHabiles} son hábiles y ${finesDeSemana} caen en fin de semana.`,
        }
      : undefined;

  return {
    diasCorridos,
    diasHabiles,
    montoVacaciones: montoRedondeado,
    valorDia: Math.round(valorDia),
    formula: `${diasTotalesAnual} días/año × ${meses}/12 meses = ${diasCorridos} días corridos`,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
