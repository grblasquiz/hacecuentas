export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

export function cafeinaDiariaTazasCafeTopeSeguro(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Caffeine content per serving (mg), based on FDA/EFSA/Mayo Clinic data
  const MG_CAFE_FILTRO = 95;   // brewed coffee 240ml (8oz), FDA reference
  const MG_ESPRESSO    = 65;   // 1 espresso shot ~45ml, FDA/Mayo Clinic
  const MG_TE_NEGRO    = 47;   // black tea 240ml, Mayo Clinic
  const MG_TE_VERDE    = 28;   // green tea 240ml, Mayo Clinic
  const MG_ENERGIZANTE = 80;   // standard energy drink 250ml (e.g. Red Bull), EFSA
  const MG_GASEOSA     = 35;   // cola 354ml (12oz), FDA

  // Inputs — treat empty/missing as 0
  const cafeFiltroCups  = Math.max(0, Number(i.cafe_filtro)  || 0);
  const espressoShots   = Math.max(0, Number(i.espresso)     || 0);
  const teNegroCups     = Math.max(0, Number(i.te_negro)     || 0);
  const teVerdeCups     = Math.max(0, Number(i.te_verde)     || 0);
  const energizanteCans = Math.max(0, Number(i.energizante)  || 0);
  const gaseosaCans     = Math.max(0, Number(i.gaseosa_cola) || 0);
  const perfil          = String(i.perfil || 'adulto');

  // Safe daily limits by profile (FDA/EFSA/WHO)
  const LIMITES: Record<string, number> = {
    adulto:     400, // mg/day — FDA & EFSA for healthy adults
    embarazada: 200, // mg/day — WHO & EFSA for pregnancy/breastfeeding
    adolescente: 100, // mg/day — conservative; AAP says minimize, 2.5mg/kg ~85mg for 34kg teen
  };
  const limite = LIMITES[perfil] ?? 400;

  // Total caffeine
  const total = Math.round(
    cafeFiltroCups  * MG_CAFE_FILTRO +
    espressoShots   * MG_ESPRESSO    +
    teNegroCups     * MG_TE_NEGRO    +
    teVerdeCups     * MG_TE_VERDE    +
    energizanteCans * MG_ENERGIZANTE +
    gaseosaCans     * MG_GASEOSA
  );

  // Remaining margin
  const margen = limite - total;
  const pct    = limite > 0 ? Math.round((total / limite) * 100) : 0;

  // Determine tone/status
  let tone: string;
  let statusLabel: string;
  let statusLabelEn: string;
  if (total === 0) {
    tone = 'neutral';
    statusLabel   = 'Sin consumo registrado';
    statusLabelEn = 'No intake recorded';
  } else if (total <= limite * 0.5) {
    tone = 'positive';
    statusLabel   = 'Bien dentro del límite';
    statusLabelEn = 'Well within the limit';
  } else if (total <= limite) {
    tone = 'warning';
    statusLabel   = 'Cerca del límite diario';
    statusLabelEn = 'Approaching the daily limit';
  } else {
    tone = 'negative';
    statusLabel   = 'Por encima del límite seguro';
    statusLabelEn = 'Above the safe limit';
  }

  const perfilLabel: Record<string, string> = {
    adulto:      __lang === 'en' ? 'healthy adult' : 'adulto sano',
    embarazada:  __lang === 'en' ? 'pregnancy/breastfeeding' : 'embarazo / lactancia',
    adolescente: __lang === 'en' ? 'adolescent' : 'adolescente',
  };

  // Build readable resumen
  let resumen: string;
  if (__lang === 'en') {
    if (total === 0) {
      resumen = `No caffeine entered. The safe daily maximum for a ${perfilLabel[perfil] ?? 'adult'} is ${limite} mg/day (FDA/EFSA).`;
    } else if (margen >= 0) {
      resumen = `Your intake is ${total} mg — ${statusLabelEn}. You have ${margen} mg of margin left before reaching the ${limite} mg/day safe limit for a ${perfilLabel[perfil] ?? 'adult'} (FDA/EFSA). That is ${pct}% of your daily limit.`;
    } else {
      resumen = `Your intake is ${total} mg — ${statusLabelEn} for a ${perfilLabel[perfil] ?? 'adult'} (${limite} mg/day per FDA/EFSA). You are ${Math.abs(margen)} mg over the recommended maximum. Consider reducing intake or spacing it over more days.`;
    }
  } else {
    if (total === 0) {
      resumen = `No ingresaste consumo. El máximo diario seguro para ${perfilLabel[perfil] ?? 'adulto sano'} es ${limite} mg/día (FDA/EFSA).`;
    } else if (margen >= 0) {
      resumen = `Tu ingesta es ${total} mg — ${statusLabel}. Te quedan ${margen} mg de margen antes de llegar al tope de ${limite} mg/día para ${perfilLabel[perfil] ?? 'adulto sano'} (FDA/EFSA). Eso es el ${pct}% de tu límite diario.`;
    } else {
      resumen = `Tu ingesta es ${total} mg — ${statusLabel} para ${perfilLabel[perfil] ?? 'adulto sano'} (${limite} mg/día según FDA/EFSA). Excedés en ${Math.abs(margen)} mg el máximo recomendado. Considerá reducir el consumo o distribuirlo en más días.`;
    }
  }

  const _insight = {
    title: __lang === 'en'
      ? `${total} mg of caffeine today`
      : `${total} mg de cafeína hoy`,
    text: __lang === 'en'
      ? `${statusLabelEn}. ${pct}% of the ${limite} mg/day safe maximum for a ${perfilLabel[perfil] ?? 'adult'}.`
      : `${statusLabel}. ${pct}% del tope seguro de ${limite} mg/día para ${perfilLabel[perfil] ?? 'adulto sano'}.`,
    tone,
    icon: '☕',
  };

  return {
    resultado: `${total} mg`,
    resumen,
    _insight,
  };
}
