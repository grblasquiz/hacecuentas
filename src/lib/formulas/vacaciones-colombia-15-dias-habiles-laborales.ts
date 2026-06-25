export interface Inputs {
  salario_mensual: number;
  meses_trabajados: number;
  anos_servicio: number;
  dias_vacaciones_tomadas: number;
  dias_acumulados_anteriores: number;
}

export interface Outputs {
  dias_vacaciones_anuales: number;
  dias_vacaciones_proporcional: number;
  dias_vacaciones_disponibles: number;
  dias_vacaciones_pendientes: number;
  dias_acumulados_total: number;
  dias_acumulados_legales: number;
  pago_vacaciones_dias_tomados: number;
  pago_vacaciones_pendientes: number;
  pago_total_vacaciones: number;
  advertencia_limite: string;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Constantes CST 2026 Colombia
const DIAS_VACACIONES_POR_ANO = 15; // CST art. 186
const LIMITE_ACUMULACION_DIAS = 30; // Máximo legal (2 años)
const DIAS_MES = 30; // Para cálculo de valor diario
const MESES_ANO = 12;

// Helper puro: misma lógica que produce el resultado principal y cada fila de la tabla.
// NO cambia ninguna constante ni regla; sólo encapsula el cálculo existente.
function calcularVacaciones(args: {
  salario: number;
  meses: number;
  anos: number;
  tomados: number;
  acumulados_ant: number;
}) {
  const salario = Math.max(0, args.salario);
  const meses = Math.max(0, Math.min(args.meses, MESES_ANO));
  const anos = Math.max(0, args.anos);
  const tomados = Math.max(0, args.tomados);
  const acumulados_ant = Math.max(0, args.acumulados_ant);

  // Cálculo de días anuales (años completos)
  const anos_completos = Math.floor(anos);
  const dias_vacaciones_anuales = anos_completos * DIAS_VACACIONES_POR_ANO;

  // Cálculo proporcional del año en curso
  const fraccion_ano = (meses / MESES_ANO);
  const dias_vacaciones_proporcional = Math.round(
    DIAS_VACACIONES_POR_ANO * fraccion_ano * 100
  ) / 100;

  // Total de días disponibles para disfrutar (antes de tomar)
  const dias_disponibles_brutos =
    dias_vacaciones_anuales + dias_vacaciones_proporcional + acumulados_ant;
  const dias_vacaciones_disponibles = Math.round(dias_disponibles_brutos * 100) / 100;

  // Días pendientes después de tomar vacaciones
  const dias_vacaciones_pendientes = Math.max(
    0,
    dias_vacaciones_disponibles - tomados
  );

  // Total acumulado (días disponibles que quedan + días tomados)
  const dias_acumulados_total_calc =
    dias_vacaciones_pendientes + tomados;
  const dias_acumulados_total = Math.round(dias_acumulados_total_calc * 100) / 100;

  // Días acumulados según límite legal (máx 30)
  const dias_acumulados_legales = Math.min(dias_acumulados_total, LIMITE_ACUMULACION_DIAS);

  // Cálculo del valor diario
  const valor_diario = salario / DIAS_MES;

  // Pago por días tomados (en este período)
  const pago_vacaciones_dias_tomados = Math.round(
    valor_diario * tomados * 100
  ) / 100;

  // Pago por días pendientes (acumulados)
  const pago_vacaciones_pendientes = Math.round(
    valor_diario * dias_vacaciones_pendientes * 100
  ) / 100;

  // Pago total de vacaciones
  const pago_total_vacaciones = Math.round(
    (pago_vacaciones_dias_tomados + pago_vacaciones_pendientes) * 100
  ) / 100;

  return {
    dias_vacaciones_anuales,
    dias_vacaciones_proporcional,
    dias_vacaciones_disponibles,
    dias_vacaciones_pendientes,
    dias_acumulados_total,
    dias_acumulados_legales,
    valor_diario,
    pago_vacaciones_dias_tomados,
    pago_vacaciones_pendientes,
    pago_total_vacaciones,
  };
}

export function compute(i: Inputs): Outputs {
  const salario = Math.max(0, i.salario_mensual);
  const meses = Math.max(0, Math.min(i.meses_trabajados, MESES_ANO));
  const anos = Math.max(0, i.anos_servicio);
  const tomados = Math.max(0, i.dias_vacaciones_tomadas);
  const acumulados_ant = Math.max(0, i.dias_acumulados_anteriores);

  const r = calcularVacaciones({ salario, meses, anos, tomados, acumulados_ant });
  const dias_vacaciones_anuales = r.dias_vacaciones_anuales;
  const dias_vacaciones_proporcional = r.dias_vacaciones_proporcional;
  const dias_vacaciones_disponibles = r.dias_vacaciones_disponibles;
  const dias_vacaciones_pendientes = r.dias_vacaciones_pendientes;
  const dias_acumulados_total = r.dias_acumulados_total;
  const dias_acumulados_legales = r.dias_acumulados_legales;
  const valor_diario = r.valor_diario;
  const pago_vacaciones_dias_tomados = r.pago_vacaciones_dias_tomados;
  const pago_vacaciones_pendientes = r.pago_vacaciones_pendientes;
  const pago_total_vacaciones = r.pago_total_vacaciones;

  // Advertencia si excede límite de acumulación
  let advertencia_limite = "";
  if (dias_acumulados_total > LIMITE_ACUMULACION_DIAS) {
    const dias_exceso = Math.round(
      (dias_acumulados_total - LIMITE_ACUMULACION_DIAS) * 100
    ) / 100;
    const valor_exceso = Math.round(
      valor_diario * dias_exceso * 100
    ) / 100;
    advertencia_limite =
      `⚠️ EXCESO DE ACUMULACIÓN: Tiene ${dias_acumulados_total.toFixed(1)} días acumulados. ` +
      `Máximo legal: ${LIMITE_ACUMULACION_DIAS} días. Exceso: ${dias_exceso.toFixed(1)} días ` +
      `(valor: $${valor_exceso.toLocaleString("es-CO", { maximumFractionDigits: 0 })}). ` +
      `El empleador debe autorizar disfrute en el tercer año o pagar en efectivo.`;
  } else {
    advertencia_limite =
      `✓ Acumulación dentro de límite: ${dias_acumulados_total.toFixed(1)} / ${LIMITE_ACUMULACION_DIAS} días permitidos.`;
  }

  const excede = dias_acumulados_total > LIMITE_ACUMULACION_DIAS;
  const fmtCop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
  const insight = {
    title: excede ? 'Cuidado: superás el tope de acumulación' : 'Tu acumulado y lo que vale',
    text: excede
      ? `Tenés **${dias_acumulados_total.toFixed(1)} días** acumulados, por encima del tope legal de **${LIMITE_ACUMULACION_DIAS} días** (CST). El empleador debe ordenar el disfrute o compensar el exceso; el total pendiente equivale a **${fmtCop(pago_vacaciones_pendientes)}** (día = sueldo/30).`
      : `Te quedan **${dias_vacaciones_pendientes.toFixed(1)} días** pendientes de un acumulado de **${dias_acumulados_total.toFixed(1)} / ${LIMITE_ACUMULACION_DIAS}**, valorados en **${fmtCop(pago_vacaciones_pendientes)}**. Estás dentro del límite, pero recordá que las vacaciones se disfrutan, no se vuelven plata salvo al liquidar.`,
    tone: (excede ? 'warn' : 'good') as 'warn' | 'good',
    icon: '🏖️',
  };
  const chart = {
    type: 'scale' as const,
    marker: Number(dias_acumulados_total.toFixed(1)),
    markerLabel: `${dias_acumulados_total.toFixed(1)} días`,
    min: 0,
    segments: [
      { nombre: 'Al día', max: 15, color: '#16a34a', colorDark: '#22c55e' },
      { nombre: 'Acumulando', max: LIMITE_ACUMULACION_DIAS, color: '#f59e0b', colorDark: '#fbbf24' },
      { nombre: 'Excede tope', max: Math.max(LIMITE_ACUMULACION_DIAS + 1, Math.ceil(dias_acumulados_total) + 1), color: '#dc2626', colorDark: '#ef4444' },
    ],
    ariaLabel: `Días acumulados ${dias_acumulados_total.toFixed(1)} frente al tope legal de ${LIMITE_ACUMULACION_DIAS} días`,
  };

  // Tabla computada: días y valor de vacaciones según ANTIGÜEDAD (años de servicio),
  // manteniendo tu salario, meses del año en curso, días tomados y saldo anterior.
  // Cada fila llama al MISMO helper que produce el resultado principal (sin fabricar números).
  const fmtDias = (n: number) => (Math.round(n * 10) / 10).toLocaleString('es-CO', { maximumFractionDigits: 1 });
  const anosTabla = Array.from(new Set([1, 2, 3, 5, 10, Math.floor(anos)]))
    .filter((a) => a >= 0)
    .sort((a, b) => a - b)
    .slice(0, 7);
  const tableRows = anosTabla.map((a) => {
    const f = calcularVacaciones({ salario, meses, anos: a, tomados, acumulados_ant });
    const esTuCaso = a === Math.floor(anos);
    return [
      `${a} año${a === 1 ? '' : 's'}${esTuCaso ? ' (tu caso)' : ''}`,
      `${fmtDias(f.dias_vacaciones_anuales)} días`,
      `${fmtDias(f.dias_vacaciones_disponibles)} días`,
      `${fmtDias(f.dias_vacaciones_pendientes)} días`,
      fmtCop(f.pago_vacaciones_pendientes),
    ];
  });
  const table = {
    title: `Vacaciones según antigüedad (salario ${fmtCop(salario)}/mes)`,
    headers: ['Antigüedad', 'Días/año (15×años)', 'Días disponibles', 'Días pendientes', 'Valor pendiente'],
    align: ['left', 'right', 'right', 'right', 'right'] as ('left' | 'right' | 'center')[],
    rows: tableRows,
    note: `15 días hábiles por año cumplido (CST art. 186). "Disponibles" y "pendientes" incluyen tu proporcional del año en curso (${meses} mes${meses === 1 ? '' : 'es'}), tus ${tomados} día${tomados === 1 ? '' : 's'} ya tomados y ${acumulados_ant} día${acumulados_ant === 1 ? '' : 's'} de años anteriores. Valor diario = salario / 30.`,
  };

  return {
    dias_vacaciones_anuales: Math.round(dias_vacaciones_anuales * 100) / 100,
    dias_vacaciones_proporcional,
    dias_vacaciones_disponibles,
    dias_vacaciones_pendientes,
    dias_acumulados_total,
    dias_acumulados_legales: Math.round(dias_acumulados_legales * 100) / 100,
    pago_vacaciones_dias_tomados,
    pago_vacaciones_pendientes,
    pago_total_vacaciones,
    advertencia_limite,
    _insight: insight,
    _chart: chart,
    _table: table
  };
}
