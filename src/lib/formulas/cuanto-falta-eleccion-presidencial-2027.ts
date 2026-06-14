export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// Fechas tentativas del proceso electoral presidencial Argentina 2027.
// El cronograma definitivo lo fija el Poder Ejecutivo por decreto de convocatoria.
const PASO = '2027-08-08';        // 2° domingo de agosto (tentativa)
const GENERALES = '2027-10-24';   // último domingo de octubre (tentativa)
const BALOTAJE = '2027-11-21';    // 4° domingo de noviembre (tentativa, si aplica)

function diasHasta(iso: string): number {
  const [yy, mm, dd] = iso.split('-').map(Number);
  const objetivo = new Date(yy, mm - 1, dd);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  return Math.round((objetivo.getTime() - hoy.getTime()) / 86400000);
}

function escala(dias: number): string {
  const abs = Math.abs(dias);
  if (abs >= 60) return `unos **${Math.round(abs / 30.44)} meses**`;
  if (abs >= 14) return `unas **${Math.floor(abs / 7)} semanas**`;
  return `**${abs} días**`;
}

export function cuantoFaltaEleccionPresidencial2027(_i: Inputs): Outputs {
  const dPaso = diasHasta(PASO);
  const dGen = diasHasta(GENERALES);
  const dBal = diasHasta(BALOTAJE);

  // El resultado principal es la cuenta regresiva a las elecciones generales (24-oct-2027).
  let _insight: any;
  if (dGen > 0) {
    _insight = {
      title: 'Cuenta regresiva a las generales 2027',
      text: `Faltan **${dGen} días** (${escala(dGen)}) para las elecciones presidenciales generales del 24 de octubre de 2027. Las PASO serían el 8 de agosto (en ${dPaso > 0 ? `${dPaso} días` : 'fecha ya pasada'}) y el eventual balotaje el 21 de noviembre. Son fechas **tentativas**: el cronograma definitivo lo fija el Poder Ejecutivo por decreto de convocatoria.`,
      tone: 'neutral',
      icon: '🗳️',
    };
  } else if (dGen === 0) {
    _insight = {
      title: '¡Hoy son las generales!',
      text: `Hoy es la jornada de elecciones generales presidenciales. El voto es obligatorio entre 18 y 70 años y la veda rige desde 48 horas antes.`,
      tone: 'good',
      icon: '🗳️',
    };
  } else {
    _insight = {
      title: 'Las generales 2027 ya pasaron',
      text: `Las elecciones generales del 24 de octubre de 2027 quedaron **${Math.abs(dGen)} días** atrás. Para el próximo ciclo presidencial (2031), las fechas se conocerán más cerca del año electoral.`,
      tone: 'warn',
      icon: '⏪',
    };
  }

  const _chart = {
    type: 'bar',
    title: 'Días que faltan por instancia electoral',
    data: [
      { label: 'PASO (8 ago)', value: Math.max(dPaso, 0) },
      { label: 'Generales (24 oct)', value: Math.max(dGen, 0) },
      { label: 'Balotaje (21 nov)', value: Math.max(dBal, 0) },
    ],
  };

  const fmt = (d: number) => (d > 0 ? `${d} días` : d === 0 ? 'hoy' : 'ya pasó');

  return {
    resultado: dGen > 0 ? `${dGen} días` : dGen === 0 ? 'Es hoy' : 'Ya pasó',
    resumen: `Faltan ${dGen > 0 ? `${dGen} días (${escala(dGen)})` : dGen === 0 ? 'cero días: es hoy' : `nada: pasaron ${Math.abs(dGen)} días`} para las generales del 24-oct-2027.`,
    diasPaso: fmt(dPaso),
    diasBalotaje: fmt(dBal),
    _insight,
    _chart,
  };
}
