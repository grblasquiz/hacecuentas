/** Iluminación: lúmenes por ambiente */
export interface Inputs { ambiente: string; m2: number; wattsLed?: string; }
export interface Outputs { lumenesTotal: number; luxRecomendado: string; cantidadFocos: number; consejo: string; }

const LUX_RECO: Record<string, [number, number]> = {
  cocina: [300, 500], living: [150, 300], dormitorio: [100, 200], bano: [200, 400],
  escritorio: [400, 600], garage: [200, 400], pasillo: [80, 150], lavadero: [150, 300],
};
const LUMENS_LED: Record<string, number> = { '7': 600, '10': 900, '12': 1100, '15': 1400, '20': 1800 };

export function iluminacionLuxAmbiente(i: Inputs): Outputs {
  const amb = String(i.ambiente || 'living');
  const m2 = Number(i.m2);
  if (!m2 || m2 <= 0) throw new Error('Ingresá los m²');
  const watts = String(i.wattsLed || '10');
  const [luxMin, luxMax] = LUX_RECO[amb] || [200, 300];
  const luxMed = (luxMin + luxMax) / 2;
  const lumTotal = Math.round(luxMed * m2);
  const lumFoco = LUMENS_LED[watts] || 900;
  const focos = Math.ceil(lumTotal / lumFoco);

  return {
    lumenesTotal: lumTotal,
    luxRecomendado: `${luxMin}–${luxMax} lux`,
    cantidadFocos: focos,
    consejo: amb === 'cocina' ? 'Usá luz neutra (4000K) para buena visibilidad al cocinar.' :
             amb === 'dormitorio' ? 'Usá luz cálida (2700K) y regulable (dimmer) para relax.' :
             amb === 'escritorio' ? 'Sumá una luz de escritorio focalizada además de la general.' :
             'Combiná luz general (plafón) con luz puntual (apliques o spots).',
  };
}
