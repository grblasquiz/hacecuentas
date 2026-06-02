export interface Inputs {
  tipo_universidad: 'publica_elite' | 'publica_regional' | 'privada_elite' | 'privada_intermedia' | 'privada_economia';
  estrato_familiar?: number; // 1-6
  programa: 'ingenieria' | 'medicina' | 'derecho' | 'administracion' | 'economia' | 'enfermeria' | 'psicologia' | 'artes';
  duracion_semestres: number;
  ingresos_familia_anual: number;
  tiene_beca: 'no' | 'icetex_50' | 'icetex_100' | 'beca_institución' | 'beca_gobierno';
}

export interface Outputs {
  matricula_semestral: number;
  coste_total_carrera: number;
  becas_total: number;
  coste_neto_estudiante: number;
  salario_egreso_promedio: number;
  roi_meses: number;
  cuota_mensual_icetex: number;
  comparativa_texto: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 Colombia
  const UVR_2026 = 43280; // Unidad de Valor Real DIAN
  const SMLV_2026 = 1300000; // Salario Mínimo Legal Vigente
  const TASA_ICETEX = 0.04; // 4% anual
  const MESES_CREDITO = 180; // 15 años
  const GASTOS_ADMIN_PUBLICA = 200000;
  const GASTOS_ADMIN_PRIVADA = 500000;
  const SALARIO_AUXILIAR = 1100000; // baseline comparación

  // 1. Determinar matrícula semestral según tipo universidad
  let matricula_semestral = 0;
  let gastos_admin = GASTOS_ADMIN_PUBLICA;

  if (i.tipo_universidad === 'publica_elite' || i.tipo_universidad === 'publica_regional') {
    // Arancel público por estrato (UNAL, UdeA, UNICAUCA 2026)
    const estrato = i.estrato_familiar || 3;
    const aranceles_publica: Record<number, number> = {
      1: 150000,
      2: 250000,
      3: 800000,
      4: 1500000,
      5: 2100000,
      6: 3200000,
    };
    matricula_semestral = aranceles_publica[estrato] || 800000;
    gastos_admin = GASTOS_ADMIN_PUBLICA;
  } else if (i.tipo_universidad === 'privada_elite') {
    // Javeriana, Andes, Externado
    matricula_semestral = 20000000;
    gastos_admin = GASTOS_ADMIN_PRIVADA;
  } else if (i.tipo_universidad === 'privada_intermedia') {
    // Uninorte, Urosario, Colegio Mayor
    matricula_semestral = 10000000;
    gastos_admin = GASTOS_ADMIN_PRIVADA;
  } else if (i.tipo_universidad === 'privada_economia') {
    // Universidades de economía (tier bajo privado)
    matricula_semestral = 6500000;
    gastos_admin = GASTOS_ADMIN_PRIVADA;
  }

  // 2. Coste total carrera (sin becas)
  const coste_semestral_total = matricula_semestral + gastos_admin;
  const coste_total_carrera = coste_semestral_total * i.duracion_semestres;

  // 3. Calcular becas según tipo y ingresos familia
  let becas_total = 0;
  const ingresos_mensuales = i.ingresos_familia_anual / 12;
  const uvr_mensuales = ingresos_mensuales / UVR_2026;

  if (i.tiene_beca === 'icetex_100') {
    // 100% beca (familia < 3 UVR/mes): típicamente pública
    becas_total = i.tipo_universidad.includes('publica') ? coste_total_carrera : coste_total_carrera * 0.6;
  } else if (i.tiene_beca === 'icetex_50') {
    // 50% beca (familia 3-6 UVR/mes)
    becas_total = coste_total_carrera * 0.5;
  } else if (i.tiene_beca === 'beca_institución') {
    // Beca institución: ~30-40% según méritos
    becas_total = coste_total_carrera * 0.35;
  } else if (i.tiene_beca === 'beca_gobierno') {
    // Ser Pilo Paga: condonable si cumpla criterios
    becas_total = coste_total_carrera * 0.8; // ~80% promedio condonable
  } else {
    becas_total = 0; // Sin beca
  }

  // 4. Coste neto estudiante/familia
  const coste_neto_estudiante = Math.max(0, coste_total_carrera - becas_total);

  // 5. Salario egreso promedio según programa (SENA 2026)
  const salarios_egreso: Record<string, number> = {
    ingenieria: 3500000,
    medicina: 4200000,
    derecho: 2800000,
    administracion: 2400000,
    economia: 2600000,
    enfermeria: 1900000,
    psicologia: 1800000,
    artes: 1600000,
  };
  const salario_egreso_promedio = salarios_egreso[i.programa] || 2500000;

  // 6. ROI (break-even): cuántos meses para recuperar inversión neta
  const ingresos_mensuales_netos = salario_egreso_promedio - SALARIO_AUXILIAR;
  const roi_meses = ingresos_mensuales_netos > 0 ? Math.round((coste_neto_estudiante * 12) / ingresos_mensuales_netos) : 999;

  // 7. Cuota mensual ICETEX (si hay crédito educativo, 15 años, 4%)
  // Fórmula: cuota = P × [r(1+r)^n] / [(1+r)^n - 1]
  // donde P = monto, r = tasa mensual (4%/12), n = meses
  const r_mensual = TASA_ICETEX / 12;
  const factor = Math.pow(1 + r_mensual, MESES_CREDITO);
  const cuota_mensual_icetex = coste_neto_estudiante > 0
    ? (coste_neto_estudiante * (r_mensual * factor)) / (factor - 1)
    : 0;

  // 8. Comparativa texto resumen
  const es_publica = i.tipo_universidad.includes('publica');
  const tipo_inst = es_publica ? 'pública' : 'privada';
  const beca_desc = i.tiene_beca === 'no' ? 'sin beca' : `con ${i.tiene_beca}`;
  const comparativa_texto = `Carrera ${i.programa} en ${tipo_inst} (${i.duracion_semestres} sem) ${beca_desc}: coste total $${coste_total_carrera.toLocaleString('es-CO')}, neto estudiante $${coste_neto_estudiante.toLocaleString('es-CO')}. Salario egreso: $${salario_egreso_promedio.toLocaleString('es-CO')}/mes. ROI: ${roi_meses} meses (${(roi_meses / 12).toFixed(1)} años). Cuota ICETEX: $${Math.round(cuota_mensual_icetex).toLocaleString('es-CO')}/mes.`;

  // ─── Insight narrativo (interpreta el resultado real)
  const netoFmt = `$${Math.round(coste_neto_estudiante).toLocaleString('es-CO')}`;
  const totalFmt = `$${Math.round(coste_total_carrera).toLocaleString('es-CO')}`;
  const anosRoi = (roi_meses / 12).toFixed(1);
  const cubrePct = coste_total_carrera > 0 ? Math.round((becas_total / coste_total_carrera) * 100) : 0;

  let insightTitle: string;
  let insightText: string;
  let insightTone: 'good' | 'warn' | 'neutral';
  let insightIcon: string;

  if (coste_neto_estudiante <= 0) {
    insightTitle = 'Carrera 100% cubierta';
    insightText = `Con tu beca, el coste neto para tu familia es **$0**: la ayuda cubre los **${totalFmt}** de la carrera completa. Aprovechá y cumplí los requisitos para no perder la condonación.`;
    insightTone = 'good';
    insightIcon = '🎓';
  } else if (roi_meses >= 999) {
    insightTitle = 'ROI no favorable';
    insightText = `El salario de egreso estimado (**$${salario_egreso_promedio.toLocaleString('es-CO')}/mes**) no supera el baseline de un auxiliar, así que la inversión de **${netoFmt}** no se recupera por diferencial salarial. Revisá programa o tipo de universidad.`;
    insightTone = 'warn';
    insightIcon = '⚠️';
  } else if (roi_meses <= 36) {
    insightTitle = 'Inversión que se paga sola';
    insightText = `Pagás **${netoFmt}** netos${cubrePct > 0 ? ` (la beca cubre el **${cubrePct}%**)` : ''} y recuperás la inversión en **${anosRoi} años** gracias al diferencial salarial. ROI sólido para ${i.programa}.`;
    insightTone = 'good';
    insightIcon = '📈';
  } else {
    insightTitle = `Recuperás la inversión en ${anosRoi} años`;
    insightText = `El coste neto es **${netoFmt}**${cubrePct > 0 ? ` (beca cubre **${cubrePct}%**)` : ''} y tardás **${anosRoi} años** en recuperarlo por mayor salario. La cuota ICETEX rondaría **$${Math.round(cuota_mensual_icetex).toLocaleString('es-CO')}/mes**.`;
    insightTone = 'neutral';
    insightIcon = '🏛️';
  }

  const _insight = { title: insightTitle, text: insightText, tone: insightTone, icon: insightIcon };

  return {
    matricula_semestral: Math.round(matricula_semestral),
    coste_total_carrera: Math.round(coste_total_carrera),
    becas_total: Math.round(becas_total),
    coste_neto_estudiante: Math.round(coste_neto_estudiante),
    salario_egreso_promedio: Math.round(salario_egreso_promedio),
    roi_meses,
    cuota_mensual_icetex: Math.round(cuota_mensual_icetex),
    comparativa_texto,
    _insight,
    // Donut: el coste total se reparte entre lo que paga la familia y lo que cubre la beca
    ...(becas_total > 0 ? {
      _chart: {
        type: 'doughnut',
        slices: [
          { label: 'Paga la familia', value: Math.round(coste_neto_estudiante) },
          { label: 'Cubre la beca', value: Math.round(becas_total) },
        ],
        prefix: '$',
        centerValue: totalFmt,
        centerLabel: 'Coste total',
        ariaLabel: `Coste total de la carrera ${totalFmt}: ${netoFmt} a cargo de la familia y $${Math.round(becas_total).toLocaleString('es-CO')} cubiertos por beca.`,
      },
    } : {}),
  };
}
