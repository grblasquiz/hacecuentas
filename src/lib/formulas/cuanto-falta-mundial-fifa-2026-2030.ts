/** Cuenta regresiva al Mundial FIFA (countdown automático, sin pedir fecha al usuario) */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// Fechas oficiales/aprox del partido inaugural de cada Mundial (hora local, tomado a medianoche)
const MUNDIAL_2026 = { fecha: '2026-06-11', label: 'Mundial 2026', sede: 'USA, México y Canadá' };
const MUNDIAL_2030 = { fecha: '2030-06-13', label: 'Mundial 2030', sede: 'España, Portugal y Marruecos (centenario)' };

function parseFecha(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function diasEntre(desde: Date, hasta: Date): number {
  const a = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function cuantoFaltaMundialFifa20262030(i: Inputs): Outputs {
  const hoy = new Date();

  const objetivoSel = String(i.objetivo || 'auto');
  const fecha2026 = parseFecha(MUNDIAL_2026.fecha);
  const fecha2030 = parseFecha(MUNDIAL_2030.fecha);

  // Elegir el Mundial objetivo
  let target: { fecha: string; label: string; sede: string };
  if (objetivoSel === '2026') {
    target = MUNDIAL_2026;
  } else if (objetivoSel === '2030') {
    target = MUNDIAL_2030;
  } else {
    // auto: si todavía no arrancó el 2026, contamos a 2026; si no, a 2030
    target = diasEntre(hoy, fecha2026) >= 0 ? MUNDIAL_2026 : MUNDIAL_2030;
  }

  const fechaTarget = parseFecha(target.fecha);
  const dias = diasEntre(hoy, fechaTarget);
  const abs = Math.abs(dias);
  const semanas = Math.floor(abs / 7);
  const meses = Math.round(abs / 30.44);

  const fmtFecha = (() => {
    const f = parseFecha(target.fecha);
    return f.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });
  })();

  let _insight: any;
  let resultadoTxt: string;
  let resumen: string;

  if (dias > 0) {
    const escala = abs >= 60 ? `unos **${meses} meses**` : abs >= 14 ? `unas **${semanas} semanas**` : `**${dias} días**`;
    resultadoTxt = `${dias} días`;
    resumen = `Faltan ${dias} días para el ${target.label} (${fmtFecha}).`;
    _insight = {
      title: `Cuenta regresiva al ${target.label}`,
      text: `Faltan **${dias} días** (${escala}) para el partido inaugural del **${target.label}** (${fmtFecha}), en ${target.sede}. ${target === MUNDIAL_2026 ? 'Será el primer Mundial de 48 selecciones y 104 partidos.' : 'Será el Mundial del centenario, repartido entre tres países y con partidos conmemorativos en Sudamérica.'}`,
      tone: abs <= 90 ? 'good' : 'neutral',
      icon: '⚽',
    };
  } else if (dias === 0) {
    resultadoTxt = '¡Es hoy!';
    resumen = `Hoy arranca el ${target.label}. ¡Que ruede la pelota!`;
    _insight = {
      title: '¡Arranca el Mundial!',
      text: `Hoy es el **partido inaugural del ${target.label}** (${fmtFecha}), en ${target.sede}. ¡Que ruede la pelota!`,
      tone: 'good',
      icon: '🏆',
    };
  } else {
    resultadoTxt = `${abs} días desde el inicio`;
    resumen = `El ${target.label} arrancó hace ${abs} días (${fmtFecha}).`;
    _insight = {
      title: `${target.label} en juego`,
      text: `El **${target.label}** arrancó hace **${abs} días** (${fmtFecha}). ${target === MUNDIAL_2026 ? 'El próximo será el Mundial 2030.' : ''}`,
      tone: 'neutral',
      icon: '⚽',
    };
  }

  return {
    resultado: resultadoTxt,
    fechaInicio: fmtFecha,
    resumen,
    _insight,
  };
}
