/**
 * Prima de antigüedad (México) — LFT Art. 162.
 *
 * 12 días de salario por cada año de servicio, con el salario diario TOPADO a
 * 2× el salario mínimo de la zona (Art. 486 LFT). Para fracciones de año se
 * paga de forma proporcional.
 *
 * Dato con vigencia anual: salario mínimo 2026 (CONASAMI, DOF 19-dic-2025):
 *   general $315.04/día · Zona Libre de la Frontera Norte $440.87/día.
 *
 * NO es asesoría legal: es una estimación del monto. Devuelve outputs + _insight
 * (con la regla de los 15 años para renuncia voluntaria) + _table (desglose).
 */

export interface PrimaAntiguedadInputs {
  salario_diario: number | string;
  anos_servicio: number | string;
  zona?: string; // 'general' | 'frontera'
  __lang?: string;
}

export interface PrimaAntiguedadOutputs {
  prima: number;
  salario_topado: number;
  dias_pagados: number;
  _insight?: any;
  _table?: any;
}

// Salario mínimo diario 2026 (CONASAMI, vigente 1-ene-2026). Actualizar cada
// enero cuando la Comisión publica los nuevos montos en el DOF.
const SALARIO_MINIMO_2026 = { general: 315.04, frontera: 440.87 } as const;

export function primaDeAntiguedadMexico(inputs: PrimaAntiguedadInputs): PrimaAntiguedadOutputs {
  const salario = Number(inputs.salario_diario);
  const anos = Number(inputs.anos_servicio);
  if (!salario || salario <= 0) throw new Error('Ingresá un salario diario válido (en pesos).');
  if (!(anos > 0)) throw new Error('Ingresá los años de servicio (mayor a 0).');

  const zona: 'general' | 'frontera' = inputs.zona === 'frontera' ? 'frontera' : 'general';
  const minimo = SALARIO_MINIMO_2026[zona];
  const tope = 2 * minimo; // Art. 486 LFT: base máxima = 2× salario mínimo de la zona
  const salarioTopado = Math.min(salario, tope);
  const topeAplicado = salario > tope;

  // 12 días por año, proporcional para fracciones de año.
  const dias = 12 * anos;
  const prima = dias * salarioTopado;

  const f = (n: number) => '$' + n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const zonaLbl = zona === 'frontera' ? 'Zona Libre de la Frontera Norte' : 'zona general';

  const texto = topeAplicado
    ? `Con ${anos} año${anos === 1 ? '' : 's'} de servicio te corresponden **${f(prima)}** de prima de antigüedad. Como tu salario diario (${f(salario)}) supera el tope legal de **2 salarios mínimos** (${f(tope)} en ${zonaLbl}), el cálculo usa ese tope, no tu salario real (Art. 486 LFT).`
    : `Con ${anos} año${anos === 1 ? '' : 's'} de servicio te corresponden **${f(prima)}** de prima de antigüedad: 12 días de salario por año × ${anos} = ${dias.toFixed(dias % 1 === 0 ? 0 : 1)} días × ${f(salarioTopado)}.`;

  const insight = {
    type: 'highlight',
    icon: '⚖️',
    text:
      texto +
      ' **Importante:** la prima de antigüedad se paga siempre por despido (justificado o no), muerte, incapacidad o jubilación; en caso de **renuncia voluntaria solo se cobra con 15 años o más** de antigüedad (Art. 162 LFT).',
  };

  return {
    prima: Math.round(prima * 100) / 100,
    salario_topado: Math.round(salarioTopado * 100) / 100,
    dias_pagados: Math.round(dias * 100) / 100,
    _insight: insight,
    _table: {
      title: 'Cómo se calcula tu prima de antigüedad',
      headers: ['Concepto', 'Valor'],
      rows: [
        ['Salario diario declarado', f(salario)],
        [`Tope legal (2× mínimo, ${zonaLbl})`, f(tope)],
        ['Salario base usado', f(salarioTopado) + (topeAplicado ? ' (topeado)' : '')],
        ['Días a pagar (12 × años)', String(dias % 1 === 0 ? dias : dias.toFixed(1))],
        ['Prima de antigüedad', f(prima)],
      ],
      note: 'Prima de antigüedad = 12 días de salario por año de servicio (Art. 162 LFT), con salario topado a 2 salarios mínimos de la zona (Art. 486 LFT). Salario mínimo 2026 CONASAMI: general $315.04, Frontera Norte $440.87. Estimación; no sustituye el cálculo del patrón ni asesoría legal.',
    },
  };
}
