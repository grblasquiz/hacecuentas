/**
 * Domingos de Adviento hasta Navidad.
 *
 * Devuelve:
 *   - totalDomingos: domingos entre la fecha ingresada y el 25 de diciembre
 *     (ambos excluidos si no son domingo; incluye Navidad si cae domingo).
 *   - domingosAdviento: los 4 domingos de Adviento (IV, III, II, I desde más
 *     cercano a Navidad). Adviento arranca 4 domingos antes de Navidad.
 *   - proximoDomingo: el primer domingo ≥ hoy (date ISO + nombre).
 *   - proximoAdviento: cuál número de Adviento es el próximo ("1º", "2º", etc.
 *     o "ya pasaron todos" si ya estamos después del 4º).
 *   - mensaje: resumen legible.
 *
 * Navidad fija: 25 de diciembre. Si la fecha de hoy ya pasó el 25-dic del año,
 * usamos el año siguiente.
 */

export interface Inputs { fechaHoy: string; }
export interface Outputs {
  totalDomingos: number;
  domingosAdviento: string;
  proximoDomingo: string;
  proximoAdviento: string;
  diaNavidad: string;
  mensaje: string;
}

function parseLocal(s: string): Date {
  const parts = String(s || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha válida');
  const [yy, mm, dd] = parts;
  const d = new Date(yy, mm - 1, dd);
  if (isNaN(d.getTime())) throw new Error('Ingresá una fecha válida');
  return d;
}

function addDays(d: Date, n: number): Date {
  const r = new Date(d.getTime());
  r.setDate(r.getDate() + n);
  return r;
}

function formatIso(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatNice(d: Date): string {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const dias = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  return `${dias[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]}`;
}

export function domingosAdvientoNavidad(i: Inputs): Outputs {
  const hoy = parseLocal(i.fechaHoy);
  hoy.setHours(0, 0, 0, 0);

  // Navidad: 25-dic del año actual; si ya pasó, del año siguiente.
  const year = (hoy.getMonth() === 11 && hoy.getDate() > 25)
    ? hoy.getFullYear() + 1
    : hoy.getFullYear();
  const navidad = new Date(year, 11, 25);

  // Cuarto domingo de Adviento = el domingo de o antes del 24-dic.
  // 25-dic puede ser domingo (en cuyo caso el 4º Adviento es el mismo 25).
  // Tomamos el domingo inmediatamente anterior o igual al 25-dic.
  const IV = new Date(year, 11, 25);
  // Si 25-dic es domingo (dow===0), el 4º Adviento es el 18-dic (domingo anterior
  // lleno). Liturgia católica: el 4º Adviento es el último domingo ANTES de
  // Navidad, no Navidad misma.
  while (IV.getDay() !== 0 || IV.getDate() === 25) {
    IV.setDate(IV.getDate() - 1);
  }
  const III = addDays(IV, -7);
  const II = addDays(IV, -14);
  const I = addDays(IV, -21);

  // Contar domingos entre hoy (inclusive si es domingo) y navidad (inclusive si
  // es domingo). Esto da el "cuántos domingos hay entre ahora y Navidad".
  let totalDomingos = 0;
  let cursor = new Date(hoy.getTime());
  while (cursor <= navidad) {
    if (cursor.getDay() === 0) totalDomingos++;
    cursor.setDate(cursor.getDate() + 1);
  }

  // Próximo domingo (inclusivo si hoy es domingo).
  const prox = new Date(hoy.getTime());
  while (prox.getDay() !== 0) prox.setDate(prox.getDate() + 1);

  // ¿Cuál número de Adviento es el próximo?
  let proximoAdviento: string;
  if (prox.getTime() <= I.getTime()) proximoAdviento = `1º domingo de Adviento (${formatNice(I)})`;
  else if (prox.getTime() <= II.getTime()) proximoAdviento = `2º domingo de Adviento (${formatNice(II)})`;
  else if (prox.getTime() <= III.getTime()) proximoAdviento = `3º domingo de Adviento — Gaudete (${formatNice(III)})`;
  else if (prox.getTime() <= IV.getTime()) proximoAdviento = `4º domingo de Adviento (${formatNice(IV)})`;
  else proximoAdviento = 'Adviento ya terminó — Navidad inminente.';

  const domingosAdviento = `I: ${formatNice(I)} · II: ${formatNice(II)} · III (Gaudete): ${formatNice(III)} · IV: ${formatNice(IV)}`;

  const diasNav = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const diaNavidad = `${diasNav[navidad.getDay()]} 25 de diciembre de ${year}`;

  let mensaje: string;
  if (totalDomingos === 0) mensaje = '🎄 ¡Ya pasó el último domingo antes de Navidad!';
  else if (totalDomingos === 1) mensaje = `Queda solo 1 domingo antes de Navidad ${year}.`;
  else if (totalDomingos <= 4) mensaje = `Quedan ${totalDomingos} domingos — estás en pleno Adviento.`;
  else mensaje = `Faltan ${totalDomingos} domingos hasta Navidad ${year}. Adviento arranca el ${formatNice(I)}.`;

  return {
    totalDomingos,
    domingosAdviento,
    proximoDomingo: `${formatIso(prox)} (${formatNice(prox)})`,
    proximoAdviento,
    diaNavidad,
    mensaje,
  };
}
