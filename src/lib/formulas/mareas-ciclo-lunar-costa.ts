/** Predicción aproximada de pleamar/bajamar en puertos argentinos.
 *  Ciclo semidiurno ~12h25min (12.4206 h).
 *  El cálculo se ancla a la fase lunar: la pleamar ocurre cerca del paso lunar superior/inferior.
 *  Los valores son estimativos (±30-60 min); para navegación usar tablas oficiales SHN-AR.
 */
export interface Inputs {
  puerto: 'mar-del-plata' | 'puerto-madryn' | 'ushuaia' | 'rosario' | 'bahia-blanca' | 'quequen';
  fechaHora: string; // YYYY-MM-DDTHH:MM
}
export interface Outputs {
  proximaPleamar: string;
  proximaBajamar: string;
  alturaPleamarAprox: string;
  alturaBajamarAprox: string;
  tipoMareaHoy: string;
  advertencia: string;
}

interface PortData { amplitud: number; offsetHoras: number; descripcion: string; }

const PUERTOS: Record<string, PortData> = {
  'mar-del-plata': { amplitud: 1.5, offsetHoras: 0.5, descripcion: 'Mar del Plata (costa atlántica media)' },
  'puerto-madryn': { amplitud: 4.0, offsetHoras: 2.2, descripcion: 'Puerto Madryn / Golfo Nuevo (gran amplitud)' },
  'ushuaia': { amplitud: 2.0, offsetHoras: -1.0, descripcion: 'Ushuaia / Canal Beagle' },
  'rosario': { amplitud: 0.5, offsetHoras: 0, descripcion: 'Rosario (río Paraná, no oceánica)' },
  'bahia-blanca': { amplitud: 3.5, offsetHoras: 1.5, descripcion: 'Bahía Blanca (estuario, amplitud alta)' },
  'quequen': { amplitud: 1.3, offsetHoras: 0.3, descripcion: 'Quequén / Necochea' },
};

const CICLO_MAREA = 12.4206; // horas (semidiurno lunar M2)
const CICLO_LUNAR = 29.530589;
const REF_NEW_MOON = Date.UTC(2000, 0, 6, 18, 14, 0);

function edadLunarDias(ms: number): number {
  const diff = (ms - REF_NEW_MOON) / 86400000;
  let e = diff % CICLO_LUNAR;
  if (e < 0) e += CICLO_LUNAR;
  return e;
}

function fechaISO(date: Date): string {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm} UTC`;
}

export function mareasCicloLunarCosta(i: Inputs): Outputs {
  const puerto = String(i.puerto || 'mar-del-plata');
  const data = PUERTOS[puerto];
  if (!data) throw new Error('Puerto no reconocido');

  const dt = new Date(i.fechaHora);
  if (isNaN(dt.getTime())) throw new Error('Fecha/hora inválida (usar YYYY-MM-DDTHH:MM)');
  const ms = dt.getTime();

  // Edad lunar y factor de sicigia (mareas vivas cerca de luna nueva/llena).
  const edad = edadLunarDias(ms);
  const dMin = Math.min(edad, Math.abs(edad - CICLO_LUNAR / 2), Math.abs(edad - CICLO_LUNAR));
  // dMin ≈ 0 en nueva o llena; ≈ 7.4 en cuartos
  const factorSicigia = 1 + 0.3 * Math.cos((dMin / (CICLO_LUNAR / 4)) * (Math.PI / 2));

  // Determinar la próxima pleamar.
  // Anclaje: en luna nueva, en la longitud de referencia la pleamar ocurre cerca de las 00:00 UTC + offset puerto.
  const horasDesdeNuevaLuna = (ms - REF_NEW_MOON) / 3600000;
  // Pleamares cada 12.4206 h desde la nueva luna + offset local del puerto.
  const faseActual = ((horasDesdeNuevaLuna - data.offsetHoras) % CICLO_MAREA + CICLO_MAREA) % CICLO_MAREA;

  const horasHastaPleamar = (CICLO_MAREA - faseActual) % CICLO_MAREA;
  // Bajamar aproximadamente 6.21 h después de pleamar
  const horasHastaBajamar = (horasHastaPleamar + CICLO_MAREA / 2) % CICLO_MAREA;

  const proxPleamar = new Date(ms + horasHastaPleamar * 3600000);
  const proxBajamar = new Date(ms + horasHastaBajamar * 3600000);

  const amplitudEfectiva = data.amplitud * factorSicigia;
  const alturaMedia = data.amplitud * 0.5 + 0.5; // nivel medio aprox.
  const alturaPlea = alturaMedia + amplitudEfectiva / 2;
  const alturaBaja = alturaMedia - amplitudEfectiva / 2;

  let tipoMarea = '';
  if (dMin < 2.5) tipoMarea = 'Marea viva (sicigia): amplitud máxima, ocurre cerca de luna nueva/llena.';
  else if (dMin > 5.5) tipoMarea = 'Marea muerta (cuadratura): amplitud mínima, ocurre cerca de los cuartos.';
  else tipoMarea = 'Marea intermedia.';

  let advertencia = '';
  if (puerto === 'rosario') {
    advertencia = 'Rosario está sobre el río Paraná: el régimen no es oceánico, domina el caudal fluvial y el viento sudestada. Los valores son referenciales.';
  } else {
    advertencia = 'Estimación de bolsillo basada en ciclo semidiurno M2. Para navegación usá tablas oficiales del SHN (shn.gob.ar).';
  }

  return {
    proximaPleamar: `${fechaISO(proxPleamar)} (en ${horasHastaPleamar.toFixed(1)} h)`,
    proximaBajamar: `${fechaISO(proxBajamar)} (en ${horasHastaBajamar.toFixed(1)} h)`,
    alturaPleamarAprox: `${alturaPlea.toFixed(2)} m — ${data.descripcion}`,
    alturaBajamarAprox: `${alturaBaja.toFixed(2)} m`,
    tipoMareaHoy: tipoMarea,
    advertencia,
  };
}
