/**
 * Calculadora de escalera de madera por huella y contrahuella
 */

export interface Inputs {
  alturaTotal: number; escalones: number; huellaDeseada: number;
}

export interface Outputs {
  contrahuella: string; huellaReal: string; blondel: string; largoEscalera: string; inclinacion: string;
}

export function escaleraMaderaHuellaContrahuella(inputs: Inputs): Outputs {
  const at = Number(inputs.alturaTotal);
  const e = Math.round(Number(inputs.escalones));
  const hd = Number(inputs.huellaDeseada);
  if (!at || !e || !hd) throw new Error('Completá los campos');
  const ch = at / e;
  const blondelSum = 2 * ch + hd;
  const largo = hd * (e - 1);
  const incl = Math.atan(ch / hd) * (180 / Math.PI);
  let eval_ = '';
  if (blondelSum >= 63 && blondelSum <= 65) eval_ = '✅ Blondel ideal';
  else if (blondelSum >= 60 && blondelSum <= 67) eval_ = '⚠️ Funcional pero no óptima';
  else eval_ = '❌ Incómoda (ajustar)';
  return {
    contrahuella: `${ch.toFixed(1)} cm`,
    huellaReal: `${hd.toFixed(1)} cm`,
    blondel: `${blondelSum.toFixed(1)} cm — ${eval_}`,
    largoEscalera: `${largo.toFixed(0)} cm horizontal`,
    inclinacion: `${incl.toFixed(1)}°`,
  };
}
