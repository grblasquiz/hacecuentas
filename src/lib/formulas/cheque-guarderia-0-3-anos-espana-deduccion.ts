export interface Inputs {
  gasto_mensual_guarderia: number;
  num_hijos_menores_3: number;
  situacion_laboral_madre: 'trabajadora_por_cuenta_ajena' | 'trabajadora_autonoma' | 'profesional_colegiado' | 'desempleada_activa' | 'incapacidad_temporal';
  num_hijos_menores_8: number;
  ambos_progenitores: 'si' | 'no' | 'monoparental';
  renta_anual_estimada?: number;
}

export interface Outputs {
  gasto_anual_guarderia: number;
  deduccion_permitida_maximo: number;
  deduccion_aplicable: number;
  ahorro_fiscal_estimado: number;
  ahorro_mensual: number;
  deduccion_maternidad_compatible: number;
  deduccion_total_estimada: number;
  requisitos_cumplidos: string;
  notas_aplicacion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes AEAT 2026
  const DEDUCCION_GUARDERIA_POR_HIJO = 1000; // €/año máximo por hijo < 3 años (AEAT)
  const DEDUCCION_GUARDERIA_MAXIMA = 3000; // €/año máximo por progenitor (AEAT art. 47)
  const DEDUCCION_MATERNIDAD_BASE = 1200; // €/año (AEAT art. 47bis, 2 hijos)
  const DEDUCCION_MATERNIDAD_AMPLIADA = 1500; // €/año si 3+ hijos
  const TRAMO_IRPF_APROXIMADO = 0.30; // 30% como media (19-45% según renta)

  // Validaciones básicas
  const gasto_mensual = Math.max(0, i.gasto_mensual_guarderia || 0);
  const num_hijos = Math.max(1, Math.min(i.num_hijos_menores_3, 10));
  const num_hijos_menores_8 = Math.max(1, Math.min(i.num_hijos_menores_8, 10));
  const renta_anual = i.renta_anual_estimada || 30000;

  // 1. Gasto anual
  const gasto_anual_guarderia = gasto_mensual * 12;

  // 2. Deducción máxima permitida por ley
  // Mínimo: 1.000€ × número de hijos, máximo 3.000€
  const deduccion_permitida_maximo = Math.min(
    DEDUCCION_GUARDERIA_POR_HIJO * num_hijos,
    DEDUCCION_GUARDERIA_MAXIMA
  );

  // 3. Deducción aplicable (mínimo entre gasto real y límite legal)
  const deduccion_aplicable = Math.min(
    gasto_anual_guarderia,
    deduccion_permitida_maximo
  );

  // 4. Ahorro fiscal estimado (aplicando tramo IRPF medio 30%)
  // En realidad varía 19-45%; usamos 30% como aproximación
  const ahorro_fiscal_estimado = deduccion_aplicable * TRAMO_IRPF_APROXIMADO;

  // 5. Ahorro mensual
  const ahorro_mensual = ahorro_fiscal_estimado / 12;

  // 6. Deducción maternidad compatible
  let deduccion_maternidad_compatible = DEDUCCION_MATERNIDAD_BASE;
  if (num_hijos_menores_8 >= 2) {
    deduccion_maternidad_compatible = DEDUCCION_MATERNIDAD_AMPLIADA; // 1.500€ si 2+ hijos
  }

  // 7. Deducción total estimada (guardería + maternidad)
  const deduccion_total_estimada = deduccion_aplicable + deduccion_maternidad_compatible;

  // 8. Requisitos cumplidos
  let requisitos_cumplidos = '';
  let cumple_todos = true;

  // Requisito 1: Situación laboral (debe generar rentas del trabajo)
  if (
    i.situacion_laboral_madre === 'desempleada_activa' ||
    i.situacion_laboral_madre === 'incapacidad_temporal'
  ) {
    requisitos_cumplidos += '✓ Situación laboral: percibe prestación (aplica como renta laboral)\n';
  } else if (i.situacion_laboral_madre === 'trabajadora_por_cuenta_ajena') {
    requisitos_cumplidos += '✓ Situación laboral: trabajadora asalariada (aplica deducción)\n';
  } else if (i.situacion_laboral_madre === 'trabajadora_autonoma') {
    requisitos_cumplidos += '✓ Situación laboral: autónoma (aplica deducción)\n';
  } else if (i.situacion_laboral_madre === 'profesional_colegiado') {
    requisitos_cumplidos += '✓ Situación laboral: profesional liberal (aplica deducción)\n';
  }

  // Requisito 2: Hijos menores de 3 años
  if (num_hijos > 0) {
    requisitos_cumplidos += `✓ Hijos menores de 3 años: ${num_hijos} (aplica deducción)\n`;
  } else {
    requisitos_cumplidos += '✗ No hay hijos menores de 3 años\n';
    cumple_todos = false;
  }

  // Requisito 3: Guardería debe estar autorizada (no verificable en calc, aviso)
  if (gasto_anual_guarderia > 0) {
    requisitos_cumplidos += '⚠ Guardería debe estar autorizada por administración educativa (verifica con CCAA)\n';
  }

  // Requisito 4: Justificante de pago
  if (gasto_anual_guarderia > 0) {
    requisitos_cumplidos += '⚠ Conservar factura y comprobante de pago (mínimo 4 años para AEAT)\n';
  }

  // 9. Notas y limitaciones
  let notas_aplicacion = '';

  if (deduccion_aplicable === 0) {
    notas_aplicacion = 'No hay deducción aplicable (sin gasto guardería o sin hijos < 3 años).';
  } else if (gasto_anual_guarderia > deduccion_permitida_maximo) {
    notas_aplicacion = `Gasto guardería (${gasto_anual_guarderia.toFixed(
      2
    )}€) supera límite legal (${deduccion_permitida_maximo.toFixed(
      2
    )}€). Solo deducible hasta límite.`;
  } else {
    notas_aplicacion = `Puedes deducir hasta ${deduccion_aplicable.toFixed(
      2
    )}€ en tu IRPF 2026. Ahorro estimado: ${ahorro_fiscal_estimado.toFixed(
      2
    )}€ (aplicando tramo ~30%, puede ser 19-45% según ingresos).`;
  }

  // Avisos adicionales
  if (i.ambos_progenitores === 'si') {
    notas_aplicacion += ` Como pareja, podéis repartir deducción (ej: 1.000€ cada uno si hay 2 hijos) o concentrar en quien tiene renta más alta.`;
  }

  if (num_hijos_menores_8 >= 3) {
    notas_aplicacion += ` Tienes ${num_hijos_menores_8} hijos < 8 años: deducción maternidad ampliada a 1.500€/año.`;
  }

  // Validación: si no cumple requisitos mínimos, indicar
  if (!cumple_todos) {
    notas_aplicacion =
      'No cumples requisitos mínimos (debes tener al menos 1 hijo < 3 años en guardería autorizada).';
  }

  // Insight narrativo dinámico
  const fmtEur = (n: number) => n.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  let _insight: any;
  if (!cumple_todos || deduccion_aplicable === 0) {
    _insight = {
      title: 'Sin deducción aplicable',
      text: 'Con estos datos **no podés deducir** la guardería: hace falta al menos **1 hijo menor de 3 años** en un centro autorizado y gasto efectivo. Revisá los requisitos.',
      tone: 'neutral',
      icon: '🍼',
    };
  } else {
    const topado = gasto_anual_guarderia > deduccion_permitida_maximo;
    _insight = {
      title: 'Tu ahorro en el IRPF',
      text: `Podés deducir **${fmtEur(deduccion_aplicable)} €** de guardería y sumar **${fmtEur(deduccion_maternidad_compatible)} €** de maternidad: hasta **${fmtEur(deduccion_total_estimada)} €** menos en tu IRPF, un ahorro de **${fmtEur(ahorro_fiscal_estimado)} €** al tramo ~30%.` + (topado ? ` Ojo: tu gasto real (${fmtEur(gasto_anual_guarderia)} €) **supera el tope legal**, así que el excedente no resta.` : ''),
      tone: topado ? 'warn' : 'good',
      icon: '🍼',
    };
  }

  return {
    gasto_anual_guarderia: parseFloat(gasto_anual_guarderia.toFixed(2)),
    deduccion_permitida_maximo: parseFloat(deduccion_permitida_maximo.toFixed(2)),
    deduccion_aplicable: parseFloat(deduccion_aplicable.toFixed(2)),
    ahorro_fiscal_estimado: parseFloat(ahorro_fiscal_estimado.toFixed(2)),
    ahorro_mensual: parseFloat(ahorro_mensual.toFixed(2)),
    deduccion_maternidad_compatible: parseFloat(
      deduccion_maternidad_compatible.toFixed(2)
    ),
    deduccion_total_estimada: parseFloat(deduccion_total_estimada.toFixed(2)),
    requisitos_cumplidos: requisitos_cumplidos.trim(),
    notas_aplicacion: notas_aplicacion.trim(),
    _insight,
    ...(cumple_todos && deduccion_aplicable > 0
      ? {
          _chart: {
            type: 'doughnut',
            slices: [
              { label: 'Deducción guardería', value: parseFloat(deduccion_aplicable.toFixed(2)) },
              { label: 'Deducción maternidad', value: parseFloat(deduccion_maternidad_compatible.toFixed(2)) },
            ],
            prefix: '€',
            centerValue: `${fmtEur(deduccion_total_estimada)} €`,
            centerLabel: 'Deducción total',
            ariaLabel: `Deducción total de ${fmtEur(deduccion_total_estimada)} euros: ${fmtEur(deduccion_aplicable)} de guardería más ${fmtEur(deduccion_maternidad_compatible)} de maternidad`,
          },
        }
      : {}),
  };
}
