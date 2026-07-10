import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  salario_mensual: number;
  clase_riesgo: string; // 'I' | 'II' | 'III' | 'IV' | 'V'
  actividad_riesgo?: string;
  numero_trabajadores?: number;
}

export interface Outputs {
  tarifa_arl: string;
  aporte_empleador_mensual: number;
  aporte_empleado_mensual: number;
  aporte_total_mensual: number;
  aporte_anual_empleador: number;
  costo_anual_total_empresa: number;
  clase_riesgo_desc: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Tarifas ARL por clase de riesgo (Decreto 1772/1994, tabla vigente 2026) — desde la tabla maestra.
  // Solo existen 5 clases de riesgo (I a V) en el Sistema General de Riesgos Laborales.
  const arl = COLOMBIA_2026.aportes.arl; // { I: 0.00522, II: 0.01044, III: 0.02436, IV: 0.0435, V: 0.0696 }
  const descripciones: { [key: string]: string } = {
    I: 'Clase I - Riesgo Mínimo (0,522%). Oficinas, servicios financieros, educación',
    II: 'Clase II - Riesgo Bajo (1,044%). Comercio, servicios, transporte',
    III: 'Clase III - Riesgo Medio (2,436%). Construcción liviana, gastronomía, textiles',
    IV: 'Clase IV - Riesgo Alto (4,350%). Manufactura pesada, metalmecánica, química',
    V: 'Clase V - Riesgo Máximo (6,960%). Minería, explosivos, trabajo en alturas',
  };
  const actividadAClase: Record<string, string> = {
    oficina_servicios: 'I',
    comercio_restaurante: 'II',
    transporte_pasajeros: 'II',
    salud_asistencial: 'III',
    construccion_liviana: 'III',
    manufactura_metalmecanica: 'IV',
    trabajo_alturas: 'V',
    mineria_explosivos: 'V',
  };

  const claseSugerida = actividadAClase[String(i.actividad_riesgo || '')];
  const claseBase = claseSugerida || i.clase_riesgo;
  const clase = (arl as Record<string, number>)[claseBase] !== undefined ? claseBase : 'I';
  const tarifa = (arl as Record<string, number>)[clase];
  const tarifaPorcentaje = Math.round(tarifa * 100000) / 1000; // ej. 0.522
  const numTrabajadores = i.numero_trabajadores === undefined || i.numero_trabajadores === null || (i.numero_trabajadores as any) === ''
    ? 1
    : Math.max(1, Number(i.numero_trabajadores));
  const salario = Math.max(0, Number(i.salario_mensual) || 0);

  // El aporte ARL está 100% a cargo del empleador (Decreto-Ley 1295/1994 art. 16; Ley 1562/2012).
  // Al trabajador dependiente NO se le descuenta nada por ARL.
  const aporteEmpleadorMensual = salario * tarifa;
  const aporteEmpleadoMensual = 0;
  const aporteTotalMensual = aporteEmpleadorMensual + aporteEmpleadoMensual;
  const aporteAnualEmpleador = aporteEmpleadorMensual * 12;
  const costoAnualTotalEmpresa = aporteAnualEmpleador * numTrabajadores;

  const fmtCOP = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const empleadorR = Math.round(aporteEmpleadorMensual * 100) / 100;
  const totalMensualR = Math.round(aporteTotalMensual * 100) / 100;
  const anualEmpleadorR = Math.round(aporteAnualEmpleador * 100) / 100;
  const costoAnualR = Math.round(costoAnualTotalEmpresa * 100) / 100;

  const claseAlta = ['IV', 'V'].includes(clase);
  const _insight = {
    title: `Costo ARL — Clase de riesgo ${clase}`,
    text: `Con una tarifa de **${tarifaPorcentaje}%** sobre un salario de **${fmtCOP(salario)}**, el aporte a la ARL es **${fmtCOP(totalMensualR)}/mes**, pagado **100% por el empleador** (al trabajador no se le descuenta nada). ${claseSugerida ? `La actividad elegida sugiere **Clase ${clase}**; confirmala contra el CIIU y tu ARL.` : 'Si conocés la actividad, usá el selector para sugerir la clase de riesgo.'} Para ${numTrabajadores} trabajador${numTrabajadores === 1 ? '' : 'es'}, el costo anual de la empresa llega a **${fmtCOP(costoAnualR)}**.${claseAlta ? ' Es una **clase de riesgo alta**: la tarifa pesa fuerte en la nómina.' : ''}`,
    tone: claseAlta ? 'warn' : 'neutral',
    icon: '🦺',
  };

  const _chart = totalMensualR <= 0 ? undefined : {
    type: 'doughnut',
    slices: [
      { label: 'Salario mensual', value: Math.round(salario) },
      { label: 'Aporte ARL (empleador)', value: empleadorR },
    ],
    prefix: '$',
    centerValue: `${tarifaPorcentaje}%`,
    centerLabel: 'tarifa ARL',
    ariaLabel: `El aporte ARL mensual de ${fmtCOP(totalMensualR)} equivale al ${tarifaPorcentaje}% del salario de ${fmtCOP(salario)} y lo paga íntegramente el empleador.`,
  };

  return {
    tarifa_arl: `${tarifaPorcentaje}%`,
    aporte_empleador_mensual: empleadorR,
    aporte_empleado_mensual: aporteEmpleadoMensual,
    aporte_total_mensual: totalMensualR,
    aporte_anual_empleador: anualEmpleadorR,
    costo_anual_total_empresa: costoAnualR,
    clase_riesgo_desc: descripciones[clase],
    _insight,
    _chart
  };
}
