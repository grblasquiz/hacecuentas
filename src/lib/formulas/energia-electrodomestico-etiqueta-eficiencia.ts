export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaElectrodomesticoEtiquetaEficiencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a = Number(i.kwhClaseActual) || 0; const n = Number(i.kwhClaseNueva) || 0;
  // tarifa: R$/kWh (Brasil ~0.85) or $/kWh (AR). Default 0.85 for PT, 80 fallback for ES (AR pesos/kWh)
  const tarifaRaw = i.tarifa !== undefined && i.tarifa !== '' ? Number(i.tarifa) : null;
  const t = tarifaRaw !== null && !isNaN(tarifaRaw) && tarifaRaw > 0
    ? tarifaRaw
    : __lang === 'pt' ? 0.85 : 80;
  const kWh = a - n; const saving = kWh * t;
  const currency = __lang === 'pt' ? 'R$' : '$';
  const resumen = __lang === 'en'
    ? `You save ${kWh.toFixed(0)} kWh/year = ${currency}${saving.toFixed(2)}/year.`
    : __lang === 'pt'
    ? `Você economiza ${kWh.toFixed(0)} kWh/ano = ${currency}${saving.toFixed(2)}/ano.`
    : `Ahorrás ${kWh.toFixed(0)} kWh/año = ${currency}${saving.toFixed(0)}/año.`;
  const tone = kWh > 0 ? 'good' : kWh < 0 ? 'warn' : 'neutral';
  const kWhAbs = Math.abs(kWh).toFixed(0);
  const savingAbs = __lang === 'pt'
    ? `${currency}${Math.abs(saving).toFixed(2)}`
    : `${currency}${Math.abs(saving).toFixed(0)}`;
  const _insight = {
    title: __lang === 'en' ? 'Annual saving' : __lang === 'pt' ? 'Economia anual' : 'Ahorro anual',
    text: __lang === 'en'
      ? (kWh > 0
          ? `Switching to the more efficient label saves you **${kWhAbs} kWh/year**, about **${savingAbs}** off your bill.`
          : kWh < 0
          ? `Careful: the new appliance uses **${kWhAbs} kWh/year more**, costing you an extra **${savingAbs}**.`
          : `Both labels consume the same: **no saving** on your bill.`)
      : __lang === 'pt'
      ? (kWh > 0
          ? `Trocar pela etiqueta mais eficiente economiza **${kWhAbs} kWh/ano**, cerca de **${savingAbs}** na sua conta de luz.`
          : kWh < 0
          ? `Atenção: o novo aparelho gasta **${kWhAbs} kWh/ano a mais**, custando **${savingAbs}** extras.`
          : `As duas etiquetas consomem o mesmo: **sem economia** na conta.`)
      : (kWh > 0
          ? `Pasar a la etiqueta más eficiente te ahorra **${kWhAbs} kWh/año**, unos **${savingAbs}** en tu factura.`
          : kWh < 0
          ? `Ojo: el equipo nuevo consume **${kWhAbs} kWh/año más**, te cuesta **${savingAbs}** extra.`
          : `Ambas etiquetas consumen igual: **no hay ahorro** en tu factura.`),
    tone,
    icon: '🔌',
  };
  const savingLabel = __lang === 'pt' ? `${currency}${saving.toFixed(2)}` : `${currency}${saving.toFixed(0)}`;
  return { ahorroKwhAño: kWh.toFixed(0), ahorroPesosAño: savingLabel, resumen, _insight };
}
