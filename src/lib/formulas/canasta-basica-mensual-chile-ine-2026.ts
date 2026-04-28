export interface Inputs {
  adultos: number;
  adolescentes: number;
  ninos: number;
  menores: number;
  incluir_cbt: boolean;
  cadena_supermercado: 'promedio' | 'lider' | 'jumbo' | 'tottus' | 'unimarc';
  salario_mensual?: number;
}

export interface Outputs {
  cba_total: number;
  cbt_total: number;
  cba_por_persona: number;
  ajuste_cadena: number;
  cba_ajustada: number;
  porcentaje_salario: number;
  personas_totales: number;
  composicion_detalle: string;
  margen_seguridad: number;
  comparacion_cadenas: string;
}

export function compute(i: Inputs): Outputs {
  // Constantes INE 2026 - Canasta Básica Alimentaria
  // Fuente: INE Abril 2026
  const CBA_ADULTO = 70500;
  const CBA_ADOLESCENTE = CBA_ADULTO * 0.85; // 59925
  const CBA_NINO = CBA_ADULTO * 0.60; // 42300
  const CBA_MENOR = CBA_ADULTO * 0.45; // 31725

  // CBT es aproximadamente 2x CBA
  const CBT_FACTOR = 2.0;

  // Ajustes por cadena supermercado (variación respecto promedio)
  const CADENA_AJUSTES: Record<string, number> = {
    'promedio': 0,
    'lider': 0.05,
    'jumbo': 0,
    'tottus': 0,
    'unimarc': -0.03
  };

  // Validaciones mínimas
  const personas = (i.adultos || 0) + (i.adolescentes || 0) + (i.ninos || 0) + (i.menores || 0);
  if (personas < 1) {
    return {
      cba_total: 0,
      cbt_total: 0,
      cba_por_persona: 0,
      ajuste_cadena: 0,
      cba_ajustada: 0,
      porcentaje_salario: 0,
      personas_totales: 0,
      composicion_detalle: 'Error: debes ingresar al menos 1 persona.',
      margen_seguridad: 0,
      comparacion_cadenas: ''
    };
  }

  // Cálculo CBA Total
  const cba_total = (i.adultos || 0) * CBA_ADULTO +
                    (i.adolescentes || 0) * CBA_ADOLESCENTE +
                    (i.ninos || 0) * CBA_NINO +
                    (i.menores || 0) * CBA_MENOR;

  // Cálculo CBT
  const cbt_total = i.incluir_cbt ? cba_total * CBT_FACTOR : cba_total;

  // CBA por persona
  const cba_por_persona = personas > 0 ? Math.round(cba_total / personas) : 0;

  // Ajuste cadena
  const ajuste_cadena = CADENA_AJUSTES[i.cadena_supermercado] || 0;

  // CBA ajustada
  const cba_ajustada = Math.round(cba_total * (1 + ajuste_cadena));

  // Porcentaje del salario
  const salario = (i.salario_mensual || 0) > 0 ? i.salario_mensual : 1; // Evitar división por cero
  const porcentaje_salario = (i.salario_mensual || 0) > 0 ? Math.round((cba_ajustada / salario) * 10000) / 100 : 0;

  // Margen de seguridad 15%
  const margen_seguridad = Math.round(cba_ajustada * 1.15);

  // Composición detalle
  const adultos_pct = personas > 0 ? Math.round((i.adultos / personas) * 100) : 0;
  const adolescentes_pct = personas > 0 ? Math.round((i.adolescentes / personas) * 100) : 0;
  const ninos_pct = personas > 0 ? Math.round((i.ninos / personas) * 100) : 0;
  const menores_pct = personas > 0 ? Math.round((i.menores / personas) * 100) : 0;

  const composicion_detalle = `Composición: ${i.adultos} adultos (${adultos_pct}%), ${i.adolescentes} adolescentes (${adolescentes_pct}%), ${i.ninos} niños (${ninos_pct}%), ${i.menores} menores (${menores_pct}%). Pesos relativos aplicados: adulto 100%, adolescente 85%, niño 60%, menor 45%.`;

  // Comparación cadenas (tabla estimada)
  const lider_price = Math.round(cba_total * 1.05);
  const jumbo_price = cba_total;
  const tottus_price = cba_total;
  const unimarc_price = Math.round(cba_total * 0.97);
  const ahorro_unimarc_vs_lider = Math.round(lider_price - unimarc_price);

  const comparacion_cadenas = `Estimado para tu familia (${personas} personas):\n` +
    `- Líder: $${lider_price.toLocaleString('es-CL')} (+5%)\n` +
    `- Jumbo: $${jumbo_price.toLocaleString('es-CL')} (base)\n` +
    `- Tottus: $${tottus_price.toLocaleString('es-CL')} (base)\n` +
    `- Unimarc: $${unimarc_price.toLocaleString('es-CL')} (-3%)\n` +
    `Ahorro comprando en Unimarc vs Líder: $${ahorro_unimarc_vs_lider.toLocaleString('es-CL')}/mes (~${Math.round((ahorro_unimarc_vs_lider / lider_price) * 100)}%).`;

  return {
    cba_total: Math.round(cba_total),
    cbt_total: Math.round(cbt_total),
    cba_por_persona,
    ajuste_cadena: Math.round(ajuste_cadena * 100 * 100) / 100, // Porcentaje
    cba_ajustada,
    porcentaje_salario: (i.salario_mensual || 0) > 0 ? porcentaje_salario : 0,
    personas_totales: personas,
    composicion_detalle,
    margen_seguridad,
    comparacion_cadenas
  };
}
