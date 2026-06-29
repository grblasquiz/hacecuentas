/**
 * Finiquito por renuncia voluntaria — Chile.
 * En la renuncia voluntaria NO hay indemnización por años de servicio (IAS) ni
 * indemnización sustitutiva del aviso previo. El finiquito se compone de:
 *   1) remuneración por los días trabajados del mes en curso, y
 *   2) feriado proporcional (vacaciones no tomadas).
 * Feriado legal: 15 días HÁBILES por año (Art. 67 CT) = 1,25 días hábiles por mes.
 * El feriado se cuenta en días hábiles pero se paga en días corridos: se convierte
 * multiplicando por 7/5 (Art. 69 y 73 CT — incluye los días corridos del período).
 */

export interface Inputs {
  sueldoMensual: number;
  diasTrabajadosMes: number;
  mesesDesdeUltimoFeriado: number;
}

export interface Outputs {
  remuneracionDias: number;
  vacacionesProp: number;
  totalFiniquito: number;
  _insight?: any;
  _table?: any;
}

export function compute(i: Inputs): Outputs {
  const sueldo = Math.max(0, i.sueldoMensual || 0);
  const diasMes = Math.max(0, i.diasTrabajadosMes || 0);
  const meses = Math.max(0, i.mesesDesdeUltimoFeriado || 0);

  const valorDia = sueldo / 30;
  const remuneracionDias = Math.round(valorDia * diasMes);

  const diasFeriadoHabiles = 1.25 * meses;       // 15 hábiles/año = 1,25/mes
  const diasCorridos = diasFeriadoHabiles * (7 / 5); // hábiles → corridos
  const vacacionesProp = Math.round(valorDia * diasCorridos);

  const totalFiniquito = remuneracionDias + vacacionesProp;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');

  const _insight = {
    title: 'Finiquito por renuncia voluntaria',
    text: `Te corresponden **${fmt(remuneracionDias)}** por los ${diasMes} días trabajados del mes y **${fmt(vacacionesProp)}** de feriado proporcional (${diasFeriadoHabiles.toLocaleString('es-CL')} días hábiles = ${diasCorridos.toLocaleString('es-CL')} días corridos). Total: **${fmt(totalFiniquito)}**. En la renuncia no hay indemnización por años de servicio ni aviso previo.`,
    tone: 'info' as const,
    icon: '📄',
  };

  // Tabla: feriado proporcional según meses desde el último feriado completo.
  const filasMeses = [3, 6, 9, 12];
  if (meses > 0 && !filasMeses.includes(meses)) filasMeses.push(meses);
  filasMeses.sort((a, b) => a - b);
  const rows = filasMeses.map((m) => {
    const hab = 1.25 * m;
    const corr = hab * (7 / 5);
    const monto = Math.round(valorDia * corr);
    return [
      `${m} mes${m === 1 ? '' : 'es'}${m === meses ? ' (tu caso)' : ''}`,
      `${hab.toLocaleString('es-CL')} días`,
      `${corr.toLocaleString('es-CL')} días`,
      fmt(monto),
    ];
  });
  const _table = {
    title: `Feriado proporcional según antigüedad (sueldo ${fmt(sueldo)})`,
    headers: ['Meses desde último feriado', 'Días hábiles', 'Días corridos', 'A pagar'],
    align: ['left', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows,
    note: 'Feriado legal: 15 días hábiles por año = 1,25 por mes (Art. 67 CT). Se cuenta en días hábiles y se paga en días corridos (×7/5, Art. 69 CT). En la renuncia voluntaria no hay IAS ni aviso previo.',
  };

  return { remuneracionDias, vacacionesProp, totalFiniquito, _insight, _table };
}
