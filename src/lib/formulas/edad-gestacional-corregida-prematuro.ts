export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function edadGestacionalCorregidaPrematuro(i: Inputs): Outputs {
  const __lang = String(i.__lang || 'es');

  // Inputs
  const semanasGestacion = Number(i.semanas_gestacion) || 0;     // gestational age at birth (weeks)
  const semanasCronologicas = Number(i.semanas_cronologicas) || 0; // chronological age (weeks since birth)

  // Derived values
  const semanasPrematurez = 40 - semanasGestacion;  // weeks premature (deficit from full term)
  const semanasCorregidas = semanasCronologicas - semanasPrematurez; // corrected age in weeks

  // Convert to months and weeks for display
  const mesesCorregidos = Math.floor(semanasCorregidas / 4.345);
  const semanasRestantes = Math.round(semanasCorregidas % 4.345);

  // Clamp for display: negative corrected age means baby is still younger than term
  const aun_en_termino = semanasCorregidas <= 0;
  const mas_de_2_anios = semanasCorregidas >= 104; // 24 months ≈ 104 weeks

  let edadCorregidaDisplay: string;
  let resumen: string;

  if (__lang === 'en') {
    if (semanasGestacion < 23 || semanasGestacion > 36) {
      edadCorregidaDisplay = 'Check values';
      resumen = `This calculator applies to premature babies born between 23 and 36 weeks. Full-term birth is 37–42 weeks. Please verify the gestational age entered.`;
    } else if (aun_en_termino) {
      edadCorregidaDisplay = `${Math.round(40 - semanasGestacion + semanasCronologicas)} wks gestational`;
      resumen = `Baby has not yet reached their expected due date (40 weeks). Current gestational age: ${Math.round(40 - semanasPrematurez + semanasCronologicas)} weeks. Continue following neonatal team guidance.`;
    } else if (mas_de_2_anios) {
      edadCorregidaDisplay = `${mesesCorregidos} months corrected`;
      resumen = `Age correction is typically used until 24 months corrected age. At ${mesesCorregidos} months, you may transition to using chronological age for developmental assessment. Confirm with your pediatrician.`;
    } else {
      edadCorregidaDisplay = mesesCorregidos > 0
        ? (semanasRestantes > 0 ? `${mesesCorregidos} months ${semanasRestantes} wks` : `${mesesCorregidos} months`)
        : `${semanasCorregidas} weeks`;
      resumen = `Corrected age: ${edadCorregidaDisplay}. Born at ${semanasGestacion} weeks (${semanasPrematurez} weeks early). Chronological age: ${semanasCronologicas} weeks. Use corrected age for developmental milestones until 24 months.`;
    }
  } else {
    // Spanish (default)
    if (semanasGestacion < 23 || semanasGestacion > 36) {
      edadCorregidaDisplay = 'Verificar valores';
      resumen = `Esta calculadora aplica a prematuros nacidos entre las 23 y 36 semanas. Un nacimiento a término ocurre entre las 37–42 semanas. Verificá la edad gestacional ingresada.`;
    } else if (aun_en_termino) {
      edadCorregidaDisplay = `${Math.round(40 - semanasPrematurez + semanasCronologicas)} sem gestacionales`;
      resumen = `El bebé aún no llegó a su fecha probable de parto (40 semanas). Edad gestacional actual: ${Math.round(40 - semanasPrematurez + semanasCronologicas)} semanas. Seguir las indicaciones del equipo neonatal.`;
    } else if (mas_de_2_anios) {
      edadCorregidaDisplay = `${mesesCorregidos} meses corregidos`;
      resumen = `La corrección de edad se usa hasta los 24 meses corregidos. Con ${mesesCorregidos} meses, es posible comenzar a usar la edad cronológica para evaluar el desarrollo. Confirmá con el pediatra.`;
    } else {
      edadCorregidaDisplay = mesesCorregidos > 0
        ? (semanasRestantes > 0 ? `${mesesCorregidos} meses ${semanasRestantes} sem` : `${mesesCorregidos} meses`)
        : `${semanasCorregidas} semanas`;
      resumen = `Edad corregida: ${edadCorregidaDisplay}. Nacido a las ${semanasGestacion} sem (${semanasPrematurez} sem prematuro). Edad cronológica: ${semanasCronologicas} sem. Usá la edad corregida para evaluar hitos del desarrollo hasta los 24 meses.`;
    }
  }

  // Insight tone
  let tone: string;
  let iconText: string;
  let insightTitle: string;
  let insightText: string;

  if (__lang === 'en') {
    insightTitle = 'Corrected Age';
    iconText = '👶';
    if (aun_en_termino) {
      tone = 'info';
      insightText = `Baby hasn't reached the expected due date yet. Keep using the neonatal team's guidance for development tracking.`;
    } else if (mas_de_2_anios) {
      tone = 'success';
      insightText = `At **${mesesCorregidos} months corrected age**, you're nearing or past the 24-month mark where most pediatricians transition to chronological age for assessments.`;
    } else {
      tone = 'neutral';
      insightText = `Your baby's corrected age is **${edadCorregidaDisplay}**. Born at ${semanasGestacion} weeks (${semanasPrematurez} weeks early), developmental milestones should be assessed at this corrected age, not at ${semanasCronologicas} chronological weeks.`;
    }
  } else {
    insightTitle = 'Edad corregida';
    iconText = '👶';
    if (aun_en_termino) {
      tone = 'info';
      insightText = `El bebé aún no llegó a la fecha probable de parto. Seguir usando las guías del equipo neonatal para el seguimiento del desarrollo.`;
    } else if (mas_de_2_anios) {
      tone = 'success';
      insightText = `Con **${mesesCorregidos} meses de edad corregida**, estás cerca o superaste los 24 meses donde la mayoría de los pediatras transicionan a la edad cronológica para las evaluaciones.`;
    } else {
      tone = 'neutral';
      insightText = `La edad corregida de tu bebé es **${edadCorregidaDisplay}**. Nacido a las ${semanasGestacion} sem (${semanasPrematurez} sem prematuro), los hitos del desarrollo se evalúan a esta edad corregida, no a las ${semanasCronologicas} sem cronológicas.`;
    }
  }

  return {
    resultado: edadCorregidaDisplay,
    resumen,
    _insight: {
      title: insightTitle,
      text: insightText,
      tone,
      icon: iconText,
    },
  };
}
