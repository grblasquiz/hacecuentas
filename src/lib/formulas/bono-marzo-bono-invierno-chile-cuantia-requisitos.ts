// Bonos del Estado de Chile 2026 — montos y requisitos REALES (fuentes oficiales .gob.cl).
// Tres beneficios distintos, cada uno con su propia población objetivo y lógica:
//   1. Bono Marzo = Aporte Familiar Permanente (AFPER, ex Bono Marzo) — IPS / ChileAtiende ficha 38913
//   2. Bono de Invierno — IPS / ChileAtiende ficha 39484 (pensionados/as 65+)
//   3. Bono Logro Escolar — Min. Desarrollo Social (IEF/SyO) / ChileAtiende ficha 20063
// Ninguno depende de "renta en UF", región ni "bono por discapacidad": eso era ficticio.
// NO modificar montos sin verificar contra la fuente oficial citada (dato YMYL).

export interface Inputs {
  tipo_bono: 'marzo' | 'invierno' | 'logro_escolar';
  cumple_requisito: 'si' | 'no';
  cantidad: number;
  tramo_logro: 'tramo1' | 'tramo2' | 'no_aplica';
}

export interface Outputs {
  cuantia_bono: number;
  monto_unitario: number;
  califica: string;
  requisitos: string;
  fecha_pago: string;
  como_consultar: string;
  _insight?: any;
  _steps?: any;
}

// ── Montos oficiales 2026 (CLP) ───────────────────────────────────────────────
// Aporte Familiar Permanente 2026: $66.834 por carga/causante o por familia.
// Fuente: ChileAtiende/IPS ficha 38913 y aportefamiliar.cl (pago feb–mar 2026).
const AFPER_MONTO = 66834;

// Bono de Invierno 2026: $81.257, pago único en mayo a pensionados/as.
// Tope de pensión $231.440 (pensión mínima de vejez 75+). Fuente: ChileAtiende/IPS ficha 39484.
const INVIERNO_MONTO = 81257;
const INVIERNO_TOPE_PENSION = 231440;

// Bono Logro Escolar (montos referenciales según ChileAtiende ficha 20063; se reajustan
// por 100% del IPC cada año). Tramo 1 = 15% mejor rendimiento; Tramo 2 = entre 15% y 30%.
const LOGRO_TRAMO1 = 85057; // top 15% de la promoción
const LOGRO_TRAMO2 = 51036; // entre 15% y 30%

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

export function compute(i: Inputs): Outputs {
  const cumple = i.cumple_requisito === 'si';

  let monto_unitario = 0;
  let unidades = 1;
  let unidadLabel = '';
  let nombreBono = '';
  let requisitos = '';
  let fecha_pago = '';
  let como_consultar = '';

  if (i.tipo_bono === 'marzo') {
    nombreBono = 'Marzo (Aporte Familiar Permanente)';
    monto_unitario = AFPER_MONTO;
    // Por cada carga/causante que dio derecho a SUF/Asignación Familiar; o 1 pago por
    // familia si el derecho viene de Chile Solidario / Seguridades y Oportunidades.
    unidades = clampInt(i.cantidad, 1, 20);
    unidadLabel = unidades === 1 ? 'carga/familia' : 'cargas';
    requisitos =
      'Haber sido beneficiario/a, al 31 de diciembre de 2025, de Subsidio Familiar (SUF) o Maternal, ' +
      'Asignación Familiar o Maternal, Chile Solidario o del Subsistema de Seguridades y Oportunidades ' +
      '(Ingreso Ético Familiar). Se paga $66.834 por cada carga/causante (o 1 pago por familia en ' +
      'Chile Solidario y Seguridades y Oportunidades). Es automático: no se postula ni se inscribe. ' +
      'No depende de la renta en UF, la región ni la discapacidad.';
    fecha_pago =
      'Febrero–marzo de 2026 en tres grupos: 16 de febrero, 2 de marzo y 16 de marzo (según el ' +
      'beneficio que da derecho al aporte).';
    como_consultar = 'Consultá con tu RUT en aportefamiliar.cl o chileatiende.gob.cl (ficha 38913), o llamá al 101.';
  } else if (i.tipo_bono === 'invierno') {
    nombreBono = 'de Invierno';
    monto_unitario = INVIERNO_MONTO;
    unidades = 1; // beneficio individual del pensionado/a; no se multiplica por cargas
    unidadLabel = 'pago único';
    requisitos =
      'Ser pensionado/a (IPS, ISL, Capredena, Dipreca, mutualidades de empleadores, o AFP con pensión ' +
      'mínima garantizada por el Estado; también beneficiarios/as de PGU o pensión de reparación), tener ' +
      '65 años o más al 1 de mayo de 2026 y que tu pensión total no supere $231.440 (pensión mínima de ' +
      'vejez para 75+). Se considera el total de la pensión, incluida la Compensación por Diferencia de ' +
      'Expectativas de Vida y el Beneficio por Años Cotizados. Es automático y no tributable.';
    fecha_pago = 'Mayo de 2026, junto con el pago de la pensión.';
    como_consultar = 'Consultá con tu RUT en ips.gob.cl o chileatiende.gob.cl (ficha 39484), o llamá al 101.';
  } else {
    // logro_escolar
    nombreBono = 'Logro Escolar';
    const tramo = i.tramo_logro === 'tramo2' ? 'tramo2' : 'tramo1'; // default: top 15%
    monto_unitario = tramo === 'tramo2' ? LOGRO_TRAMO2 : LOGRO_TRAMO1;
    unidades = clampInt(i.cantidad, 1, 15);
    unidadLabel = unidades === 1 ? 'estudiante' : 'estudiantes';
    requisitos =
      'Tener estudiantes de 5° básico a 4° medio (en el año escolar anterior), menores de 24 años, en ' +
      'establecimientos reconocidos por el Estado, que pertenezcan al 30% más vulnerable según el Registro ' +
      'Social de Hogares (al 31 de marzo del año anterior) y estén dentro del 30% de mejor rendimiento de ' +
      'su promoción (Tramo 1: 15% superior; Tramo 2: entre 15% y 30%). Forma parte del Ingreso Ético ' +
      'Familiar; es automático, no se postula. Montos referenciales según ChileAtiende: se reajustan por IPC.';
    fecha_pago =
      'Pago anual (habitualmente en el segundo semestre) vía cuenta de BancoEstado. La nómina la define el ' +
      'Ministerio de Desarrollo Social con la información del Ministerio de Educación.';
    como_consultar =
      'Consultá en bonologroescolar.ministeriodesarrollosocial.gob.cl o chileatiende.gob.cl (ficha 20063).';
  }

  const cuantia_bono = cumple ? monto_unitario * unidades : 0;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-CL');
  const califica = cumple
    ? `Sí: con los requisitos cumplidos, te corresponde el Bono ${nombreBono}.`
    : `Según lo indicado, no calificás al Bono ${nombreBono} (revisá los requisitos).`;

  // Paso a paso (solo cuando corresponde el bono)
  const _steps = cumple
    ? (i.tipo_bono === 'invierno'
        ? [
            { label: 'Monto del Bono de Invierno 2026', value: fmt(INVIERNO_MONTO) },
            { label: 'Tope de pensión para calificar', value: `≤ ${fmt(INVIERNO_TOPE_PENSION)}` },
            { label: 'Total a recibir', value: fmt(cuantia_bono) },
          ]
        : [
            { label: `Monto por ${i.tipo_bono === 'marzo' ? 'carga/familia' : 'estudiante'}`, value: fmt(monto_unitario) },
            { label: i.tipo_bono === 'marzo' ? 'Cargas/familias' : 'Estudiantes que califican', value: String(unidades) },
            { label: 'Total a recibir', value: `${fmt(monto_unitario)} × ${unidades} = ${fmt(cuantia_bono)}` },
          ])
    : undefined;

  // Insight narrativo
  let _insight;
  if (cumple) {
    const detalle =
      i.tipo_bono === 'invierno'
        ? `Es un pago único de **${fmt(INVIERNO_MONTO)}**.`
        : `Son **${fmt(monto_unitario)}** por ${i.tipo_bono === 'marzo' ? 'carga/familia' : 'estudiante'} × ${unidades} = **${fmt(cuantia_bono)}**.`;
    const nota =
      i.tipo_bono === 'logro_escolar'
        ? ' Los montos del Bono Logro Escolar se reajustan por IPC cada año: confirmá el vigente en el sitio oficial.'
        : '';
    _insight = {
      title: `Te corresponde el Bono ${nombreBono}`,
      text: `${detalle} Pago estimado: ${fecha_pago} ${como_consultar}${nota}`,
      tone: 'good' as const,
      icon: '💰',
    };
  } else {
    _insight = {
      title: `Verificá tu elegibilidad al Bono ${nombreBono}`,
      text: `Estos bonos son **automáticos** (no se postula): los asigna el Estado a quien cumple los requisitos. ${requisitos} ${como_consultar}`,
      tone: 'warn' as const,
      icon: 'ℹ️',
    };
  }

  return {
    cuantia_bono: Math.round(cuantia_bono),
    monto_unitario: Math.round(monto_unitario),
    califica,
    requisitos,
    fecha_pago,
    como_consultar,
    _insight,
    ...(_steps ? { _steps } : {}),
  };
}
