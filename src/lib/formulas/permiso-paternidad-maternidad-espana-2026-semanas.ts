export interface Inputs {
  salario_bruto_mensual: number;
  num_pagas: string; // '12' | '14'
  fecha_parto: string; // ISO date string YYYY-MM-DD
  semanas_opcionales_inicio: string; // 'inmediato' | 'semana_7' | 'semana_13' | 'mes_3' | 'mes_6' | 'mes_9'
  tipo_progenitor: string; // 'madre_biologica' | 'otro_progenitor'
  parto_multiple: string; // 'no' | 'si'
  regimen_ss: string; // 'general' | 'autonomo'
}

export interface Outputs {
  base_reguladora_diaria: number;
  prestacion_diaria_bruta: number;
  total_dias_permiso: number;
  prestacion_total_bruta: number;
  prestacion_total_neta_estimada: number;
  fecha_fin_obligatorio: string;
  fecha_fin_permiso_completo: string;
  fecha_limite_opcionales: string;
  semanas_totales: number;
  aviso: string;
}

export function compute(i: Inputs): Outputs {
  // --- Constantes 2026 (Fuente: Seguridad Social / AEAT 2026) ---
  const SEMANAS_OBLIGATORIAS = 6;
  const SEMANAS_OPCIONALES = 10;
  const SEMANAS_BASE = SEMANAS_OBLIGATORIAS + SEMANAS_OPCIONALES; // 16
  const SEMANAS_EXTRA_MULTIPLE = 2; // por cada hijo adicional en parto múltiple
  const DIAS_POR_SEMANA = 7;

  // Bases máximas y mínimas de cotización SS 2026 (Grupo 1, contingencias comunes)
  // Fuente: Orden de cotización SS 2026 / BOE
  const BASE_MAX_MENSUAL = 4909.50; // €/mes grupo 1 - 2026
  const BASE_MIN_MENSUAL = 1381.20; // €/mes (SMI 2026 referencial, grupo más bajo)

  // Tramos IRPF 2026 estatales + autonómicos medios (Fuente: AEAT 2026)
  const TRAMOS_IRPF: Array<{ hasta: number; tipo: number }> = [
    { hasta: 12450, tipo: 0.19 },
    { hasta: 20200, tipo: 0.24 },
    { hasta: 35200, tipo: 0.30 },
    { hasta: 60000, tipo: 0.37 },
    { hasta: 300000, tipo: 0.45 },
    { hasta: Infinity, tipo: 0.47 },
  ];
  const MINIMO_PERSONAL_IRPF = 5550; // € (Fuente: AEAT 2026)

  // --- Validaciones y defaults ---
  const salarioBruto = Math.max(0, i.salario_bruto_mensual || 0);
  const numPagas = parseInt(i.num_pagas || '14', 10);
  const partoMultiple = i.parto_multiple === 'si';
  const regimenSS = i.regimen_ss || 'general';

  // --- Base de cotización mensual ---
  // Con 14 pagas: la base incluye la prorrata de las extras
  // Base cotización = salario bruto mensual * num_pagas / 12
  // Fuente: LGSS art. 147 - base de cotización incluye pagas extras prorrateadas
  let baseCotizacionMensual: number;
  if (numPagas === 14) {
    baseCotizacionMensual = (salarioBruto * 14) / 12;
  } else {
    baseCotizacionMensual = salarioBruto;
  }

  // Aplicar límites SS 2026
  baseCotizacionMensual = Math.min(baseCotizacionMensual, BASE_MAX_MENSUAL);
  baseCotizacionMensual = Math.max(baseCotizacionMensual, salarioBruto > 0 ? BASE_MIN_MENSUAL : 0);

  // --- Base reguladora diaria ---
  // Fuente: LGSS art. 179 - base reguladora = base cotización / 30
  const baseReguladoraDiaria = baseCotizacionMensual / 30;

  // --- Prestación diaria bruta: 100% base reguladora ---
  // Fuente: LGSS art. 179.1
  const prestacionDiariaBruta = baseReguladoraDiaria;

  // --- Total semanas de permiso ---
  let semanasExtra = 0;
  if (partoMultiple) {
    semanasExtra = SEMANAS_EXTRA_MULTIPLE; // mínimo 1 hijo adicional
  }
  const semanasTotales = SEMANAS_BASE + semanasExtra;
  const totalDiasPermiso = semanasTotales * DIAS_POR_SEMANA;

  // --- Prestación total bruta ---
  const prestacionTotalBruta = prestacionDiariaBruta * totalDiasPermiso;

  // --- Estimación retención IRPF ---
  // La prestación tributa como rendimiento del trabajo (Fuente: AEAT, supresión exención 2019)
  // Estimación: tipo efectivo sobre base imponible anualizada menos mínimo personal
  const prestacionAnualBruta = prestacionTotalBruta; // ya es la prestación total del período
  const baseImponibleEstimada = Math.max(0, prestacionAnualBruta - MINIMO_PERSONAL_IRPF);

  function calcularRetencionIRPF(base: number): number {
    if (base <= 0) return 0;
    let retencion = 0;
    let baseRestante = base;
    let limiteAnterior = 0;
    for (const tramo of TRAMOS_IRPF) {
      if (baseRestante <= 0) break;
      const tramoCuantia = Math.min(baseRestante, tramo.hasta - limiteAnterior);
      retencion += tramoCuantia * tramo.tipo;
      baseRestante -= tramoCuantia;
      limiteAnterior = tramo.hasta;
    }
    return retencion;
  }

  const retencionEstimada = calcularRetencionIRPF(baseImponibleEstimada);
  const prestacionTotalNetaEstimada = Math.max(0, prestacionTotalBruta - retencionEstimada);

  // --- Fechas ---
  function parseFecha(fechaStr: string): Date | null {
    if (!fechaStr) return null;
    const partes = fechaStr.split('-');
    if (partes.length !== 3) return null;
    const d = new Date(parseInt(partes[0]), parseInt(partes[1]) - 1, parseInt(partes[2]));
    return isNaN(d.getTime()) ? null : d;
  }

  function formatFecha(d: Date): string {
    const dia = d.getDate().toString().padStart(2, '0');
    const mes = (d.getMonth() + 1).toString().padStart(2, '0');
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  function addDias(d: Date, dias: number): Date {
    const resultado = new Date(d.getTime());
    resultado.setDate(resultado.getDate() + dias);
    return resultado;
  }

  function addMeses(d: Date, meses: number): Date {
    const resultado = new Date(d.getTime());
    resultado.setMonth(resultado.getMonth() + meses);
    return resultado;
  }

  const fechaParto = parseFecha(i.fecha_parto);

  let fechaFinObligatorio = '';
  let fechaFinPermisoCompleto = '';
  let fechaLimiteOpcionales = '';

  if (fechaParto) {
    // Fin período obligatorio: 6 semanas desde el día del parto
    const diasObligatorios = SEMANAS_OBLIGATORIAS * DIAS_POR_SEMANA;
    const finObligatorio = addDias(fechaParto, diasObligatorios - 1);
    fechaFinObligatorio = formatFecha(finObligatorio);

    // Fecha límite para opcionales: 12 meses desde el parto (menos duración opcionales)
    const fechaAniversario = addMeses(fechaParto, 12);
    fechaLimiteOpcionales = formatFecha(fechaAniversario);

    // Calcular inicio de las semanas opcionales según opción elegida
    let inicioOpcionales: Date;
    const opcion = i.semanas_opcionales_inicio || 'inmediato';

    switch (opcion) {
      case 'inmediato':
        inicioOpcionales = addDias(fechaParto, diasObligatorios);
        break;
      case 'semana_7':
        inicioOpcionales = addDias(fechaParto, 6 * DIAS_POR_SEMANA);
        break;
      case 'semana_13':
        inicioOpcionales = addDias(fechaParto, 12 * DIAS_POR_SEMANA);
        break;
      case 'mes_3':
        inicioOpcionales = addMeses(fechaParto, 3);
        break;
      case 'mes_6':
        inicioOpcionales = addMeses(fechaParto, 6);
        break;
      case 'mes_9':
        inicioOpcionales = addMeses(fechaParto, 9);
        break;
      default:
        inicioOpcionales = addDias(fechaParto, diasObligatorios);
    }

    // Fin permiso completo: inicio opcionales + semanas opcionales + extras
    const diasOpcionales = (SEMANAS_OPCIONALES + semanasExtra) * DIAS_POR_SEMANA;
    const finPermisoCompleto = addDias(inicioOpcionales, diasOpcionales);

    // Verificar que no supera el límite del año del menor
    const finPermisoEfectivo = finPermisoCompleto < fechaAniversario ? finPermisoCompleto : addDias(fechaAniversario, -1);
    fechaFinPermisoCompleto = formatFecha(finPermisoEfectivo);
  } else {
    fechaFinObligatorio = 'Indica la fecha de parto';
    fechaFinPermisoCompleto = 'Indica la fecha de parto';
    fechaLimiteOpcionales = 'Indica la fecha de parto';
  }

  // --- Avisos ---
  const avisos: string[] = [];

  if (regimenSS === 'autonomo') {
    avisos.push('Como autónomo/a, necesitas acreditar al menos 180 días cotizados en los últimos 7 años. La base reguladora se calcula sobre tu base de cotización elegida en el RETA.');
  }

  if (partoMultiple) {
    avisos.push(`Parto múltiple o discapacidad: se añaden ${SEMANAS_EXTRA_MULTIPLE} semanas adicionales (total ${semanasTotales} semanas por progenitor).`);
  }

  if (salarioBruto > 0 && (salarioBruto * (numPagas === 14 ? 14 / 12 : 1)) > BASE_MAX_MENSUAL) {
    avisos.push(`Tu base de cotización supera el máximo de ${BASE_MAX_MENSUAL.toFixed(2).replace('.', ',')} €/mes. La prestación se calcula sobre ese límite.`);
  }

  if (i.semanas_opcionales_inicio === 'mes_9' && fechaParto) {
    avisos.push('Atención: si empiezas las semanas opcionales en el mes 9, dispones de solo 3 meses para disfrutar las 10 semanas antes de que el menor cumpla 12 meses. Es posible que no puedas completar todas las semanas.');
  }

  const avisoTexto = avisos.length > 0
    ? avisos.join(' | ')
    : 'Prestación calculada según datos introducidos. Confírmala en la Sede Electrónica de la Seguridad Social (importass.seg-social.es).';

  return {
    base_reguladora_diaria: Math.round(baseReguladoraDiaria * 100) / 100,
    prestacion_diaria_bruta: Math.round(prestacionDiariaBruta * 100) / 100,
    total_dias_permiso: totalDiasPermiso,
    prestacion_total_bruta: Math.round(prestacionTotalBruta * 100) / 100,
    prestacion_total_neta_estimada: Math.round(prestacionTotalNetaEstimada * 100) / 100,
    fecha_fin_obligatorio: fechaFinObligatorio,
    fecha_fin_permiso_completo: fechaFinPermisoCompleto,
    fecha_limite_opcionales: fechaLimiteOpcionales,
    semanas_totales: semanasTotales,
    aviso: avisoTexto,
  };
}
