export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | object; }

/**
 * Monotributo Social — cuota real y ahorro vs. Monotributo común (Cat. A).
 * Ley 25.865 / Decreto 806/2004: componente impositivo EXENTO al 100%, y
 * aportes SIPA (jubilación) + obra social reducidos al 50%.
 * Valores base ARCA vigentes feb 2026 (mismos de la referenceTable de la calc).
 */
export function monotributoSocialBeneficioExencion(i: Inputs): Outputs {
  // Componentes de la cuota común de categoría A (ARCA, feb 2026)
  const IMPUESTO_COMUN = 6999;
  const SIPA_COMUN = 20208;
  const OS_COMUN = 15180;
  const cuotaComunA = IMPUESTO_COMUN + SIPA_COMUN + OS_COMUN; // 42.387

  // Monotributo Social: impuesto exento, SIPA y OS al 50%
  const impuestoSocial = 0;
  const sipaSocial = Math.round(SIPA_COMUN * 0.5); // 10.104
  const osSocial = Math.round(OS_COMUN * 0.5);     // 7.590
  const cuotaSocial = impuestoSocial + sipaSocial + osSocial; // 17.694

  const ahorroMensual = cuotaComunA - cuotaSocial; // 24.693
  const ahorroAnual = ahorroMensual * 12;          // 296.316

  const fact = Number(i.facturacionMensual) || 0;
  const fmt = (n: number) => '$' + Math.round(n).toLocaleString('es-AR');

  // El tope exacto de la categoría A lo fija ARCA; no lo hardcodeamos.
  const eleg = fact > 0
    ? `Con una facturación de ${fmt(fact)}/mes, confirmá en ARCA que no superes el tope anual de la categoría A. Si lo superás, ya no calificás para el Social y corresponde el Monotributo común.`
    : `Aplica mientras tu facturación anual no supere el tope de la categoría A (lo confirma ARCA al inscribirte).`;

  return {
    cuotaSocial: fmt(cuotaSocial),
    cuotaComun: fmt(cuotaComunA),
    ahorroMensual: fmt(ahorroMensual),
    desglose: `Impuesto integrado: $0 (exento) · SIPA: ${fmt(sipaSocial)} (50%) · Obra social: ${fmt(osSocial)} (50%)`,
    _insight: {
      title: 'Tu cuota de Monotributo Social',
      text: `Pagás **${fmt(cuotaSocial)}/mes** en lugar de **${fmt(cuotaComunA)}** de la categoría A común: **ahorrás ${fmt(ahorroMensual)} por mes** (${fmt(ahorroAnual)} al año), y conservás obra social, aportes jubilatorios y la posibilidad de facturar. ${eleg}`,
      tone: 'positive',
      icon: '🤝',
    },
  };
}
