export interface Inputs {
  salario_mensual: number;
  clase_riesgo: string; // 'I' | 'II' | 'III' | 'IV' | 'V' | 'VI'
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
}

export function compute(i: Inputs): Outputs {
  // Tarifas ARL 2026 Colombia por clase de riesgo (Superintendencia Financiera)
  const tarifas: { [key: string]: { valor: number; desc: string } } = {
    'I': { valor: 0.522, desc: 'Clase I - Riesgo Mínimo (0.522%). Oficinas, servicios financieros, educación' },
    'II': { valor: 1.044, desc: 'Clase II - Riesgo Bajo (1.044%). Comercio, servicios, transporte' },
    'III': { valor: 2.436, desc: 'Clase III - Riesgo Medio (2.436%). Construcción liviana, gastronomía, textiles' },
    'IV': { valor: 4.350, desc: 'Clase IV - Riesgo Alto (4.350%). Manufactura pesada, metalmecánica, química' },
    'V': { valor: 6.960, desc: 'Clase V - Riesgo Muy Alto (6.960%). Minería, explosivos, trabajo en alturas' },
    'VI': { valor: 8.700, desc: 'Clase VI - Riesgo Especial (8.700%). Actividades excepcionales reguladas' }
  };

  // Validar clase riesgo
  const claseInfo = tarifas[i.clase_riesgo] || tarifas['I'];
  const tarifaPorcentaje = claseInfo.valor;
  const numTrabajadores = i.numero_trabajadores ?? 1;

  // Calcular aportes
  const aporteEmpleadorMensual = i.salario_mensual * (tarifaPorcentaje / 100);
  const aporteEmpleadoMensual = aporteEmpleadorMensual * 0.25; // 25% de tarifa empleador
  const aporteTotalMensual = aporteEmpleadorMensual + aporteEmpleadoMensual;
  const aporteAnualEmpleador = aporteEmpleadorMensual * 12;
  const costoAnualTotalEmpresa = aporteAnualEmpleador * numTrabajadores;

  return {
    tarifa_arl: `${tarifaPorcentaje}%`,
    aporte_empleador_mensual: Math.round(aporteEmpleadorMensual * 100) / 100,
    aporte_empleado_mensual: Math.round(aporteEmpleadoMensual * 100) / 100,
    aporte_total_mensual: Math.round(aporteTotalMensual * 100) / 100,
    aporte_anual_empleador: Math.round(aporteAnualEmpleador * 100) / 100,
    costo_anual_total_empresa: Math.round(costoAnualTotalEmpresa * 100) / 100,
    clase_riesgo_desc: claseInfo.desc
  };
}
