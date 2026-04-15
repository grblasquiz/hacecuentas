/** Dosis orientativa de amoxicilina pediátrica por peso — NO reemplaza indicación médica */
export interface Inputs {
  peso: number;
  tipoDosis?: string;
  concentracion?: string;
}
export interface Outputs {
  dosisDiaria: string;
  dosisPorToma: string;
  mlPorToma: string;
  detalle: string;
}

export function dosisAmoxicilinaPediatricaPeso(i: Inputs): Outputs {
  const peso = Number(i.peso);
  const tipo = String(i.tipoDosis || 'estandar');
  const conc = Number(i.concentracion) || 250;

  if (!peso || peso <= 0) throw new Error('Ingresá el peso del niño/a');
  if (peso > 60) throw new Error('Para peso >60 kg usá dosis de adulto (máx 500-875 mg/toma)');

  const mgKgMin = tipo === 'alta' ? 80 : 40;
  const mgKgMax = tipo === 'alta' ? 90 : 50;

  let dosiaDiariaMin = peso * mgKgMin;
  let dosiaDiariaMax = peso * mgKgMax;

  // Cap a 3000 mg/día
  dosiaDiariaMin = Math.min(dosiaDiariaMin, 3000);
  dosiaDiariaMax = Math.min(dosiaDiariaMax, 3000);

  const tomas = 3; // cada 8 hs
  const porTomaMin = Math.round(dosiaDiariaMin / tomas);
  const porTomaMax = Math.round(dosiaDiariaMax / tomas);

  // ml de jarabe por toma (concentración en mg/5ml)
  const mgPorMl = conc / 5;
  const mlMin = (porTomaMin / mgPorMl).toFixed(1);
  const mlMax = (porTomaMax / mgPorMl).toFixed(1);

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  const tipoLabel = tipo === 'alta' ? 'alta (80-90 mg/kg/día)' : 'estándar (40-50 mg/kg/día)';

  return {
    dosisDiaria: `${fmt(dosiaDiariaMin)} – ${fmt(dosiaDiariaMax)} mg/día`,
    dosisPorToma: `${fmt(porTomaMin)} – ${fmt(porTomaMax)} mg cada 8 hs`,
    mlPorToma: `${mlMin} – ${mlMax} ml (jarabe ${conc} mg/5ml)`,
    detalle:
      `Peso: ${peso} kg | Dosis ${tipoLabel} | ` +
      `Diaria: ${fmt(dosiaDiariaMin)}–${fmt(dosiaDiariaMax)} mg | ` +
      `Por toma (c/8hs): ${fmt(porTomaMin)}–${fmt(porTomaMax)} mg | ` +
      `Jarabe ${conc}mg/5ml: ${mlMin}–${mlMax} ml/toma. ` +
      `⚠️ ORIENTATIVO — Siempre seguí la indicación de tu pediatra.`,
  };
}
