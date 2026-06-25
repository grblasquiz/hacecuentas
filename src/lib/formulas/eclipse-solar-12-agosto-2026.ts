/**
 * Eclipse solar total del 12 de agosto de 2026 — circunstancias por ciudad (España).
 *
 * Horarios en hora peninsular (CEST = UTC+2), aproximados. Fuente: Instituto
 * Geográfico Nacional (IGN) y recopilaciones de prensa especializada. Para uso
 * de observación, confirmar siempre con el IGN: https://eclipses.ign.es/
 *
 * La franja de totalidad cruza el norte/este de la península de oeste a este
 * durante el atardecer; el resto del país ve un eclipse parcial muy profundo.
 */

interface CiudadEclipse {
  nombre: string;
  tipo: 'total' | 'parcial';
  inicio: string;     // inicio de la fase parcial (CEST)
  maximo: string;     // hora del máximo / centro de la totalidad (CEST)
  duracion?: string;  // duración de la totalidad (solo tipo 'total')
  magnitud: number;   // magnitud del eclipse (>1 = total; <1 = fracción cubierta)
}

const CIUDADES: Record<string, CiudadEclipse> = {
  // --- Dentro de la franja de TOTALIDAD ---
  oviedo:     { nombre: 'Oviedo', tipo: 'total', inicio: '19:31', maximo: '20:28', duracion: '1 min 49 s', magnitud: 1.015 },
  leon:       { nombre: 'León', tipo: 'total', inicio: '19:32', maximo: '20:29', duracion: '1 min 45 s', magnitud: 1.013 },
  santander:  { nombre: 'Santander', tipo: 'total', inicio: '19:31', maximo: '20:27', duracion: '1 min 03 s', magnitud: 1.003 },
  bilbao:     { nombre: 'Bilbao', tipo: 'total', inicio: '19:31', maximo: '20:27', duracion: '31 s', magnitud: 1.001 },
  burgos:     { nombre: 'Burgos', tipo: 'total', inicio: '19:33', maximo: '20:29', duracion: '1 min 44 s', magnitud: 1.014 },
  valladolid: { nombre: 'Valladolid', tipo: 'total', inicio: '19:34', maximo: '20:30', duracion: '1 min 28 s', magnitud: 1.007 },
  zaragoza:   { nombre: 'Zaragoza', tipo: 'total', inicio: '19:34', maximo: '20:29', duracion: '1 min 24 s', magnitud: 1.007 },
  valencia:   { nombre: 'Valencia', tipo: 'total', inicio: '19:38', maximo: '20:33', duracion: '~1 min', magnitud: 1.003 },
  palma:      { nombre: 'Palma de Mallorca', tipo: 'total', inicio: '19:38', maximo: '20:31', duracion: '1 min 36 s', magnitud: 1.015 },
  // --- Eclipse PARCIAL (muy profundo) ---
  madrid:      { nombre: 'Madrid', tipo: 'parcial', inicio: '19:36', maximo: '20:32', magnitud: 0.999 },
  pamplona:    { nombre: 'Pamplona', tipo: 'parcial', inicio: '19:32', maximo: '20:28', magnitud: 0.999 },
  barcelona:   { nombre: 'Barcelona', tipo: 'parcial', inicio: '19:35', maximo: '20:29', magnitud: 0.997 },
  sansebastian:{ nombre: 'San Sebastián', tipo: 'parcial', inicio: '19:31', maximo: '20:27', magnitud: 0.996 },
  alicante:    { nombre: 'Alicante', tipo: 'parcial', inicio: '19:40', maximo: '20:34', magnitud: 0.989 },
  murcia:      { nombre: 'Murcia', tipo: 'parcial', inicio: '19:40', maximo: '20:35', magnitud: 0.982 },
  granada:     { nombre: 'Granada', tipo: 'parcial', inicio: '19:42', maximo: '20:37', magnitud: 0.960 },
  malaga:      { nombre: 'Málaga', tipo: 'parcial', inicio: '19:43', maximo: '20:38', magnitud: 0.950 },
};

export interface EclipseInputs {
  ciudad: string;
}

export interface EclipseOutputs {
  tipoEclipse: string;
  inicioParcial: string;
  maximo: string;
  magnitud: string;
  faltan: string;
  resumen: string;
  _insight?: any;
}

export function eclipseSolar12Agosto2026(inputs: EclipseInputs): EclipseOutputs {
  const key = String(inputs.ciudad || '').trim().toLowerCase();
  const c = CIUDADES[key];
  if (!c) throw new Error('Elegí una ciudad de la lista para ver el horario del eclipse.');

  // Días que faltan para el evento (atardecer del 12 de agosto de 2026).
  const evento = new Date(2026, 7, 12); // 12-ago-2026 (mes 7 = agosto)
  evento.setHours(0, 0, 0, 0);
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diasFaltan = Math.round((evento.getTime() - hoy.getTime()) / 86_400_000);

  let faltan: string;
  if (diasFaltan > 1) faltan = `Faltan ${diasFaltan} días`;
  else if (diasFaltan === 1) faltan = 'Falta 1 día';
  else if (diasFaltan === 0) faltan = '¡Es hoy! 🌑';
  else faltan = `El eclipse ya ocurrió (hace ${Math.abs(diasFaltan)} días)`;

  const pctCubierto = (c.magnitud >= 1 ? 100 : c.magnitud * 100).toFixed(1).replace('.', ',');

  let tipoEclipse: string;
  let magnitud: string;
  if (c.tipo === 'total') {
    tipoEclipse = `Total 🌑 — totalidad de ${c.duracion}`;
    magnitud = `Magnitud ${String(c.magnitud).replace('.', ',')} (Sol 100% cubierto)`;
  } else {
    tipoEclipse = `Parcial — ${pctCubierto}% del Sol cubierto`;
    magnitud = `${pctCubierto}% del diámetro del Sol oculto (magnitud ${String(c.magnitud).replace('.', ',')})`;
  }

  const inicioParcial = `${c.inicio} h (hora peninsular, CEST)`;
  const maximo = c.tipo === 'total'
    ? `${c.maximo} h CEST (centro de la totalidad)`
    : `${c.maximo} h CEST (máximo del eclipse)`;

  let resumen: string;
  if (c.tipo === 'total') {
    resumen = `Desde ${c.nombre} el eclipse del 12 de agosto de 2026 se ve **TOTAL**: la fase parcial arranca a las ${c.inicio} h y la **totalidad** llega hacia las ${c.maximo} h (CEST), con el Sol bajo sobre el horizonte del atardecer. Vas a tener unos ${c.duracion} de oscuridad casi completa. ${faltan.toLowerCase()}.`;
  } else {
    resumen = `Desde ${c.nombre} el eclipse se ve **PARCIAL pero muy profundo**: a las ${c.maximo} h (CEST) la Luna llega a tapar el ${pctCubierto}% del Sol. La fase parcial empieza a las ${c.inicio} h. No es totalidad, pero es un eclipse espectacular al atardecer. ${faltan.toLowerCase()}.`;
  }

  const _insight = c.tipo === 'total'
    ? {
        title: 'Estás en la franja de totalidad',
        text: `**${c.nombre}** es de las ciudades afortunadas: vas a ver la **totalidad** (~${c.duracion}) hacia las **${c.maximo} h**. Buscá un horizonte oeste despejado, porque el Sol estará muy bajo. ⚠️ Usá gafas de eclipse certificadas (ISO 12312-2) en la fase parcial; solo durante la totalidad podés mirar a ojo desnudo.`,
        tone: 'good',
        icon: '🌑',
      }
    : {
        title: 'Parcial profundo — casi total',
        text: `Desde **${c.nombre}** no entra la totalidad, pero el Sol queda cubierto al **${pctCubierto}%** hacia las **${c.maximo} h**. Las ciudades en totalidad más cercanas están al norte (franja Galicia→Baleares). ⚠️ Nunca mires el Sol parcialmente eclipsado sin gafas certificadas ISO 12312-2.`,
        tone: 'neutral',
        icon: '🌒',
      };

  return { tipoEclipse, inicioParcial, maximo, magnitud, faltan, resumen, _insight };
}
