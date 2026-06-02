export interface Inputs {
  salario_bruto_anual: number;
  meses_trabajados: number;
  dias_mes_fraccion: number;
  tipo_jornada: 'completa' | 'parcial_4' | 'parcial_3' | 'parcial_2' | 'parcial_1';
  dias_vacaciones_convenio: number;
  dias_disfrutados: number;
}

export interface Outputs {
  meses_computables: number;
  dias_devengados_laborables: number;
  dias_devengados_naturales: number;
  dias_pendientes: number;
  valor_dia_bruto: number;
  valor_vacaciones_devengadas_bruto: number;
  valor_pendiente_bruto: number;
  nota_legal: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes legales (art. 38 ET, datos 2026) ---
  const DIAS_LABORABLES_CONVENIO_MINIMO = 22; // art. 38 ET: mínimo legal
  const SEMANAS_ANIO = 52;

  // --- Normalización de inputs ---
  const salarioBruto = Math.max(0, i.salario_bruto_anual || 0);
  const mesesTrabajados = Math.min(12, Math.max(0, Math.floor(i.meses_trabajados || 0)));
  const diasFraccion = Math.min(30, Math.max(0, Math.floor(i.dias_mes_fraccion || 0)));
  const diasConvenio = Math.max(
    DIAS_LABORABLES_CONVENIO_MINIMO,
    Math.floor(i.dias_vacaciones_convenio || DIAS_LABORABLES_CONVENIO_MINIMO)
  );
  const diasDisfrutados = Math.max(0, Math.floor(i.dias_disfrutados || 0));

  // --- Factor jornada parcial (días trabajados por semana / 5) ---
  // Fuente: doctrina TS y art. 12 ET sobre trabajo a tiempo parcial
  const factorJornada = ((): number => {
    switch (i.tipo_jornada) {
      case 'completa':  return 5 / 5; // 1.0
      case 'parcial_4': return 4 / 5; // 0.8
      case 'parcial_3': return 3 / 5; // 0.6
      case 'parcial_2': return 2 / 5; // 0.4
      case 'parcial_1': return 1 / 5; // 0.2
      default:          return 1.0;
    }
  })();

  // Días laborables por semana según jornada
  const diasSemanales = ((): number => {
    switch (i.tipo_jornada) {
      case 'completa':  return 5;
      case 'parcial_4': return 4;
      case 'parcial_3': return 3;
      case 'parcial_2': return 2;
      case 'parcial_1': return 1;
      default:          return 5;
    }
  })();

  // --- Meses computables ---
  // Las fracciones de mes >= 16 días se consideran mes completo
  // (criterio mayoritario de convenios y jurisprudencia del TS)
  const mesFraccionComputable = diasFraccion >= 16 ? 1 : 0;
  const mesesComputables = Math.min(12, mesesTrabajados + mesFraccionComputable);

  // --- Días laborables devengados ---
  // Fórmula: (días_convenio / 12) × meses_computables × factor_jornada
  // art. 38 ET: proporcionalidad por tiempo trabajado
  const diasDevengadosLaborables = parseFloat(
    ((diasConvenio / 12) * mesesComputables * factorJornada).toFixed(1)
  );

  // --- Días naturales equivalentes (orientativo) ---
  // 22 días laborables ≡ 30 días naturales → factor 30/22
  const factorNaturales = 30 / 22;
  const diasDevengadosNaturales = parseFloat(
    (diasDevengadosLaborables * factorNaturales).toFixed(1)
  );

  // --- Días pendientes de disfrutar ---
  const diasPendientes = Math.max(
    0,
    parseFloat((diasDevengadosLaborables - diasDisfrutados).toFixed(1))
  );

  // --- Valor económico del día laborable ---
  // Las vacaciones se retribuyen con el salario ordinario (art. 38.1 ET + STS 8 jun. 2016)
  // Días laborables anuales teóricos = 52 semanas × días_semanales
  const diasLaborablesAnio = SEMANAS_ANIO * diasSemanales;
  const valorDiaBruto =
    diasLaborablesAnio > 0 && salarioBruto > 0
      ? parseFloat((salarioBruto / diasLaborablesAnio).toFixed(2))
      : 0;

  // --- Valor total bruto vacaciones devengadas (ya incluido en nómina) ---
  const valorVacacionesDevengadasBruto = parseFloat(
    (valorDiaBruto * diasDevengadosLaborables).toFixed(2)
  );

  // --- Valor bruto de los días pendientes (compensable solo en liquidación) ---
  const valorPendienteBruto = parseFloat(
    (valorDiaBruto * diasPendientes).toFixed(2)
  );

  // --- Nota legal ---
  let notaLegal = '';
  if (mesesComputables >= 12) {
    notaLegal =
      'Año completo: devengas el máximo de ' +
      diasDevengadosLaborables +
      ' días laborables. La retribución está incluida en tu nómina durante el disfrute de las vacaciones (art. 38 ET).';
  } else if (mesesComputables === 0) {
    notaLegal =
      'Con 0 meses computables no se devenga ningún día de vacaciones.';
  } else {
    notaLegal =
      'Con ' +
      mesesComputables +
      ' mes' +
      (mesesComputables > 1 ? 'es' : '') +
      ' computables devengas ' +
      diasDevengadosLaborables +
      ' días laborables (' +
      diasDevengadosNaturales +
      ' naturales orientativos). La compensación económica de ' +
      diasPendientes +
      ' días pendientes (' +
      valorPendienteBruto.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      ' € brutos) solo puede abonarse en la liquidación final del contrato, nunca durante su vigencia (art. 38.3 ET).';
  }

  // --- Caja de insight ---
  const fmtDias = (n: number) => n.toLocaleString('es-ES', { maximumFractionDigits: 1 });
  const fmtEur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
  let _insight: any;
  if (mesesComputables === 0) {
    _insight = {
      title: 'Sin días devengados',
      text: 'Con **0 meses computables** todavía no devengaste ningún día de vacaciones. Una fracción de mes solo suma si llegás a **16 días o más** trabajados.',
      tone: 'neutral',
      icon: '🏖️',
    };
  } else if (diasPendientes <= 0) {
    _insight = {
      title: 'Vacaciones al día',
      text: 'Devengaste **' + fmtDias(diasDevengadosLaborables) + ' días laborables** y ya disfrutaste todos. No te queda saldo pendiente de compensar.',
      tone: 'good',
      icon: '✅',
    };
  } else {
    _insight = {
      title: 'Tenés días pendientes',
      text: 'Devengaste **' + fmtDias(diasDevengadosLaborables) + ' días laborables** y te quedan **' + fmtDias(diasPendientes) + ' por disfrutar** (≈ **' + fmtEur(valorPendienteBruto) + ' brutos**). Ojo: esa compensación en dinero solo se cobra en la liquidación final del contrato, no durante su vigencia (art. 38.3 ET).',
      tone: 'warn',
      icon: '⏳',
    };
  }

  // --- Gráfico: reparto disfrutados vs pendientes (solo si suman lo devengado) ---
  let _chart: any;
  if (diasDevengadosLaborables > 0 && diasDisfrutados <= diasDevengadosLaborables) {
    const disfrutadosSlice = parseFloat((diasDevengadosLaborables - diasPendientes).toFixed(1));
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Disfrutados', value: disfrutadosSlice },
        { label: 'Pendientes', value: diasPendientes },
      ],
      centerValue: fmtDias(diasDevengadosLaborables),
      centerLabel: 'días devengados',
      ariaLabel: 'Reparto de los ' + fmtDias(diasDevengadosLaborables) + ' días laborables devengados: ' + fmtDias(disfrutadosSlice) + ' disfrutados y ' + fmtDias(diasPendientes) + ' pendientes.',
    };
  }

  return {
    meses_computables: mesesComputables,
    dias_devengados_laborables: diasDevengadosLaborables,
    dias_devengados_naturales: diasDevengadosNaturales,
    dias_pendientes: diasPendientes,
    valor_dia_bruto: valorDiaBruto,
    valor_vacaciones_devengadas_bruto: valorVacacionesDevengadasBruto,
    valor_pendiente_bruto: valorPendienteBruto,
    nota_legal: notaLegal,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
