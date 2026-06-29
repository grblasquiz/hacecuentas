/** Auto: ¿contado o a crédito? Comparador México 2026.
 *
 *  Compara el SOBREPRECIO del crédito (intereses pagados de más) contra el
 *  COSTO DE OPORTUNIDAD de pagar de contado (lo que ese dinero rendiría
 *  invertido en CETES durante el plazo). Mensualidad por anualidad francesa.
 *
 *  Sin riesgo fiscal: matemática financiera pura. CETES es una referencia
 *  editable (no constante de ley).
 */

export interface Inputs {
  precioAuto: number;
  enganche: number;
  tasaAnual: number;
  plazoMeses: number;
  tasaCetes: number;
}

export interface Outputs {
  mensualidad: number;
  totalFinanciado: number;
  sobreprecioCredito: number;
  costoOportunidadContado: number;
  recomendacion: string;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function autoContadoVsFinanciadoMexico(i: Inputs): Outputs {
  const precio = Number(i.precioAuto);
  const enganche = Math.max(0, Number(i.enganche) || 0);
  const tasaAnual = Math.max(0, Number(i.tasaAnual) || 0);
  const plazo = Math.max(1, Math.floor(Number(i.plazoMeses) || 0));
  const tasaCetes = Number(i.tasaCetes);
  const cetes = Number.isFinite(tasaCetes) ? Math.max(0, tasaCetes) : 7.1;

  if (!precio || precio <= 0) throw new Error('Ingresá el precio del auto');
  if (enganche >= precio) throw new Error('El enganche no puede ser mayor o igual al precio del auto');

  const montoFin = precio - enganche;
  const i_m = (tasaAnual / 100) / 12;
  // Anualidad francesa (cuota fija). Si la tasa es 0, se reparte el capital.
  const mensualidad = i_m === 0 ? montoFin / plazo : (montoFin * i_m) / (1 - Math.pow(1 + i_m, -plazo));
  const totalFinanciado = enganche + mensualidad * plazo;
  const sobreprecioCredito = totalFinanciado - precio;

  const years = plazo / 12;
  // Costo de oportunidad: lo que el precio completo rendiría invertido en CETES durante el plazo.
  const costoOportunidadContado = precio * (Math.pow(1 + cetes / 100, years) - 1);

  const recomendacion = sobreprecioCredito > costoOportunidadContado
    ? 'Contado conviene'
    : 'Financiar puede convenir si invertís el dinero';

  const formula = `Mensualidad = $${Math.round(montoFin).toLocaleString('es-MX')} × i / (1 − (1+i)^−${plazo}) = $${Math.round(mensualidad).toLocaleString('es-MX')}. Sobreprecio del crédito = $${Math.round(sobreprecioCredito).toLocaleString('es-MX')}. Costo de oportunidad de contado (CETES ${cetes}%) = $${Math.round(costoOportunidadContado).toLocaleString('es-MX')}.`;
  const explicacion = `Financiando un auto de $${precio.toLocaleString('es-MX')} con $${enganche.toLocaleString('es-MX')} de enganche a ${tasaAnual}% anual en ${plazo} meses, pagás $${Math.round(mensualidad).toLocaleString('es-MX')} al mes y un total de $${Math.round(totalFinanciado).toLocaleString('es-MX')}: $${Math.round(sobreprecioCredito).toLocaleString('es-MX')} de sobreprecio por intereses. Pagar de contado tiene un costo de oportunidad: esos $${precio.toLocaleString('es-MX')} invertidos en CETES al ${cetes}% rendirían unos $${Math.round(costoOportunidadContado).toLocaleString('es-MX')} en ${years.toFixed(1)} años. ${sobreprecioCredito > costoOportunidadContado ? 'Como el sobreprecio del crédito supera ese rendimiento, pagar de contado conviene.' : 'Como el rendimiento posible supera el sobreprecio del crédito, financiar puede convenir si efectivamente invertís el dinero que no usaste.'}`;

  const chart = {
    type: 'bar' as const,
    bars: [
      { label: 'Sobreprecio crédito', value: Math.round(sobreprecioCredito) },
      { label: 'Costo oport. contado', value: Math.round(costoOportunidadContado) },
    ],
    prefix: '$',
    ariaLabel: `Sobreprecio del crédito ${Math.round(sobreprecioCredito)} vs costo de oportunidad de contado ${Math.round(costoOportunidadContado)} pesos.`,
  };

  const insight = {
    title: recomendacion,
    text: sobreprecioCredito > costoOportunidadContado
      ? `El crédito te cuesta **$${Math.round(sobreprecioCredito).toLocaleString('es-MX')}** de más en intereses, contra **$${Math.round(costoOportunidadContado).toLocaleString('es-MX')}** que rendirían tus pesos en CETES. **Contado conviene.**`
      : `Tus pesos en CETES rendirían **$${Math.round(costoOportunidadContado).toLocaleString('es-MX')}**, más que los **$${Math.round(sobreprecioCredito).toLocaleString('es-MX')}** de intereses del crédito. **Financiar puede convenir** si de verdad invertís el dinero que no desembolsaste.`,
    tone: 'good' as const,
    icon: '🚗',
  };

  return {
    mensualidad: Math.round(mensualidad * 100) / 100,
    totalFinanciado: Math.round(totalFinanciado * 100) / 100,
    sobreprecioCredito: Math.round(sobreprecioCredito * 100) / 100,
    costoOportunidadContado: Math.round(costoOportunidadContado * 100) / 100,
    recomendacion,
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
