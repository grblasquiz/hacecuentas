export interface Inputs {
  ingreso_bruto_familia: number;
  cantidad_hijos: number;
  condicion_laboral: string;
  tiene_escolaridad: boolean;
  tiene_prenatal: boolean;
}

export interface Outputs {
  tramo_ingreso: string;
  asignacion_por_hijo: number;
  monto_escolaridad: number;
  monto_prenatal: number;
  total_mensual: number;
  observaciones: string;
  _chart?: any;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  // footgun-fix: selects "true"/"false" llegan como string; "false" es truthy → coercionar a boolean.
  (i as any).tiene_escolaridad = (i as any).tiene_escolaridad === true || (i as any).tiene_escolaridad === 'true';
  (i as any).tiene_prenatal = (i as any).tiene_prenatal === true || (i as any).tiene_prenatal === 'true';
  const ingreso = Number(i.ingreso_bruto_familia) || 0;
  const hijos = Math.max(1, Math.floor(Number(i.cantidad_hijos) || 1));
  const condicion = String(i.condicion_laboral || 'empleado');
  const escolaridad = Boolean(i.tiene_escolaridad);
  const prenatal = Boolean(i.tiene_prenatal);

  // Valores oficiales ANSES junio 2026 (movilidad mensual por IPC, DNU 274/2024).
  // Asignación SUAF por hijo según tramo de ingreso del grupo familiar (IGF).
  const TRAMOS_2026 = [
    { limite: 1122074, tramo: 1, asignacion: 72474 },
    { limite: 1645630, tramo: 2, asignacion: 48888 },
    { limite: 1899934, tramo: 3, asignacion: 29570 },
    { limite: 5941936, tramo: 4, asignacion: 15257 },
  ];
  const AYUDA_ESCOLAR_ANUAL = 85000; // pago ÚNICO anual por hijo (inicio del ciclo lectivo)
  const AUH_POR_HIJO = 144562;       // desocupados/informales cobran AUH, no SUAF
  const TOPE_IGF = 5941936;          // tope de IGF para la asignación general por hijo

  // Desocupado / trabajador informal → AUH (no SUAF)
  if (condicion === 'desocupado') {
    const totalAuh = AUH_POR_HIJO * hijos + (prenatal ? AUH_POR_HIJO : 0);
    return {
      tramo_ingreso: 'Desocupado/informal → AUH',
      asignacion_por_hijo: AUH_POR_HIJO,
      monto_escolaridad: escolaridad ? AYUDA_ESCOLAR_ANUAL : 0,
      monto_prenatal: prenatal ? AUH_POR_HIJO : 0,
      total_mensual: totalAuh,
      observaciones: `Sin trabajo registrado cobrás la AUH: $${AUH_POR_HIJO.toLocaleString('es-AR')} por hijo (ANSES deposita el 80% por mes; el 20% se libera al presentar la Libreta). La ayuda escolar es un pago anual de $${AYUDA_ESCOLAR_ANUAL.toLocaleString('es-AR')} por hijo.`,
    };
  }

  // Ingreso del grupo familiar supera el tope → sin asignación general
  if (ingreso > TOPE_IGF) {
    return {
      tramo_ingreso: `Supera el tope de $${TOPE_IGF.toLocaleString('es-AR')}`,
      asignacion_por_hijo: 0,
      monto_escolaridad: 0,
      monto_prenatal: 0,
      total_mensual: 0,
      observaciones: `El ingreso del grupo familiar ($${ingreso.toLocaleString('es-AR')}) supera el tope de $${TOPE_IGF.toLocaleString('es-AR')}, así que no corresponde la asignación familiar general. La asignación por hijo con discapacidad no tiene tope de ingresos.`,
      _insight: {
        title: 'Superás el tope de ingresos',
        text: `Con un ingreso del grupo familiar de **$${ingreso.toLocaleString('es-AR')}** superás el tope de **$${TOPE_IGF.toLocaleString('es-AR')}**, por lo que no se cobra la asignación general por hijo. Solo la asignación por hijo con discapacidad sigue sin tope.`,
        tone: 'warn',
        icon: '🚫',
      },
    };
  }

  // Determinar tramo
  let tramoActual = TRAMOS_2026[TRAMOS_2026.length - 1];
  for (const t of TRAMOS_2026) {
    if (ingreso <= t.limite) { tramoActual = t; break; }
  }
  const tramoLabel = `Tramo ${tramoActual.tramo} (hasta $${tramoActual.limite.toLocaleString('es-AR')})`;

  const asignacionPorHijo = tramoActual.asignacion;
  const montoEscolar = escolaridad ? AYUDA_ESCOLAR_ANUAL : 0;   // anual, pago único
  const montoPrenatal = prenatal ? asignacionPorHijo : 0;       // mensual, = asignación del tramo
  const totalAsignacion = asignacionPorHijo * hijos;
  const totalMensual = totalAsignacion + montoPrenatal;         // mensual (la ayuda escolar es anual, no se suma)

  let obs = `Trabajador ${condicion === 'monotributista' ? 'monotributista' : 'en relación de dependencia'} en ${tramoLabel}: $${asignacionPorHijo.toLocaleString('es-AR')} por hijo.`;
  if (prenatal) obs += ` Prenatal (mensual): $${montoPrenatal.toLocaleString('es-AR')}.`;
  if (escolaridad) obs += ` Ayuda escolar: pago anual único de $${montoEscolar.toLocaleString('es-AR')} por hijo.`;
  obs += ' Valores ANSES junio 2026; verificá en anses.gob.ar.';

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: `Asignación (${hijos} hijo/s)`, value: totalAsignacion },
      { label: 'Prenatal (mensual)', value: montoPrenatal },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(totalMensual).toLocaleString('es-AR'),
    centerLabel: 'Total mensual',
    ariaLabel: 'Composición de la asignación familiar mensual: asignación por hijos más prenatal',
  };

  const insight = {
    title: `Estás en el ${tramoLabel}`,
    text: `Con un ingreso del grupo familiar de **$${ingreso.toLocaleString('es-AR')}** cobrás **$${asignacionPorHijo.toLocaleString('es-AR')} por hijo** (${hijos} hijo/s = $${totalAsignacion.toLocaleString('es-AR')})${montoPrenatal > 0 ? ` más **$${montoPrenatal.toLocaleString('es-AR')}** de prenatal` : ''}, total **$${Math.round(totalMensual).toLocaleString('es-AR')}/mes**.${escolaridad ? ` Aparte, la ayuda escolar es un pago anual de **$${montoEscolar.toLocaleString('es-AR')}** por hijo.` : ''} ${tramoActual.tramo <= 2 ? 'A menor ingreso familiar, mayor la asignación por hijo: el tramo 1 paga casi 5 veces más que el tramo 4.' : 'A mayor ingreso declarado, menor el monto por hijo.'}`,
    tone: (tramoActual.tramo <= 2 ? 'good' : 'neutral') as 'good' | 'neutral' | 'warn',
    icon: '👨‍👩‍👧',
  };

  return {
    tramo_ingreso: tramoLabel,
    asignacion_por_hijo: asignacionPorHijo,
    monto_escolaridad: montoEscolar,
    monto_prenatal: montoPrenatal,
    total_mensual: totalMensual,
    observaciones: obs,
    _chart: chart,
    _insight: insight,
  };
}
