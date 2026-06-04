export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Escala de adulto equivalente del INDEC (Cuadro 3, metodología CBA/CBT)
// Referencia: varón de 30-60 años con actividad moderada = 1.00
const AE_TABLE: Record<string, number> = {
  varon_adulto:   1.00,  // Varón 18-60 años
  mujer_adulta:   0.77,  // Mujer 18-60 años
  varon_mayor:    0.83,  // Varón > 60 años
  mujer_mayor:    0.71,  // Mujer > 60 años
  nino_0_1:       0.36,  // Niño/Niña 0-1 año (promedio)
  nino_2_3:       0.46,  // Niño/Niña 2-3 años (promedio)
  nino_4_6:       0.56,  // Niño/Niña 4-6 años (promedio)
  nino_7_9:       0.70,  // Niño/Niña 7-9 años (promedio)
  nino_10_12:     0.78,  // Niño/Niña 10-12 años (promedio)
  nino_13_17:     0.85,  // Niño/Niña 13-17 años (promedio)
};

// Coeficiente de Engel inverso (ICE) para Gran Buenos Aires
// ICE = CBT / CBA = 475.653 / 215.222 ≈ 2.21 (abril 2026)
const ICE_DEFAULT = 2.21;

// CBA por adulto equivalente publicada por INDEC (abril 2026, GBA)
const CBA_AE_DEFAULT = 215222;

export function canastaBasicaHogarInecGastoMensual(i: Inputs): Outputs {
  const lang = (i.__lang as string) || 'es';

  // Cantidad de integrantes por tipo
  const varonAdulto = Math.max(0, Math.round(Number(i.varon_adulto) || 0));
  const mujerAdulta = Math.max(0, Math.round(Number(i.mujer_adulta) || 0));
  const varonMayor  = Math.max(0, Math.round(Number(i.varon_mayor)  || 0));
  const mujerMayor  = Math.max(0, Math.round(Number(i.mujer_mayor)  || 0));
  const nino01      = Math.max(0, Math.round(Number(i.nino_0_1)     || 0));
  const nino23      = Math.max(0, Math.round(Number(i.nino_2_3)     || 0));
  const nino46      = Math.max(0, Math.round(Number(i.nino_4_6)     || 0));
  const nino79      = Math.max(0, Math.round(Number(i.nino_7_9)     || 0));
  const nino1012    = Math.max(0, Math.round(Number(i.nino_10_12)   || 0));
  const nino1317    = Math.max(0, Math.round(Number(i.nino_13_17)   || 0));

  // CBA por adulto equivalente (editable para actualizar con datos INDEC más recientes)
  const cbaAe = Number(i.cba_adulto_equivalente) > 0
    ? Number(i.cba_adulto_equivalente)
    : CBA_AE_DEFAULT;

  // Total personas en el hogar
  const totalPersonas = varonAdulto + mujerAdulta + varonMayor + mujerMayor
    + nino01 + nino23 + nino46 + nino79 + nino1012 + nino1317;

  if (totalPersonas === 0) {
    if (lang === 'en') {
      return {
        adultos_equivalentes: '0.00',
        cba_hogar: '$0',
        cbt_hogar: '$0',
        cbt_por_persona: '$0',
        resumen: 'Add at least one household member to calculate.',
        _insight: {
          title: 'How to use this calculator',
          text: 'Enter the number of people living in your household by age group. The calculator uses the **INDEC equivalence scale** to weight each member according to their nutritional needs.',
          tone: 'neutral',
          icon: '🛒',
        },
      };
    }
    return {
      adultos_equivalentes: '0.00',
      cba_hogar: '$0',
      cbt_hogar: '$0',
      cbt_por_persona: '$0',
      resumen: 'Agregá al menos un integrante al hogar para calcular.',
      _insight: {
        title: 'Cómo usar esta calculadora',
        text: 'Ingresá la cantidad de personas que viven en el hogar por grupo etario. La calculadora usa la **escala de equivalencia del INDEC** para ponderar a cada integrante según sus necesidades nutricionales.',
        tone: 'neutral',
        icon: '🛒',
      },
    };
  }

  // Suma de adultos equivalentes del hogar
  const aeTotal =
    varonAdulto * AE_TABLE.varon_adulto +
    mujerAdulta * AE_TABLE.mujer_adulta +
    varonMayor  * AE_TABLE.varon_mayor  +
    mujerMayor  * AE_TABLE.mujer_mayor  +
    nino01      * AE_TABLE.nino_0_1     +
    nino23      * AE_TABLE.nino_2_3     +
    nino46      * AE_TABLE.nino_4_6     +
    nino79      * AE_TABLE.nino_7_9     +
    nino1012    * AE_TABLE.nino_10_12   +
    nino1317    * AE_TABLE.nino_13_17;

  // CBA del hogar = CBA por AE × total AE del hogar
  const cbaHogar = cbaAe * aeTotal;

  // CBT del hogar = CBA del hogar × ICE
  const cbtHogar = cbaHogar * ICE_DEFAULT;

  // CBT per cápita
  const cbtPerCapita = cbtHogar / totalPersonas;

  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  if (lang === 'en') {
    const overUnder = cbtHogar >= 1_000_000
      ? `This household requires **${fmt(cbtHogar)}** per month to stay above the poverty line (CBT) — equivalent to **${fmt(cbtPerCapita)}** per person.`
      : `This household requires **${fmt(cbtHogar)}** per month to stay above the poverty line (CBT).`;

    return {
      adultos_equivalentes: aeTotal.toFixed(2),
      cba_hogar: fmt(cbaHogar),
      cbt_hogar: fmt(cbtHogar),
      cbt_por_persona: fmt(cbtPerCapita),
      resumen: `${totalPersonas} members · ${aeTotal.toFixed(2)} adult-equiv. · Food basket: ${fmt(cbaHogar)} · Total basket: ${fmt(cbtHogar)}`,
      _insight: {
        title: 'Poverty line reference',
        text: overUnder + ` The **food basket (CBA)** sets the indigence line at **${fmt(cbaHogar)}**. If household income falls below this, the household is considered indigent. Values based on INDEC April 2026 data — update the CBA/AE field monthly as INDEC publishes new figures.`,
        tone: 'neutral',
        icon: '🛒',
      },
    };
  }

  // Español
  const interpretacion = cbtHogar >= 1_000_000
    ? `Este hogar necesita **${fmt(cbtHogar)}/mes** para superar la línea de pobreza (CBT), lo que equivale a **${fmt(cbtPerCapita)}/mes** por persona.`
    : `Este hogar necesita **${fmt(cbtHogar)}/mes** para superar la línea de pobreza (CBT).`;

  return {
    adultos_equivalentes: aeTotal.toFixed(2),
    cba_hogar: fmt(cbaHogar),
    cbt_hogar: fmt(cbtHogar),
    cbt_por_persona: fmt(cbtPerCapita),
    resumen: `${totalPersonas} integrantes · ${aeTotal.toFixed(2)} adultos equivalentes · CBA (indigencia): ${fmt(cbaHogar)} · CBT (pobreza): ${fmt(cbtHogar)}`,
    _insight: {
      title: 'Referencia línea de pobreza',
      text: interpretacion + ` La **canasta básica alimentaria (CBA)** marca la línea de indigencia en **${fmt(cbaHogar)}**. Si el ingreso total cae por debajo, el hogar se considera indigente según el INDEC. Los valores se basan en los datos de abril 2026 del INDEC — actualizá el campo CBA/AE mensualmente con la última publicación oficial.`,
      tone: 'neutral',
      icon: '🛒',
    },
  };
}
