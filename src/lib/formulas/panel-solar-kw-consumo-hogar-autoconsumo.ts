export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/**
 * Solar panel system sizing for residential self-consumption (autoconsumo).
 *
 * Formula (IEC 61724 / NREL PVWatts methodology):
 *   Paneles = ConsumoMensual_kWh / (PotenciaPanel_kWp × HSP × 30 × Eficiencia)
 *   PotenciaTotal_kWp = Paneles_redondeados × PotenciaPanel_kWp
 *   GeneracionEstimada_kWh = PotenciaTotal_kWp × HSP × 30 × Eficiencia
 *
 * Inputs:
 *   consumo_kwh   — monthly electricity consumption from utility bill (kWh/month)
 *   potencia_wp   — peak power of each panel (Wp), e.g. 450 Wp
 *   hsp           — Peak Sun Hours at the installation location (h/day)
 *   eficiencia    — overall system efficiency as a percentage (%), typically 75–85%
 *
 * Outputs:
 *   resultado     — number of panels required (rounded up)
 *   potencia_kwp  — total installed peak power (kWp)
 *   resumen       — narrative interpretation
 *
 * Sources:
 *   NREL PVWatts (pvwatts.nrel.gov), IEC 61724-1:2021, IRESUD / INTI Argentina,
 *   Secretaría de Energía Argentina — Ley 27.424 Generación Distribuida.
 */
export function panelSolarKwConsumoHogarAutoconsumo(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';

  // Parse inputs with safe defaults
  const consumo = Number(i.consumo_kwh) || 0;   // kWh/month
  const potenciaWp = Number(i.potencia_wp) || 400; // Wp per panel
  const hsp = Number(i.hsp) || 4.5;              // Peak Sun Hours h/day
  const eficienciaPct = Number(i.eficiencia) || 80; // %

  // Convert panel power to kWp
  const potenciaKwp = potenciaWp / 1000;

  // System efficiency as decimal (e.g. 80% → 0.80)
  const eta = Math.max(0.5, Math.min(1.0, eficienciaPct / 100));

  // Guard: avoid division by zero
  if (consumo <= 0 || potenciaKwp <= 0 || hsp <= 0) {
    const msg = __lang === 'en'
      ? 'Enter valid values greater than zero for all fields.'
      : 'Ingresá valores válidos mayores a cero en todos los campos.';
    return {
      resultado: 0,
      potencia_kwp: '0.00',
      resumen: msg,
      _insight: {
        title: __lang === 'en' ? 'Awaiting data' : 'Sin datos',
        text: msg,
        tone: 'neutral',
        icon: '☀️',
      },
    };
  }

  // Monthly generation per panel (kWh/month) = kWp × HSP × 30 days × η
  const generacionPorPanel = potenciaKwp * hsp * 30 * eta;

  // Number of panels (exact, then ceiling)
  const panelesExactos = consumo / generacionPorPanel;
  const panelesNecesarios = Math.ceil(panelesExactos);

  // Total installed peak power
  const potenciaTotalKwp = panelesNecesarios * potenciaKwp;

  // Estimated monthly generation with the rounded system
  const generacionEstimada = potenciaTotalKwp * hsp * 30 * eta;

  // Coverage ratio (how much of the bill is covered)
  const coberturaPct = Math.min(100, (generacionEstimada / consumo) * 100);

  // Format numbers
  const panStr = panelesNecesarios.toString();
  const kwpStr = potenciaTotalKwp.toFixed(2);
  const genStr = generacionEstimada.toFixed(0);
  const cobStr = coberturaPct.toFixed(0);

  // Narrative insight
  let tone: string;
  let insightText: string;

  if (__lang === 'en') {
    if (panelesNecesarios <= 6) {
      tone = 'positive';
      insightText = `Your home needs **${panStr} panels** of ${potenciaWp} W each — a relatively compact **${kwpStr} kWp** system. At ${hsp} PSH/day with ${eficienciaPct}% efficiency, it would generate ~**${genStr} kWh/month**, covering ~**${cobStr}%** of your ${consumo} kWh bill. A system this size typically costs USD 3,000–6,000 before tax credits.`;
    } else if (panelesNecesarios <= 15) {
      tone = 'neutral';
      insightText = `Your home needs **${panStr} panels** (${potenciaWp} W each) for a **${kwpStr} kWp** system. At ${hsp} PSH/day with ${eficienciaPct}% efficiency, expect ~**${genStr} kWh/month** generated — covering ~**${cobStr}%** of your ${consumo} kWh consumption. Verify your roof has enough south-facing, unshaded area (roughly ${(panelesNecesarios * 2.2).toFixed(0)} m²).`;
    } else {
      tone = 'warning';
      insightText = `Your consumption calls for **${panStr} panels** — a large **${kwpStr} kWp** system. Before proceeding, verify structural roof capacity (each panel weighs ~22 kg) and check local utility rules on maximum export capacity. Splitting across multiple roof sections or adding a battery may be more practical.`;
    }

    return {
      resultado: panelesNecesarios,
      potencia_kwp: kwpStr,
      resumen: `${panStr} panels × ${potenciaWp} W = ${kwpStr} kWp total. Estimated monthly generation: ${genStr} kWh (${cobStr}% of your ${consumo} kWh bill).`,
      _insight: {
        title: `${panStr} panels — ${kwpStr} kWp system`,
        text: insightText,
        tone,
        icon: '☀️',
      },
    };
  }

  // Spanish
  if (panelesNecesarios <= 6) {
    tone = 'positive';
    insightText = `Tu hogar necesita **${panStr} paneles** de ${potenciaWp} W cada uno — un sistema relativamente compacto de **${kwpStr} kWp**. Con ${hsp} HSP/día y ${eficienciaPct}% de eficiencia, generará aproximadamente **${genStr} kWh/mes**, cubriendo el ~**${cobStr}%** de tu consumo de ${consumo} kWh. Un sistema de este tamaño cuesta aproximadamente USD 1.800–3.500 instalado en Argentina.`;
  } else if (panelesNecesarios <= 15) {
    tone = 'neutral';
    insightText = `Tu hogar necesita **${panStr} paneles** de ${potenciaWp} W — un sistema de **${kwpStr} kWp**. Con ${hsp} HSP/día y ${eficienciaPct}% de eficiencia, se estima una generación de ~**${genStr} kWh/mes**, cubriendo el ~**${cobStr}%** de tu consumo de ${consumo} kWh. Verificá que el techo tenga suficiente superficie libre orientada al norte (~${(panelesNecesarios * 2.2).toFixed(0)} m² aproximadamente).`;
  } else {
    tone = 'warning';
    insightText = `Tu consumo requiere **${panStr} paneles** — un sistema grande de **${kwpStr} kWp**. Antes de avanzar, verificá la capacidad estructural del techo (cada panel pesa ~22 kg) y consultá con tu distribuidora (Edenor/Edesur/EPEC) los límites de inyección a red permitidos bajo la Ley 27.424.`;
  }

  return {
    resultado: panelesNecesarios,
    potencia_kwp: kwpStr,
    resumen: `${panStr} paneles × ${potenciaWp} W = ${kwpStr} kWp totales. Generación estimada: ${genStr} kWh/mes (cubre el ${cobStr}% de tu consumo de ${consumo} kWh).`,
    _insight: {
      title: `${panStr} paneles — sistema de ${kwpStr} kWp`,
      text: insightText,
      tone,
      icon: '☀️',
    },
  };
}
