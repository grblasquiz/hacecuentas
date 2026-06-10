import { MEXICO_2026 } from '../data/mexico-2026';

export interface Inputs {
  salario_diario_integrado: number;
  semanas_cotizadas: number;
  fecha_parto_estimada: string; // YYYY-MM-DD
}

export interface Outputs {
  cumple_requisito: boolean;
  uma_diaria_2026: number;
  salario_diario_pagado: number;
  subsidio_total_maternidad: number;
  fecha_inicio_licencia: string;
  fecha_fin_licencia: string;
  dias_pagados: number;
  diferencia_sdi_vs_limite: number;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes 2026 México — fuente única src/lib/data/mexico-2026.ts (INEGI/LSS)
  const UMA_DIARIA_2026 = MEXICO_2026.uma.diaria; // UMA diaria 2026 = $117,31

  // Límite IMSS del SDI: 25 veces UMA diaria (LSS Art. 28)
  const LIMITE_UMA = MEXICO_2026.imss.topeSbcUmas * UMA_DIARIA_2026; // 25 UMA ≈ $2.932,75/día
  
  // Requisito mínimo: 30 semanas cotizadas últimos 12 meses
  const SEMANAS_MINIMAS = 30;
  
  // Duración licencia: 12 semanas = 84 días (6 semanas antes + 6 semanas después)
  const DIAS_LICENCIA = 84;
  const DIAS_ANTES_PARTO = 42;
  const DIAS_DESPUES_PARTO = 42;
  
  // 1. Validar requisito mínimo
  const cumple_requisito = i.semanas_cotizadas >= SEMANAS_MINIMAS;
  
  // 2. Salario diario pagado: mínimo entre SDI e límite IMSS
  const salario_diario_pagado = Math.min(
    i.salario_diario_integrado,
    LIMITE_UMA
  );
  
  // 3. Subsidio total: salario diario × 84 días
  let subsidio_total_maternidad = 0;
  if (cumple_requisito) {
    subsidio_total_maternidad = salario_diario_pagado * DIAS_LICENCIA;
  } else {
    // Sin requisito mínimo, no hay subsidio IMSS
    subsidio_total_maternidad = 0;
  }
  
  // 4. Fechas de licencia
  const fecha_parto = new Date(i.fecha_parto_estimada);
  
  // Inicio: 42 días antes del parto
  const fecha_inicio = new Date(fecha_parto);
  fecha_inicio.setDate(fecha_inicio.getDate() - DIAS_ANTES_PARTO);
  const fecha_inicio_licencia = fecha_inicio.toISOString().split('T')[0];
  
  // Fin: 42 días después del parto
  const fecha_fin = new Date(fecha_parto);
  fecha_fin.setDate(fecha_fin.getDate() + DIAS_DESPUES_PARTO);
  const fecha_fin_licencia = fecha_fin.toISOString().split('T')[0];
  
  // 5. Diferencia si SDI excede límite IMSS
  const diferencia_sdi_vs_limite = Math.max(
    0,
    (i.salario_diario_integrado - LIMITE_UMA) * DIAS_LICENCIA
  );
  
  // 6. Días pagados
  const dias_pagados = cumple_requisito ? DIAS_LICENCIA : 0;
  
  const subsidioR = Math.round(subsidio_total_maternidad * 100) / 100;
  const diferenciaR = Math.round(diferencia_sdi_vs_limite * 100) / 100;
  const excedeLimite = i.salario_diario_integrado > LIMITE_UMA;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-MX');

  let _insight: any;
  let _chart: any;
  if (!cumple_requisito) {
    _insight = {
      title: 'No cumplís el requisito IMSS',
      text: `Con **${i.semanas_cotizadas} semanas** cotizadas no llegás a las **${SEMANAS_MINIMAS}** que pide el IMSS en los últimos 12 meses, así que no hay subsidio en dinero. Conservás el derecho a las 12 semanas de licencia, pero el pago quedaría a cargo del patrón (Art. 170 LFT) o sin cobertura.`,
      tone: 'warn',
      icon: '🤰',
    };
  } else if (excedeLimite) {
    const cubiertoTotal = salario_diario_pagado * DIAS_LICENCIA;
    const baseTotal = cubiertoTotal + diferenciaR;
    _insight = {
      title: 'Tu salario supera el tope IMSS',
      text: `El IMSS paga hasta **25 UMA** (${fmt(LIMITE_UMA)}/día), así que cobrás **${fmt(subsidioR)}** por las 12 semanas y quedan **${fmt(diferenciaR)}** sin cubrir respecto de tu SDI real. Esa diferencia la asume el patrón sólo si lo pactaron por contrato.`,
      tone: 'warn',
      icon: '🤰',
    };
    _chart = {
      type: 'doughnut',
      slices: [
        { label: 'Paga el IMSS', value: Math.round(cubiertoTotal) },
        { label: 'No cubierto', value: Math.round(diferenciaR) },
      ],
      prefix: '$',
      centerValue: fmt(baseTotal),
      centerLabel: 'Salario 84 días',
      ariaLabel: `Sobre tu salario de ${fmt(baseTotal)} en 84 días, el IMSS cubre ${fmt(cubiertoTotal)} y quedan ${fmt(diferenciaR)} sin cubrir`,
    };
  } else {
    _insight = {
      title: 'Subsidio IMSS al 100%',
      text: `Cumplís las ${SEMANAS_MINIMAS} semanas requeridas y tu SDI está dentro del tope: el IMSS te paga el **100%**, **${fmt(salario_diario_pagado)}/día** durante ${DIAS_LICENCIA} días (6 antes + 6 después del parto), **${fmt(subsidioR)}** en total.`,
      tone: 'good',
      icon: '🤰',
    };
  }

  return {
    cumple_requisito,
    uma_diaria_2026: UMA_DIARIA_2026,
    salario_diario_pagado,
    subsidio_total_maternidad: subsidioR,
    fecha_inicio_licencia,
    fecha_fin_licencia,
    dias_pagados,
    diferencia_sdi_vs_limite: diferenciaR,
    _insight,
    ...(_chart ? { _chart } : {})
  };
}
