export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function energiaElectrodomesticoEtiquetaEficiencia(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a = Number(i.kwhClaseActual) || 0; const n = Number(i.kwhClaseNueva) || 0;
  const t = Number(i.tarifa) || 80;
  const kWh = a - n; const pesos = kWh * t;
  const resumen = __lang === 'en'
    ? `You save ${kWh.toFixed(0)} kWh/year = $${pesos.toFixed(0)} AR.`
    : __lang === 'pt'
    ? `Você economiza ${kWh.toFixed(0)} kWh/ano = $${pesos.toFixed(0)} AR.`
    : `Ahorrás ${kWh.toFixed(0)} kWh/año = $${pesos.toFixed(0)} AR.`;
  const tone = kWh > 0 ? 'good' : kWh < 0 ? 'warn' : 'neutral';
  const kWhAbs = Math.abs(kWh).toFixed(0); const pesosAbs = '$' + Math.abs(pesos).toFixed(0);
  const _insight = {
    title: __lang === 'en' ? 'Annual saving' : __lang === 'pt' ? 'Economia anual' : 'Ahorro anual',
    text: __lang === 'en'
      ? (kWh > 0
          ? `Switching to the more efficient label saves you **${kWhAbs} kWh/year**, about **${pesosAbs} AR** off your bill.`
          : kWh < 0
          ? `Careful: the new appliance uses **${kWhAbs} kWh/year more**, costing you an extra **${pesosAbs} AR**.`
          : `Both labels consume the same: **no saving** on your bill.`)
      : __lang === 'pt'
      ? (kWh > 0
          ? `Trocar pela etiqueta mais eficiente economiza **${kWhAbs} kWh/ano**, cerca de **${pesosAbs} AR** na sua conta.`
          : kWh < 0
          ? `Atenção: o novo aparelho gasta **${kWhAbs} kWh/ano a mais**, custando **${pesosAbs} AR** extras.`
          : `As duas etiquetas consomem o mesmo: **sem economia** na conta.`)
      : (kWh > 0
          ? `Pasar a la etiqueta más eficiente te ahorra **${kWhAbs} kWh/año**, unos **${pesosAbs}** en tu factura.`
          : kWh < 0
          ? `Ojo: el equipo nuevo consume **${kWhAbs} kWh/año más**, te cuesta **${pesosAbs}** extra.`
          : `Ambas etiquetas consumen igual: **no hay ahorro** en tu factura.`),
    tone,
    icon: '🔌',
  };
  return { ahorroKwhAño: kWh.toFixed(0), ahorroPesosAño: '$' + pesos.toFixed(0), resumen, _insight };
}
