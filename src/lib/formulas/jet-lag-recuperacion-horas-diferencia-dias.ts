export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }

/**
 * Jet-lag recovery estimator.
 *
 * Scientific basis (CDC Yellow Book 2026, Sleep Foundation):
 *   - Eastward travel: circadian clock can advance ~1 h/day → 1 day per time zone crossed
 *   - Westward travel: circadian clock can delay ~1.5 h/day → 0.67 days per time zone crossed
 *
 * Formula:
 *   East:  days = Δh × 1.0
 *   West:  days = Δh × (2/3) ≈ Δh × 0.67
 *
 * Source: CDC Yellow Book 2026 – Jet Lag Disorder
 *         https://www.cdc.gov/yellow-book/hcp/travel-air-sea/jet-lag-disorder.html
 */
export function jetLagRecuperacionHorasDiferenciaDias(i: Inputs): Outputs {
  const __lang = (i.__lang as string) || 'es';

  const horasDiferencia = Math.max(0, Number(i.horasDiferencia) || 0);
  const direccion = String(i.direccion || 'este').toLowerCase();

  // 0 zones → no jet lag
  if (horasDiferencia === 0) {
    const diasRecuperacion = 0;
    const resultado = __lang === 'en'
      ? `0 days (no time zone change)`
      : `0 días (sin cambio de zona horaria)`;
    const resumen = __lang === 'en'
      ? `No time zone difference — no jet lag, only possible travel fatigue.`
      : `Sin diferencia horaria — sin jet lag; puede haber fatiga de viaje pero no desajuste circadiano.`;
    const _insight = {
      title: __lang === 'en' ? 'No jet lag' : 'Sin jet lag',
      text: __lang === 'en'
        ? 'No time zones crossed. Any tiredness is travel fatigue, not circadian desynchrony.'
        : 'No cruzaste zonas horarias. El cansancio es fatiga de viaje, no jet lag real.',
      tone: 'positive',
      icon: '✅',
    };
    return { resultado, resumen, diasRecuperacion: diasRecuperacion.toFixed(1), _insight };
  }

  // Rate of circadian adjustment per day
  // Eastward (phase advance): ~1 h/day → 1 day per time zone
  // Westward (phase delay):  ~1.5 h/day → 0.67 days per time zone
  const factorDias = direccion === 'este' ? 1.0 : 2 / 3;
  const rawDias = horasDiferencia * factorDias;
  const diasRecuperacion = Math.round(rawDias * 10) / 10; // 1 decimal

  // Phase description
  const esteLabel = __lang === 'en' ? 'eastward' : 'hacia el este';
  const oesteLabel = __lang === 'en' ? 'westward' : 'hacia el oeste';
  const dirLabel = direccion === 'este' ? esteLabel : oesteLabel;

  // Build human-readable outputs
  let resultado: string;
  let resumen: string;

  if (__lang === 'en') {
    resultado = diasRecuperacion === 1
      ? `~1 day`
      : `~${diasRecuperacion} days`;
    resumen = `${horasDiferencia}h difference, ${dirLabel}. `
      + `Estimated recovery: ${diasRecuperacion} day${diasRecuperacion !== 1 ? 's' : ''}. `
      + (direccion === 'este'
        ? `(Eastward: clock advances ~1 h/day, so 1 day per time zone.)`
        : `(Westward: clock delays ~1.5 h/day, so ~0.67 days per time zone.)`);
  } else {
    resultado = `~${diasRecuperacion} día${diasRecuperacion !== 1 ? 's' : ''}`;
    resumen = `${horasDiferencia} horas de diferencia, vuelo ${dirLabel}. `
      + `Recuperación estimada: ${diasRecuperacion} día${diasRecuperacion !== 1 ? 's' : ''}. `
      + (direccion === 'este'
        ? `(Al este: el reloj avanza ~1 h/día → 1 día por zona horaria.)`
        : `(Al oeste: el reloj retrasa ~1,5 h/día → ~0,67 días por zona horaria.)`);
  }

  // Severity label
  let tono: string;
  let icono: string;
  let tituloInsight: string;
  if (diasRecuperacion <= 2) {
    tono = 'positive';
    icono = '🟢';
    tituloInsight = __lang === 'en' ? 'Mild jet lag' : 'Jet lag leve';
  } else if (diasRecuperacion <= 5) {
    tono = 'neutral';
    icono = '🟡';
    tituloInsight = __lang === 'en' ? 'Moderate jet lag' : 'Jet lag moderado';
  } else if (diasRecuperacion <= 10) {
    tono = 'warning';
    icono = '🟠';
    tituloInsight = __lang === 'en' ? 'Significant jet lag' : 'Jet lag significativo';
  } else {
    tono = 'critical';
    icono = '🔴';
    tituloInsight = __lang === 'en' ? 'Severe jet lag' : 'Jet lag severo';
  }

  let textoInsight: string;
  if (__lang === 'en') {
    textoInsight = `**${diasRecuperacion} days** of estimated full recovery. `
      + (diasRecuperacion > 7
        ? `Plan your schedule to avoid key commitments in the first ${Math.ceil(diasRecuperacion / 2)} days.`
        : diasRecuperacion > 3
          ? `Avoid major decisions or physical exertion in the first 1–2 days.`
          : `Mild effect — sleep at local time and you should adapt quickly.`);
  } else {
    textoInsight = `**${diasRecuperacion} días** de recuperación estimada completa. `
      + (diasRecuperacion > 7
        ? `Planificá evitar compromisos importantes los primeros ${Math.ceil(diasRecuperacion / 2)} días.`
        : diasRecuperacion > 3
          ? `Evitá decisiones importantes o esfuerzo físico en los primeros 1–2 días.`
          : `Efecto leve — dormí en el horario local y te adaptarás rápido.`);
  }

  const _insight = {
    title: tituloInsight,
    text: textoInsight,
    tone: tono,
    icon: icono,
  };

  return {
    resultado,
    resumen,
    diasRecuperacion: diasRecuperacion.toFixed(1),
    _insight,
  };
}
