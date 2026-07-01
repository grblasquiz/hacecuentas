/** Cuánto necesitás ganar para mantener una familia.
 * Metodología de adulto equivalente (AE) del INDEC: adulto = 1,00 AE,
 * menor (hasta 17 años, promedio de la escala) = 0,63 AE — mismos coeficientes
 * que costo-supermercado-canasta-basica.ts, así nunca divergen.
 * Ingreso necesario = (CBT del hogar + alquiler) / (1 − ahorro%/100):
 * el margen de ahorro se calcula como porcentaje del ingreso total.
 * El valor de la CBT por AE lo ingresa el usuario (dato mensual del INDEC). */

export interface Inputs {
  adultos: number;
  menores?: number;
  cbtPorAdulto: number;
  alquilerMensual?: number;
  ahorroPct?: number;
}

export interface Outputs {
  ingresoNecesario: number;
  cbtHogar: number;
  ahorroMensual: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
}

// Coeficientes de adulto equivalente (INDEC, simplificados):
const COEF_ADULTO = 1.0;
const COEF_MENOR = 0.63;

export function cuantoNecesitoGanarParaMantenerUnaFamilia(i: Inputs): Outputs {
  const adultos = Number(i.adultos);
  const menores = Number(i.menores) || 0;
  const cbtPorAdulto = Number(i.cbtPorAdulto);
  const alquiler = Number(i.alquilerMensual) || 0;
  const ahorroPct = Number(i.ahorroPct) || 0;

  if (isNaN(adultos) || adultos <= 0) throw new Error('Ingresá la cantidad de adultos del hogar');
  if (menores < 0) throw new Error('La cantidad de hijos no puede ser negativa');
  if (isNaN(cbtPorAdulto) || cbtPorAdulto <= 0) throw new Error('Ingresá el valor de la CBT por adulto equivalente (dato INDEC)');
  if (alquiler < 0) throw new Error('El alquiler no puede ser negativo');
  if (isNaN(ahorroPct) || ahorroPct < 0 || ahorroPct >= 100) throw new Error('El margen de ahorro debe estar entre 0% y 99%');

  const adultosEquivalentes = adultos * COEF_ADULTO + menores * COEF_MENOR;
  const cbtHogar = adultosEquivalentes * cbtPorAdulto;
  const gastosBase = cbtHogar + alquiler;

  // Gross-up: si querés ahorrar el X% del ingreso, el ingreso debe cubrir
  // gastos base con el (100−X)% restante.
  const ingresoNecesario = gastosBase / (1 - ahorroPct / 100);
  const ahorroMensual = ingresoNecesario - gastosBase;
  const personas = adultos + menores;

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

  const detalle =
    `Hogar de ${adultos} adulto(s) + ${menores} hijo(s) = ${adultosEquivalentes.toFixed(2)} adultos equivalentes (INDEC). ` +
    `CBT del hogar: ${adultosEquivalentes.toFixed(2)} × $${fmt.format(cbtPorAdulto)} = $${fmt.format(cbtHogar)}/mes` +
    (alquiler > 0 ? ` + alquiler $${fmt.format(alquiler)}` : ' (vivienda propia, sin alquiler)') +
    (ahorroPct > 0 ? ` + ahorro del ${ahorroPct}% del ingreso ($${fmt.format(ahorroMensual)})` : '') +
    `. Ingreso familiar necesario: $${fmt.format(ingresoNecesario)}/mes ($${fmt.format(ingresoNecesario / personas)}/persona).`;

  const insight = {
    title: 'La línea de tu hogar',
    text: `Tu hogar equivale a **${adultosEquivalentes.toFixed(2)} adultos equivalentes**: su Canasta Básica Total es **$${fmt.format(cbtHogar)}/mes** — ese es el umbral de pobreza del INDEC para tu familia. ` +
      (alquiler > 0
        ? `Sumando el alquiler de **$${fmt.format(alquiler)}**${ahorroPct > 0 ? ` y un ahorro del **${ahorroPct}%**` : ''}, necesitan ingresos por **$${fmt.format(ingresoNecesario)}** entre todos los que aportan.`
        : `${ahorroPct > 0 ? `Con un ahorro del **${ahorroPct}%**, ` : ''}Necesitan ingresos por **$${fmt.format(ingresoNecesario)}** entre todos los que aportan. Tener vivienda propia baja mucho la vara.`),
    tone: alquiler > cbtHogar * 0.5 ? 'warn' : 'neutral',
    icon: '👨‍👩‍👧‍👦',
  };

  const slices = [
    { label: 'Canasta Básica Total', value: Math.round(cbtHogar) },
  ];
  if (alquiler > 0) slices.push({ label: 'Alquiler', value: Math.round(alquiler) });
  if (ahorroMensual > 0) slices.push({ label: 'Ahorro', value: Math.round(ahorroMensual) });

  const chart = {
    type: 'doughnut' as const,
    slices,
    prefix: '$',
    centerValue: '$' + fmt.format(Math.round(ingresoNecesario)),
    centerLabel: 'Ingreso necesario',
    ariaLabel: 'Composición del ingreso familiar necesario: canasta básica total, alquiler y ahorro.',
  };

  return {
    ingresoNecesario: Math.round(ingresoNecesario),
    cbtHogar: Math.round(cbtHogar),
    ahorroMensual: Math.round(ahorroMensual),
    detalle,
    _insight: insight,
    _chart: chart,
  };
}
