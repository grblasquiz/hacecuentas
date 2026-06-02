/**
 * Calculadora de filamento 3D necesario para un modelo
 */

export interface Inputs {
  volumen: number; infill: number; densidad: number; diametro: number;
}

export interface Outputs {
  gramos: number; metros: number; porcentajeBobina: string; volumenReal: string; _insight?: any;
}

export function filamento3dNecesarioModelo(inputs: Inputs): Outputs {
  const vol = Number(inputs.volumen);
  const infill = Number(inputs.infill);
  const dens = Number(inputs.densidad);
  const diam = Number(inputs.diametro);
  if (!vol || vol <= 0) throw new Error('Ingresá el volumen');
  if (!dens || dens <= 0) throw new Error('Ingresá densidad válida');
  if (!diam || diam <= 0) throw new Error('Ingresá diámetro válido');
  const volEf = vol * (0.30 + (infill / 100) * 0.70);
  const gramos = volEf * dens;
  const sec = Math.PI * Math.pow(diam / 2, 2);
  const mm = (volEf * 1000) / sec;
  const pctBobina = (gramos / 1000) * 100;
  const _insight = {
    title: 'Filamento que vas a gastar',
    text: `Tu modelo con **${infill}% de relleno** necesita aproximadamente **${gramos.toFixed(1)} g** de filamento (**${(mm / 1000).toFixed(2)} m**), o sea el **${pctBobina.toFixed(1)}% de una bobina de 1 kg**. Sumá un 5-10% extra por purga, brim y soportes.`,
    tone: pctBobina > 100 ? 'warn' : 'neutral',
    icon: '🧵',
  };
  return {
    gramos: Number(gramos.toFixed(1)),
    metros: Number((mm / 1000).toFixed(2)),
    porcentajeBobina: `${pctBobina.toFixed(1)}% de bobina 1 kg`,
    volumenReal: `${volEf.toFixed(1)} cm³ efectivos`,
    _insight,
  };
}
