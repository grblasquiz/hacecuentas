/** Fusible y sección de cable según potencia y voltaje */
export interface Inputs { potenciaWatts: number; voltaje: number; factorSeguridad: number; }
export interface Outputs { corrienteA: number; corrienteConMargen: number; fusibleA: number; seccionCableMm2: number; detalle: string; }

const FUSIBLES = [6, 10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
const CABLES: { seccion: number; ampMax: number }[] = [
  { seccion: 1.0, ampMax: 10 },
  { seccion: 1.5, ampMax: 15 },
  { seccion: 2.5, ampMax: 21 },
  { seccion: 4.0, ampMax: 27 },
  { seccion: 6.0, ampMax: 36 },
  { seccion: 10.0, ampMax: 50 },
  { seccion: 16.0, ampMax: 66 },
  { seccion: 25.0, ampMax: 88 },
  { seccion: 35.0, ampMax: 110 },
  { seccion: 50.0, ampMax: 133 },
];

export function fusibleAmperajeCableSeccion(i: Inputs): Outputs {
  const watts = Number(i.potenciaWatts);
  const voltaje = Number(i.voltaje);
  const fs = Number(i.factorSeguridad);

  if (!watts || watts <= 0) throw new Error('Ingresá la potencia en watts');
  if (!voltaje || voltaje <= 0) throw new Error('Ingresá el voltaje del circuito');
  if (!fs || fs < 1) throw new Error('El factor de seguridad debe ser al menos 1');

  const corriente = watts / voltaje;
  const corrienteConMargen = corriente * fs;

  let fusible = FUSIBLES[FUSIBLES.length - 1];
  for (const f of FUSIBLES) {
    if (f >= corrienteConMargen) { fusible = f; break; }
  }

  let cable = CABLES[CABLES.length - 1];
  for (const c of CABLES) {
    if (c.ampMax >= fusible) { cable = c; break; }
  }

  const fmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 1 });

  return {
    corrienteA: Number(corriente.toFixed(1)),
    corrienteConMargen: Number(corrienteConMargen.toFixed(1)),
    fusibleA: fusible,
    seccionCableMm2: cable.seccion,
    detalle: `${fmt.format(watts)}W / ${fmt.format(voltaje)}V = ${fmt.format(corriente)}A × ${fmt.format(fs)} = ${fmt.format(corrienteConMargen)}A. Fusible: ${fusible}A. Cable: ${fmt.format(cable.seccion)} mm² (soporta ${cable.ampMax}A).`,
  };
}
