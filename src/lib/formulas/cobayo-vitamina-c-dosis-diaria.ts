export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number | object | undefined; _insight?: any; _chart?: any; }

/**
 * Dosis diaria de vitamina C para cobayos/cuyes
 *
 * Fuente principal: Merck Veterinary Manual — Nutritional Problems of Guinea Pigs
 * https://www.merckvetmanual.com/all-other-pets/guinea-pigs/nutritional-problems-of-guinea-pigs
 *
 * Rangos validados:
 *   - Mantenimiento (adulto sano): 10–20 mg/kg/día  → usamos 15 mg/kg como punto medio
 *   - Gestación / lactancia: 30–40 mg/kg/día         → usamos 35 mg/kg como punto medio
 *   - Enfermedad / deficiencia: 25–50 mg/kg/día      → usamos 50 mg/kg (techo terapéutico sin receta)
 *
 * v1 = peso del cobayo en gramos
 * v2 = estado fisiológico (número: 1=sano, 2=gestante/lactante, 3=enfermo)
 */
export function cobayoVitaminaCDosisDiaria(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';

  // v1 = peso en gramos, v2 = estado (1/2/3)
  const pesoG = Number(i.v1) || 0;
  const estado = Number(i.v2) || 1;

  // Rango de cobayos adultos: 700–1200 g típico
  const pesoKg = pesoG / 1000;

  // mg/kg/día por estado fisiológico
  // 1 = sano (mantenimiento):   15 mg/kg/día  (rango 10–20, Merck MVM)
  // 2 = gestante / lactante:    35 mg/kg/día  (rango 30–40, Merck MVM)
  // 3 = enfermo / deficiente:   50 mg/kg/día  (rango 25–50, Merck MVM / Guinea Lynx)
  const dosisMap: Record<number, number> = { 1: 15, 2: 35, 3: 50 };
  const mgPerKg = dosisMap[estado] ?? 15;

  const dosisTotal = pesoG > 0 ? pesoKg * mgPerKg : 0;
  const resultado = dosisTotal.toFixed(1);

  // Etiquetas de estado
  const estadoLabel = {
    es: { 1: 'adulto sano', 2: 'gestante / lactante', 3: 'enfermo / deficiente' },
    en: { 1: 'healthy adult', 2: 'pregnant / nursing', 3: 'sick / deficient' },
    pt: { 1: 'adulto saudável', 2: 'gestante / lactante', 3: 'doente / deficiente' },
  }[__lang] as Record<number, string>;

  const eLabel = estadoLabel[estado] ?? estadoLabel[1];

  // Resumen textual
  const resumen = {
    es: `Cobayo ${eLabel} de ${pesoG} g → ${mgPerKg} mg/kg/día × ${pesoKg.toFixed(3)} kg = **${resultado} mg/día**.`,
    en: `${eLabel.charAt(0).toUpperCase() + eLabel.slice(1)} guinea pig, ${pesoG} g → ${mgPerKg} mg/kg/day × ${pesoKg.toFixed(3)} kg = **${resultado} mg/day**.`,
    pt: `Cobaia ${eLabel} de ${pesoG} g → ${mgPerKg} mg/kg/dia × ${pesoKg.toFixed(3)} kg = **${resultado} mg/dia**.`,
  }[__lang];

  // Fuente de vitamina C y alertas por rango
  const consejoEs = (() => {
    const d = dosisTotal;
    if (pesoG <= 0) return 'Ingresá el peso de tu cobayo para obtener la dosis.';
    if (estado === 1) {
      const tip = d < 10
        ? 'El peso es muy bajo; verificá que ingresaste gramos, no kilogramos.'
        : d > 30
        ? 'Dosis alta para mantenimiento: asegurate de ofrecer pimiento rojo fresco como fuente natural.'
        : '';
      return `Ofrecé ${resultado} mg de vitamina C por día. Fuentes ideales: pimiento rojo/verde (80–190 mg/100 g), perejil (130 mg/100 g), kiwi. ${tip}`;
    }
    if (estado === 2) {
      return `En gestación y lactancia la demanda de vitamina C sube al doble. Administrá ${resultado} mg/día divididos en 2 tomas. Priorizá fuentes naturales frescas.`;
    }
    return `Dosis terapéutica de ${resultado} mg/día. Bajo supervisión veterinaria se puede llegar a 100 mg/kg. Consultá a un veterinario si los síntomas persisten más de 48 h.`;
  })();

  const consejoEn = (() => {
    const d = dosisTotal;
    if (pesoG <= 0) return 'Enter your guinea pig\'s weight to get the dose.';
    if (estado === 1) {
      const tip = d < 10 ? 'Weight seems very low; make sure you entered grams, not kg.' : d > 30 ? 'High maintenance dose: prioritise fresh red bell pepper as a natural source.' : '';
      return `Offer ${resultado} mg of vitamin C per day. Best sources: red/green bell pepper (80–190 mg/100 g), parsley (130 mg/100 g), kiwi. ${tip}`;
    }
    if (estado === 2) {
      return `During pregnancy and nursing, vitamin C needs double. Give ${resultado} mg/day in 2 portions. Prioritise fresh natural sources.`;
    }
    return `Therapeutic dose: ${resultado} mg/day. Under vet supervision up to 100 mg/kg may be used. Consult a vet if symptoms persist beyond 48 h.`;
  })();

  const consejoPt = (() => {
    const d = dosisTotal;
    if (pesoG <= 0) return 'Insira o peso da cobaia para obter a dose.';
    if (estado === 1) {
      const tip = d < 10 ? 'Peso muito baixo; verifique se inseriu gramas, não quilogramas.' : d > 30 ? 'Dose alta para manutenção: priorize pimentão vermelho fresco como fonte natural.' : '';
      return `Ofereça ${resultado} mg de vitamina C por dia. Melhores fontes: pimentão vermelho/verde (80–190 mg/100 g), salsa (130 mg/100 g), kiwi. ${tip}`;
    }
    if (estado === 2) {
      return `Na gestação e lactação a necessidade de vitamina C dobra. Administre ${resultado} mg/dia em 2 porções. Priorize fontes naturais frescas.`;
    }
    return `Dose terapêutica: ${resultado} mg/dia. Sob supervisão veterinária pode-se usar até 100 mg/kg. Consulte um veterinário se os sintomas persistirem mais de 48 h.`;
  })();

  const consejo = { es: consejoEs, en: consejoEn, pt: consejoPt }[__lang];

  // Insight card
  const insightTitle = {
    es: `Dosis: ${resultado} mg/día`,
    en: `Dose: ${resultado} mg/day`,
    pt: `Dose: ${resultado} mg/dia`,
  }[__lang];

  const insightText = { es: consejo, en: consejoEn, pt: consejoPt }[__lang];

  // Unidad localizada por idioma
  const unidadDia = { es: 'mg/día', en: 'mg/day', pt: 'mg/dia' }[__lang];

  // Gauge chart: 0–60 mg/día (rango máximo orientativo sin prescripción)
  const maxGauge = 60;
  const pct = pesoG > 0 ? Math.min(100, (dosisTotal / maxGauge) * 100) : 0;
  const _chart = {
    type: 'gauge',
    value: pct,
    label: `${resultado} ${unidadDia}`,
    min: 0,
    max: maxGauge,
    zones: [
      { from: 0, to: 20, color: '#22c55e' },
      { from: 20, to: 45, color: '#f59e0b' },
      { from: 45, to: maxGauge, color: '#ef4444' },
    ],
  };

  return {
    resultado: `${resultado} ${unidadDia}`,
    resumen,
    _insight: { title: insightTitle, text: insightText, tone: 'neutral', icon: '🐹' },
    _chart,
  };
}
