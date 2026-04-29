export interface Inputs {
  total_guests: number;
  adult_percentage: number;
  event_type: string;
  carne_percent: number;
  pollo_percent: number;
  jyq_percent: number;
  verdura_percent: number;
  cost_per_dozen: number;
}

export interface Outputs {
  total_empanadas: number;
  total_dozens: number;
  empanadas_carne: number;
  empanadas_pollo: number;
  empanadas_jyq: number;
  empanadas_verdura: number;
  estimated_cost: number;
  adults_portion: number;
  children_portion: number;
}

export function compute(i: Inputs): Outputs {
  const total_guests = Math.max(1, Number(i.total_guests) || 1);
  const adult_percentage = Math.max(0, Math.min(100, Number(i.adult_percentage) || 70));
  const event_type = String(i.event_type || 'principal');
  const carne_percent = Math.max(0, Math.min(100, Number(i.carne_percent) || 40));
  const pollo_percent = Math.max(0, Math.min(100, Number(i.pollo_percent) || 30));
  const jyq_percent = Math.max(0, Math.min(100, Number(i.jyq_percent) || 20));
  const verdura_percent = Math.max(0, Math.min(100, Number(i.verdura_percent) || 10));
  const cost_per_dozen = Math.max(0, Number(i.cost_per_dozen) || 1200);

  // Porción base por tipo de evento (2026 standard)
  let portion_adult = 5;
  let portion_child = 4;
  
  if (event_type === 'picada') {
    portion_adult = 2.5;
    portion_child = 2;
  } else if (event_type === 'picoteo') {
    portion_adult = 2;
    portion_child = 1.5;
  } else {
    // principal
    portion_adult = 6;
    portion_child = 5;
  }

  // Calcular adultos y niños
  const num_adults = Math.round(total_guests * (adult_percentage / 100));
  const num_children = total_guests - num_adults;

  // Empanadas por grupo
  const adults_portion = Math.round(num_adults * portion_adult);
  const children_portion = Math.round(num_children * portion_child);
  const total_empanadas = adults_portion + children_portion;

  // Desglose por sabor (normalizar porcentajes)
  const total_percent = carne_percent + pollo_percent + jyq_percent + verdura_percent;
  const carne_norm = total_percent > 0 ? carne_percent / total_percent : 0.4;
  const pollo_norm = total_percent > 0 ? pollo_percent / total_percent : 0.3;
  const jyq_norm = total_percent > 0 ? jyq_percent / total_percent : 0.2;
  const verdura_norm = total_percent > 0 ? verdura_percent / total_percent : 0.1;

  const empanadas_carne = Math.round(total_empanadas * carne_norm);
  const empanadas_pollo = Math.round(total_empanadas * pollo_norm);
  const empanadas_jyq = Math.round(total_empanadas * jyq_norm);
  const empanadas_verdura = Math.round(total_empanadas * verdura_norm);

  // Docenas (redondear hacia arriba)
  const total_dozens = Math.ceil(total_empanadas / 12);

  // Costo estimado
  const estimated_cost = total_dozens * cost_per_dozen;

  return {
    total_empanadas,
    total_dozens: Math.round(total_dozens * 100) / 100,
    empanadas_carne,
    empanadas_pollo,
    empanadas_jyq,
    empanadas_verdura,
    estimated_cost,
    adults_portion,
    children_portion
  };
}
