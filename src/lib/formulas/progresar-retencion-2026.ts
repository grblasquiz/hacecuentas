export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

/** Resolución 172/2026: cuota base $35.000; retención aplicable según línea/condición. */
export function progresarRetencion2026(i: Inputs): Outputs {
  const cuota = Math.max(0, Number(i.montoCuota) || 35000);
  const cuotas = Math.min(12, Math.max(1, Math.round(Number(i.cuotasRegulares) || 9)));
  const retiene = String(i.aplicaRetencion || 'si') === 'si';
  const retenido = retiene ? cuota * 0.2 * cuotas : 0;
  const cobroMensual = retiene ? cuota * 0.8 : cuota;
  const totalRegular = cobroMensual * cuotas;
  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  return {
    cobroMensual: `$ ${fmt.format(cobroMensual)}`,
    retenidoAcumulado: `$ ${fmt.format(retenido)}`,
    totalCuotasRegulares: `$ ${fmt.format(totalRegular)}`,
    totalSiCertifica: `$ ${fmt.format(totalRegular + retenido)}`,
    _insight: {
      title: retiene ? `Te acreditan $ ${fmt.format(cobroMensual)} por cuota` : `Cobrás $ ${fmt.format(cobroMensual)} por cuota`,
      text: retiene
        ? `Sobre ${cuotas} cuotas regulares de **$ ${fmt.format(cuota)}**, el 20% retenido suma **$ ${fmt.format(retenido)}**. Se paga sólo si se cumplen las certificaciones y condiciones académicas aplicables; no lo cuentes como dinero disponible hasta que se acredite.`
        : `Con la condición elegida no se aplica retención a estas cuotas regulares. El total estimado de ${cuotas} cuotas es **$ ${fmt.format(totalRegular)}**.`,
      tone: retiene ? 'neutral' : 'good',
      icon: '🎓',
    },
  };
}
