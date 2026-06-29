/** ISR por retiro anticipado de PPR / ahorro voluntario AFORE — México 2026.
 *
 *  ⚠️ ESTIMADOR. El ISR definitivo de un retiro anticipado depende de tu
 *  declaración anual (se acumula a tus demás ingresos) y de exenciones que NO
 *  se modelan acá (p. ej. exención por edad 65+/invalidez de 5 UMA anuales,
 *  Art. 93-IV/XIII LISR). La retención del 20% (Art. 145 LISR) es un pago
 *  provisional, no el impuesto final. Consultá a un contador.
 *
 *  Datos fiscales (UMA 2026, tarifa ISR anual 2026): fuente única
 *  src/lib/data/mexico-2026.ts.
 */
import { MEXICO_2026, isrAnual2026 } from '../data/mexico-2026';

export interface Inputs {
  montoRetiro: number;
}

export interface Outputs {
  retencion20: number;
  ingresoAcumulable: number;
  isrEstimado: number;
  neto: number;
  formula: string;
  explicacion: string;
  _chart?: any;
  _insight?: any;
}

export function isrRetiroPprAforeVoluntarioAnticipadoMexico(i: Inputs): Outputs {
  const monto = Number(i.montoRetiro);
  if (!monto || monto <= 0) throw new Error('Ingresá el monto que vas a retirar');

  // Retención provisional del 20% sobre el retiro (Art. 145 LISR).
  const retencion20 = 0.2 * monto;

  // El retiro se considera ingreso acumulable: se suma a tus demás ingresos del año.
  const ingresoAcumulable = monto;

  // Estimación gruesa del ISR tratando el retiro como base anual aislada (Art. 152).
  // NO es el impuesto definitivo: en la declaración anual se acumula a otros ingresos.
  const isrEstimado = isrAnual2026(monto);

  // Neto inmediato tras la retención del 20% (lo que efectivamente recibís).
  const neto = monto - retencion20;

  const formula = `Retención 20% = 0.20 × $${monto.toLocaleString('es-MX')} = $${retencion20.toLocaleString('es-MX')}. Neto inmediato = $${neto.toLocaleString('es-MX')}. ISR estimado anual ≈ $${Math.round(isrEstimado).toLocaleString('es-MX')} (provisional).`;
  const explicacion = `Sobre un retiro anticipado de $${monto.toLocaleString('es-MX')} MXN, la administradora te retiene el 20% ($${Math.round(retencion20).toLocaleString('es-MX')}) como pago provisional de ISR, dejándote $${Math.round(neto).toLocaleString('es-MX')} netos en mano. El retiro se acumula a tus ingresos del año, por lo que el ISR estimado aislado ronda los $${Math.round(isrEstimado).toLocaleString('es-MX')}. ⚠️ Es un ESTIMADOR: el impuesto definitivo se determina en tu declaración anual, donde se suma a tus demás ingresos y se aplican deducciones y exenciones (por ejemplo, la exención por edad 65+/invalidez de 5 UMA anuales). Consultá a un contador antes de retirar.`;

  const chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Neto inmediato', value: Math.round(neto) },
      { label: 'Retención 20%', value: Math.round(retencion20) },
    ],
    prefix: '$',
    centerValue: '$' + Math.round(monto).toLocaleString('es-MX'),
    centerLabel: 'Retiro',
    ariaLabel: `Composición del retiro: neto ${Math.round(neto)}, retención 20% ${Math.round(retencion20)}.`,
  };

  const insight = {
    title: 'Estimación, no impuesto final',
    text: `Te retienen **$${Math.round(retencion20).toLocaleString('es-MX')}** (20%) al momento del retiro: te quedan **$${Math.round(neto).toLocaleString('es-MX')} MXN**. El ISR real se ajusta en tu **declaración anual** (puede ser más o menos que la retención). Este cálculo NO incluye la exención por edad 65+/invalidez. **Consultá a un contador.**`,
    tone: 'warn' as const,
    icon: '⚠️',
  };

  // Referencia: exención por edad 65+/invalidez (5 UMA anuales) — informativa, no aplicada.
  const exencionEdad5Uma = MEXICO_2026.uma.anual * 5;
  void exencionEdad5Uma;

  return {
    retencion20: Math.round(retencion20 * 100) / 100,
    ingresoAcumulable: Math.round(ingresoAcumulable * 100) / 100,
    isrEstimado: Math.round(isrEstimado * 100) / 100,
    neto: Math.round(neto * 100) / 100,
    formula,
    explicacion,
    _chart: chart,
    _insight: insight,
  };
}
