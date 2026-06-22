/**
 * IRPF servicios personales Uruguay 2026 — Categoría II, rentas del trabajo
 * fuera de la relación de dependencia (profesionales, técnicos, honorarios).
 *
 * Difiere del IRPF de dependientes (calculadora-irpf-uruguay):
 *   - Base ANUAL (no retención mensual), se liquida en la declaración jurada.
 *   - El contribuyente puede DEDUCIR de los ingresos: un ficto del 30% (presunto,
 *     sin justificar gastos) O los gastos reales documentados — lo que más le convenga.
 *   - Sobre esa renta neta se aplica la escala IRPF ANUAL (franjas mensuales en BPC × 12).
 *   - El crédito por deducciones (aportes a la caja + hijos) se descuenta del impuesto
 *     primario a la tasa 14% / 8% según el ingreso.
 *
 * Aportes: se asumen aportes personales a BPS/Caja de Profesionales como deducción
 * (el usuario los ingresa; v1 estima un 18,5% si no se especifica nada explícito).
 */
import {
  URUGUAY_2026,
  fmtUYU,
  impuestoPorFranjasBpc,
} from '../data/uruguay-2026';

export interface Inputs {
  /** Ingresos anuales por honorarios / servicios personales (pesos). */
  ingresos_anuales: number;
  /** Tipo de deducción: "ficto" (30% presunto) o "reales" (gastos reales). */
  tipo_deduccion: string;
  /** Gastos reales anuales documentados (solo si tipo_deduccion = "reales"). */
  gastos_reales: number;
  /** Aportes personales anuales a BPS / Caja de Profesionales (pesos). */
  aportes_anuales: number;
  /** Hijos menores a cargo (deducción 20 BPC/año c/u). */
  hijos_menores: number;
}

export interface Outputs {
  ingresos_anuales: number;
  deduccion_aplicada: number;
  renta_neta: number;
  impuesto_primario: number;
  credito_deducciones: number;
  irpf_anual: number;
  irpf_mensual_prom: number;
  tasa_efectiva: number;
  liquido_anual: number;
  desglose: string;
  nota: string;
  _insight?: any;
  _table?: any;
}

/** Escala IRPF ANUAL: las franjas mensuales en BPC se anualizan ×12. */
function franjasAnuales() {
  return URUGUAY_2026.irpf.franjas.map((f) => ({
    hastaBpc: f.hastaBpc === Infinity ? Infinity : f.hastaBpc * 12,
    tasa: f.tasa,
  }));
}

export function irpfServiciosPersonalesUruguay(i: Inputs): Outputs {
  const bpc = URUGUAY_2026.bpc;
  const ded = URUGUAY_2026.irpf.deduccion;

  const ingresos = Math.max(0, Number(i.ingresos_anuales) || 0);
  const usaFicto = i.tipo_deduccion !== 'reales';
  const gastosReales = Math.max(0, Number(i.gastos_reales) || 0);
  const aportes = Math.max(0, Number(i.aportes_anuales) || 0);
  const hijos = Math.max(0, Math.round(Number(i.hijos_menores) || 0));

  if (ingresos <= 0) {
    return {
      ingresos_anuales: 0,
      deduccion_aplicada: 0,
      renta_neta: 0,
      impuesto_primario: 0,
      credito_deducciones: 0,
      irpf_anual: 0,
      irpf_mensual_prom: 0,
      tasa_efectiva: 0,
      liquido_anual: 0,
      desglose: '—',
      nota: 'Ingresá tus honorarios anuales para calcular el IRPF de servicios personales.',
    };
  }

  // 1) Deducción sobre los ingresos para llegar a la renta neta gravada.
  // Ficto: 30% presunto de gastos. Reales: gastos documentados.
  const deduccionGastos = usaFicto ? ingresos * 0.30 : Math.min(gastosReales, ingresos);
  const rentaNeta = Math.max(0, ingresos - deduccionGastos);

  // 2) Impuesto primario: escala ANUAL progresiva sobre la renta neta.
  const impuestoPrimario = impuestoPorFranjasBpc(rentaNeta, franjasAnuales());

  // 3) Crédito por deducciones (aportes + hijos), a la tasa 14% / 8% según ingreso.
  // Umbral mensual 15 BPC → anual 15 BPC × 12.
  const umbralAnual = ded.umbralBpc * 12 * bpc;
  const tasaCredito = ingresos < umbralAnual ? ded.tasaBaja : ded.tasaAlta;
  const deduccionHijosAnual = hijos * ded.hijoMenorBpcAnual * bpc;
  const baseCredito = aportes + deduccionHijosAnual;
  const credito = baseCredito * tasaCredito;

  const irpfAnual = Math.max(0, impuestoPrimario - credito);
  const irpfMensualProm = irpfAnual / 12;
  const tasaEfectiva = ingresos > 0 ? irpfAnual / ingresos : 0;
  const liquidoAnual = ingresos - deduccionGastos - irpfAnual; // neto de gastos+IRPF (sin re-restar aportes que ya son gasto)

  const desglose =
    `Ingresos ${fmtUYU(ingresos)} − deducción ${usaFicto ? 'ficto 30%' : 'gastos reales'} ${fmtUYU(deduccionGastos)} = renta neta ${fmtUYU(rentaNeta)} → primario ${fmtUYU(impuestoPrimario)} − crédito ${fmtUYU(credito)} = IRPF ${fmtUYU(irpfAnual)}`;

  return {
    ingresos_anuales: Math.round(ingresos),
    deduccion_aplicada: Math.round(deduccionGastos),
    renta_neta: Math.round(rentaNeta),
    impuesto_primario: Math.round(impuestoPrimario),
    credito_deducciones: Math.round(credito),
    irpf_anual: Math.round(irpfAnual),
    irpf_mensual_prom: Math.round(irpfMensualProm),
    tasa_efectiva: tasaEfectiva,
    liquido_anual: Math.round(liquidoAnual),
    desglose,
    nota: 'El IRPF de servicios personales (Cat. II no dependiente) se liquida en la declaración jurada anual de DGI. Podés optar entre el ficto del 30% o deducir gastos reales documentados — conviene comparar ambos. Recordá que además pagás IVA sobre los honorarios (salvo régimen de pequeña empresa) y aportes a BPS o a tu caja profesional.',
    _insight: {
      type: 'highlight',
      icon: '💡',
      text: irpfAnual > 0
        ? `Con ${fmtUYU(ingresos)} de honorarios al año y la deducción ${usaFicto ? 'ficto 30%' : 'por gastos reales'}, la renta neta es ${fmtUYU(rentaNeta)} y pagás ${fmtUYU(irpfAnual)} de IRPF anual (≈ ${fmtUYU(irpfMensualProm)}/mes, tasa efectiva ${(tasaEfectiva * 100).toFixed(1)}%).`
        : `Con ${fmtUYU(ingresos)} de honorarios al año, la renta neta luego de la deducción no supera el mínimo no imponible: IRPF $U 0. Igual debés presentar la declaración si superás el tope de no obligados.`,
    },
    _table: {
      title: 'Ficto 30% vs gastos reales — cuál conviene',
      headers: ['Concepto', 'Opción ficto 30%', 'Opción gastos reales'],
      rows: [
        ['Ingresos anuales', fmtUYU(ingresos), fmtUYU(ingresos)],
        ['Deducción de gastos', fmtUYU(ingresos * 0.30) + ' (30% fijo)', fmtUYU(Math.min(gastosReales, ingresos)) + ' (documentados)'],
        ['Renta neta gravada', fmtUYU(Math.max(0, ingresos * 0.70)), fmtUYU(Math.max(0, ingresos - Math.min(gastosReales, ingresos)))],
        ['IRPF primario', fmtUYU(impuestoPorFranjasBpc(Math.max(0, ingresos * 0.70), franjasAnuales())), fmtUYU(impuestoPorFranjasBpc(Math.max(0, ingresos - Math.min(gastosReales, ingresos)), franjasAnuales()))],
      ],
      note: 'Si tus gastos reales documentados superan el 30% de los ingresos, conviene la opción de gastos reales; si no, el ficto del 30% es más simple y ventajoso. La escala IRPF anual es la mensual en BPC multiplicada por 12.',
    },
  };
}
