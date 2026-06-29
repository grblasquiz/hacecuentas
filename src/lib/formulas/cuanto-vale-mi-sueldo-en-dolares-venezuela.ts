/**
 * ¿Cuánto vale tu sueldo en dólares? — Venezuela.
 *
 * Convierte un salario en bolívares (Bs.) a dólares (USD) a la tasa indicada
 * y le suma los bonos en divisas (bono de guerra económica ≈ USD 120 +
 * cestaticket ≈ USD 40 = USD 160 de referencia, editable) para mostrar el
 * ingreso total real en dólares.
 *
 * La tasa es VOLÁTIL → entra como input editable (no se hardcodea).
 *
 * ⚠️ IMPORTANTE: salarioUSD e ingresoTotalUSD están en DÓLARES, no en
 * bolívares. Por eso se devuelven como STRINGS pre-formateados ("US$ …") y
 * sus outputs en el JSON NO usan format:"currency" (que renderaría VES en
 * las páginas /ve/). Así el render muestra dólares correctamente.
 *
 * Fórmula:
 *   salarioUSD      = salarioBs / tasa
 *   ingresoTotalUSD = salarioUSD + bonosUSD
 *
 * Fuente: BCV (tasa de referencia), MinTrabajo (cestaticket), Sistema Patria.
 */

export interface Inputs {
  salarioBs?: number;
  bonosUSD?: number;
  tasa?: number;
}

export interface Outputs {
  [k: string]: any;
  _insight?: any;
  _table?: any;
}

/** Formatea un monto en dólares: "US$ 1.234,56" (punto miles, coma decimales). */
function fmtUSD(n: number): string {
  return 'US$ ' + new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.round(n * 100) / 100);
}

export function cuantoValeMiSueldoEnDolaresVenezuela(i: Inputs): Outputs {
  const salarioBs = Math.max(0, Number(i.salarioBs) || 0);
  if (!salarioBs) throw new Error('Ingresá tu salario mensual en bolívares (Bs.)');

  const tasa = Math.max(0, Number(i.tasa) || 0);
  if (!tasa) throw new Error('Ingresá la tasa de cambio (Bs. por dólar)');

  const bonosUSD = Math.max(0, Number(i.bonosUSD) || 0);

  const salarioUSDnum = salarioBs / tasa;
  const ingresoTotalUSDnum = salarioUSDnum + bonosUSD;

  const narrativa =
    `A la tasa de ${tasa.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Bs./USD, ` +
    `tu salario de ${salarioBs.toLocaleString('de-DE', { maximumFractionDigits: 2 })} Bs. equivale a ` +
    `${fmtUSD(salarioUSDnum)}. Sumando los bonos en divisas (${fmtUSD(bonosUSD)}), ` +
    `tu ingreso total real es de ${fmtUSD(ingresoTotalUSDnum)} al mes.`;

  return {
    // Strings pre-formateados en DÓLARES (no Bs.).
    ingresoTotalUSD: fmtUSD(ingresoTotalUSDnum),
    salarioUSD: fmtUSD(salarioUSDnum),
    _insight: {
      type: 'highlight',
      icon: '💵',
      text: narrativa,
    },
    _table: {
      title: 'Tu ingreso real en dólares',
      headers: ['Concepto', 'Monto (USD)'],
      rows: [
        ['Salario en bolívares convertido', fmtUSD(salarioUSDnum)],
        ['Bonos en divisas (guerra + cestaticket)', fmtUSD(bonosUSD)],
        ['Ingreso total mensual en dólares', fmtUSD(ingresoTotalUSDnum)],
      ],
      note: 'El salario mínimo legal en Bs. quedó muy rezagado; en la práctica el ingreso real lo componen los bonos en divisas (bono de guerra económica ≈ USD 120 + cestaticket ≈ USD 40). Ajustá el monto de bonos y la tasa a tu situación: ambos cambian con frecuencia.',
    },
  };
}
