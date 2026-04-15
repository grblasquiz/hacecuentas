/** Propina en restaurante por país */
export interface PropinaRestauranteInputs {
  montoCuenta: number;
  pais?: string;
  comensales?: number;
}
export interface PropinaRestauranteOutputs {
  propinaSugerida: number;
  porcentaje: string;
  totalConPropina: number;
  detalle: string;
}

interface InfoPropina {
  pctMin: number;
  pctMax: number;
  costumbre: string;
}

const PAISES: Record<string, InfoPropina> = {
  eeuu: { pctMin: 18, pctMax: 20, costumbre: 'Casi obligatoria. Los meseros dependen de la propina como sueldo.' },
  canada: { pctMin: 15, pctMax: 18, costumbre: 'Esperada, similar a EE.UU. pero levemente menor.' },
  europa: { pctMin: 5, pctMax: 10, costumbre: 'Opcional. Redondear la cuenta o dejar 5-10% está bien.' },
  reinoUnido: { pctMin: 10, pctMax: 12.5, costumbre: 'Esperada. Algunos restaurantes agregan "service charge" — verificá en la cuenta.' },
  espana: { pctMin: 5, pctMax: 10, costumbre: 'Opcional. Dejar monedas o redondear es lo habitual.' },
  italia: { pctMin: 0, pctMax: 5, costumbre: 'No se espera. El "coperto" (EUR 1-3) es cargo de cubierto, no propina.' },
  francia: { pctMin: 0, pctMax: 5, costumbre: 'Incluida ("service compris"). Dejar monedas extra es un gesto amable pero no esperado.' },
  japon: { pctMin: 0, pctMax: 0, costumbre: 'NO dejar propina. Es considerado irrespetuoso en la cultura japonesa.' },
  china: { pctMin: 0, pctMax: 0, costumbre: 'No es costumbre. Solo en restaurantes de lujo para turistas.' },
  brasil: { pctMin: 10, pctMax: 10, costumbre: 'Suele venir incluida ("taxa de serviço 10%"). Si la ves en la cuenta, no dejes más.' },
  mexico: { pctMin: 10, pctMax: 15, costumbre: 'Esperada. 10-15% es lo estándar. En zonas turísticas esperan más.' },
  argentina: { pctMin: 10, pctMax: 10, costumbre: 'Esperada. 10% es lo estándar. No obligatoria pero muy esperada.' },
  colombia: { pctMin: 10, pctMax: 10, costumbre: 'Suele venir sugerida en la cuenta ("propina voluntaria 10%"). Aceptar o no.' },
  australia: { pctMin: 0, pctMax: 10, costumbre: 'Opcional. No se espera pero 10% es apreciado en restaurantes buenos.' },
  tailandia: { pctMin: 0, pctMax: 10, costumbre: 'No obligatoria. 10% en restaurantes turísticos, monedas en locales.' },
  turquia: { pctMin: 10, pctMax: 15, costumbre: 'Esperada. 10-15% en restaurantes, redondear en cafés.' },
};

export function propinaRestaurantePaisPorcentaje(inputs: PropinaRestauranteInputs): PropinaRestauranteOutputs {
  const monto = Number(inputs.montoCuenta);
  const pais = String(inputs.pais || 'eeuu');
  const comensales = Number(inputs.comensales) || 2;

  if (!monto || monto <= 0) throw new Error('Ingresá el monto de la cuenta');
  if (!PAISES[pais]) throw new Error('País no disponible');

  const info = PAISES[pais];
  const pctPromedio = (info.pctMin + info.pctMax) / 2;
  const propina = Number((monto * pctPromedio / 100).toFixed(2));
  const total = Number((monto + propina).toFixed(2));

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 2 });
  const porcentajeTexto = info.pctMin === info.pctMax
    ? `${info.pctMin}%`
    : `${info.pctMin}-${info.pctMax}%`;

  return {
    propinaSugerida: propina,
    porcentaje: porcentajeTexto,
    totalConPropina: total,
    detalle: `Cuenta: ${fmt.format(monto)}. Propina sugerida (${porcentajeTexto}): ${fmt.format(propina)}. Total: ${fmt.format(total)}${comensales > 1 ? ` (${fmt.format(total / comensales)} por persona)` : ''}. ${info.costumbre}`,
  };
}
