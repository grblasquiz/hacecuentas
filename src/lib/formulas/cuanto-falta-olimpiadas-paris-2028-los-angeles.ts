export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Ceremonia inaugural de los Juegos Olímpicos de Verano Los Ángeles 2028.
// Fecha confirmada por el COI / LA28: 14 de julio de 2028.
// (El nombre del archivo menciona "París" por legado del slug; París 2024 ya pasó,
//  la próxima edición de Verano es Los Ángeles 2028.)
const APERTURA_LA2028 = new Date(2028, 6, 14, 0, 0, 0, 0); // mes 6 = julio (0-indexado)

export function cuantoFaltaOlimpiadasParis2028LosAngeles(_i: Inputs): Outputs {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const dias = Math.round((APERTURA_LA2028.getTime() - hoy.getTime()) / 86400000);

  const absDias = Math.abs(dias);
  const semanas = Math.floor(absDias / 7);
  const meses = Math.floor(absDias / 30.44);
  const anios = Math.floor(absDias / 365.25);

  let equivalencias = '';
  if (anios >= 1) {
    const mesesResto = Math.floor((absDias - anios * 365.25) / 30.44);
    equivalencias = `${anios} ${anios === 1 ? 'año' : 'años'} y ${mesesResto} ${mesesResto === 1 ? 'mes' : 'meses'}`;
  } else if (meses >= 1) {
    equivalencias = `${meses} ${meses === 1 ? 'mes' : 'meses'} (${semanas} semanas)`;
  } else {
    equivalencias = `${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
  }

  let _insight;
  if (dias > 0) {
    _insight = {
      title: 'Cuenta regresiva a LA 2028',
      text: `Faltan **${dias} días** (${equivalencias}) para la ceremonia inaugural de los Juegos Olímpicos de Verano **Los Ángeles 2028**, el 14 de julio de 2028 en el Memorial Coliseum.`,
      tone: 'neutral',
      icon: '🥇'
    };
  } else if (dias === 0) {
    _insight = {
      title: '¡Hoy arrancan los Juegos!',
      text: 'Hoy, **14 de julio de 2028**, es la ceremonia inaugural de Los Ángeles 2028. Que comiencen los Juegos.',
      tone: 'good',
      icon: '🔥'
    };
  } else {
    _insight = {
      title: 'Los Juegos ya comenzaron',
      text: `La ceremonia inaugural de Los Ángeles 2028 fue hace **${absDias} días** (14 de julio de 2028). Los Juegos ya están en marcha o concluidos.`,
      tone: 'warn',
      icon: '⏳'
    };
  }

  const fechaTexto =
    dias > 0
      ? `Faltan ${dias} días para la apertura de Los Ángeles 2028 (14 de julio de 2028).`
      : dias === 0
      ? 'Los Juegos Olímpicos Los Ángeles 2028 comienzan hoy.'
      : `La apertura de Los Ángeles 2028 fue hace ${absDias} días.`;

  return {
    resultado: dias > 0 ? `${dias} días` : dias === 0 ? '¡Es hoy!' : `hace ${absDias} días`,
    equivalencia: equivalencias,
    resumen: fechaTexto,
    _insight
  };
}
