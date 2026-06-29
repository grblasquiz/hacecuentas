/**
 * Empleada doméstica — PARAGUAY 2026.
 * Calcula el sueldo bruto según la modalidad de contratación, los aportes al IPS
 * (obrero 9% / patronal 16,5%), el neto que cobra la trabajadora y el costo total
 * para el empleador.
 *
 * Desde la Ley N° 5407/15 (Del Trabajo Doméstico, modificada por Ley 6338/19) el
 * personal doméstico tiene derecho al 100% del salario mínimo legal y a la afiliación
 * obligatoria al IPS con los mismos porcentajes que el resto de los trabajadores.
 *
 * Modalidades:
 *   mensual  → bruto = SMV
 *   jornal   → bruto = jornal mínimo × días trabajados
 *   por-hora → bruto = valor ingresado tomado como sueldo bruto del período
 *   parcial  → bruto = SMV × (horas semanales / 48)   (jornada legal = 48 h/sem)
 *
 * Datos (SMV, jornal, IPS) desde src/lib/data/paraguay-2026.ts.
 * Fuente: MTESS (Ley 5407/15), IPS.
 */
import { PARAGUAY_2026, fmtPYG } from '../data/paraguay-2026';

export interface EmpleadaDomesticaParaguayInputs {
  modalidad?: string;            // 'mensual' | 'jornal' | 'por-hora' | 'parcial'
  valor?: number | string;      // monto base (opcional; según modalidad)
  dias?: number | string;       // días trabajados (modalidad jornal)
  horasSemana?: number | string; // horas semanales (modalidad parcial)
  pagaAguinaldo?: string;       // 'si' | 'no'
  SMV?: number | string;        // salario mínimo de referencia (default 3.044.000)
}

export interface EmpleadaDomesticaParaguayOutputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

export function empleadaDomesticaParaguay(i: EmpleadaDomesticaParaguayInputs): EmpleadaDomesticaParaguayOutputs {
  const JORNAL = PARAGUAY_2026.jornalMinimo; // 117.077
  const SMV = Math.max(0, Number(i.SMV) || PARAGUAY_2026.salarioMinimo); // 3.044.000
  const modalidad = (i.modalidad || 'mensual').toString();
  const valor = Math.max(0, Number(i.valor) || 0);
  const dias = Math.max(0, Number(i.dias) || 0);
  const horasSemana = Math.max(0, Number(i.horasSemana) || 0);
  const pagaAguinaldo = (i.pagaAguinaldo || 'no').toString() === 'si';

  let bruto = 0;
  let baseDesc = '';
  if (modalidad === 'mensual') {
    bruto = valor > 0 ? valor : SMV;
    baseDesc = `sueldo mensual de ${fmtPYG(bruto)}`;
  } else if (modalidad === 'jornal') {
    if (dias <= 0) throw new Error('Ingresá la cantidad de días trabajados');
    const jornalUsado = valor > 0 ? valor : JORNAL;
    bruto = jornalUsado * dias;
    baseDesc = `${dias} jornales de ${fmtPYG(jornalUsado)}`;
  } else if (modalidad === 'por-hora') {
    if (valor <= 0) throw new Error('Ingresá el monto del período (por hora)');
    bruto = valor;
    baseDesc = `monto del período de ${fmtPYG(bruto)}`;
  } else if (modalidad === 'parcial') {
    if (horasSemana <= 0) throw new Error('Ingresá las horas semanales');
    bruto = SMV * (horasSemana / 48);
    baseDesc = `${horasSemana} h/semana proporcional al SMV (48 h)`;
  } else {
    bruto = valor > 0 ? valor : SMV;
    baseDesc = `sueldo mensual de ${fmtPYG(bruto)}`;
  }

  if (bruto <= 0) throw new Error('No se pudo determinar el sueldo bruto: revisá los datos');

  const tasaObrero = PARAGUAY_2026.ips.obrero;     // 0.09
  const tasaPatronal = PARAGUAY_2026.ips.patronal; // 0.165
  const aporteObrero = bruto * tasaObrero;
  const aportePatronal = bruto * tasaPatronal;
  const aguinaldoProp = pagaAguinaldo ? bruto / 12 : 0;
  const netoTrabajadora = bruto - aporteObrero + aguinaldoProp;
  const costoEmpleador = bruto + aportePatronal;

  const _insight = {
    type: 'highlight' as const,
    icon: '🧹',
    text:
      `Sobre un bruto de **${fmtPYG(bruto)}** (${baseDesc}), a la trabajadora se le descuenta **${fmtPYG(aporteObrero)}** de IPS (9%)` +
      (aguinaldoProp > 0 ? ` y se le suma **${fmtPYG(aguinaldoProp)}** de aguinaldo proporcional` : '') +
      `: cobra **${fmtPYG(netoTrabajadora)}**. Para el empleador el costo total es **${fmtPYG(costoEmpleador)}** (bruto + 16,5% patronal).`,
  };

  const _table = {
    title: 'Desglose de costos — trabajo doméstico (Paraguay)',
    headers: ['Concepto', 'Monto'],
    rows: [
      ['Sueldo bruto', fmtPYG(bruto)],
      [`Aporte IPS obrero (${(tasaObrero * 100).toFixed(0)}%)`, '− ' + fmtPYG(aporteObrero)],
      ['Aguinaldo proporcional (1/12)', (aguinaldoProp > 0 ? '+ ' : '') + fmtPYG(aguinaldoProp)],
      ['Neto que cobra la trabajadora', fmtPYG(netoTrabajadora)],
      [`Aporte IPS patronal (${(tasaPatronal * 100).toFixed(1)}%)`, '+ ' + fmtPYG(aportePatronal)],
      ['Costo total para el empleador', fmtPYG(costoEmpleador)],
    ],
    note: `El trabajo doméstico tiene derecho al 100% del salario mínimo (Ley 5407/15) y a la afiliación obligatoria al IPS. El aporte obrero (9%) sale del sueldo; el patronal (16,5%) lo paga el empleador aparte. El aguinaldo (1/12 de lo percibido en el año) se paga antes del 31 de diciembre.`,
  };

  return {
    sueldoBruto: Math.round(bruto),
    aporteObrero: Math.round(aporteObrero),
    aportePatronal: Math.round(aportePatronal),
    netoTrabajadora: Math.round(netoTrabajadora),
    costoEmpleador: Math.round(costoEmpleador),
    resumen: `${baseDesc} → bruto ${fmtPYG(bruto)}, neto ${fmtPYG(netoTrabajadora)}, costo empleador ${fmtPYG(costoEmpleador)}`,
    _insight,
    _table,
  };
}
