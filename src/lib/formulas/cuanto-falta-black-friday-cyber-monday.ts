export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// 4º viernes de noviembre del año `year` (día siguiente al Thanksgiving de EE.UU.).
function blackFridayDe(year: number): Date {
  // 1 de noviembre de ese año.
  const nov1 = new Date(year, 10, 1);
  // getDay(): 0=domingo … 5=viernes. Primer viernes de noviembre:
  const offsetAlPrimerViernes = (5 - nov1.getDay() + 7) % 7;
  const primerViernes = 1 + offsetAlPrimerViernes;
  // El cuarto viernes = primer viernes + 3 semanas.
  return new Date(year, 10, primerViernes + 21);
}

export function cuantoFaltaBlackFridayCyberMonday(i: Inputs): Outputs {
  const meses = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
  const diasSem = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
  const fmt = (d: Date) => `${diasSem[d.getDay()]} ${d.getDate()} de ${meses[d.getMonth()]} de ${d.getFullYear()}`;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  // Año de referencia: por defecto el actual (derivado de new Date()).
  // El usuario puede forzar un año futuro de forma opcional (no es obligatorio).
  const anioPedido = Number(i.anio);
  let year = (Number.isFinite(anioPedido) && anioPedido >= hoy.getFullYear() && anioPedido <= 2100)
    ? Math.trunc(anioPedido)
    : hoy.getFullYear();

  let blackFriday = blackFridayDe(year);
  let cyberMonday = new Date(blackFriday.getTime() + 3 * 86400000); // lunes siguiente

  // Si NO se forzó un año y el Cyber Monday de este año ya pasó, saltar al año que viene.
  const seForzo = Number.isFinite(anioPedido) && anioPedido >= hoy.getFullYear() && anioPedido <= 2100;
  if (!seForzo && cyberMonday.getTime() < hoy.getTime()) {
    year = year + 1;
    blackFriday = blackFridayDe(year);
    cyberMonday = new Date(blackFriday.getTime() + 3 * 86400000);
  }

  const diasBF = Math.round((blackFriday.getTime() - hoy.getTime()) / 86400000);
  const diasCM = Math.round((cyberMonday.getTime() - hoy.getTime()) / 86400000);

  const escala = (d: number) => {
    const abs = Math.abs(d);
    if (abs >= 60) return `unos ${Math.round(abs / 30.44)} meses`;
    if (abs >= 14) return `unas ${Math.floor(abs / 7)} semanas`;
    return `${abs} días`;
  };

  const etiquetaBF = diasBF > 0 ? `Faltan ${diasBF} días` : diasBF === 0 ? '¡Es hoy!' : `Pasó hace ${-diasBF} días`;
  const etiquetaCM = diasCM > 0 ? `Faltan ${diasCM} días` : diasCM === 0 ? '¡Es hoy!' : `Pasó hace ${-diasCM} días`;

  let _insight: any;
  if (diasBF > 0) {
    _insight = {
      title: `Faltan ${diasBF} días para Black Friday ${year}`,
      text: `**Black Friday ${year}** cae el **${fmt(blackFriday)}** (cuarto viernes de noviembre) y el **Cyber Monday** el **${fmt(cyberMonday)}**. Quedan **${diasBF} días** (${escala(diasBF)}) para el viernes y **${diasCM} días** para el lunes. Tiempo para armar tu wishlist y registrar precios actuales en Precios Claros: muchas "ofertas" inflan el precio previo.`,
      tone: diasBF <= 7 ? 'warn' : 'neutral',
      icon: '🛍️',
    };
  } else if (diasBF === 0) {
    _insight = {
      title: '¡Hoy es Black Friday!',
      text: `Hoy, **${fmt(blackFriday)}**, arrancó Black Friday. El **Cyber Monday** es el **${fmt(cyberMonday)}** (en ${diasCM} días). Comprá lo que ya tenías marcado y no te dejes llevar por el apuro.`,
      tone: 'good',
      icon: '🛍️',
    };
  } else if (diasCM >= 0) {
    _insight = {
      title: 'Black Friday ya pasó, falta Cyber Monday',
      text: `**Black Friday** fue el **${fmt(blackFriday)}** (hace ${-diasBF} días), pero el **Cyber Monday** todavía no llegó: es el **${fmt(cyberMonday)}**, en **${diasCM} días**. El lunes suele concentrar tecnología, software y liquidación de stock.`,
      tone: 'neutral',
      icon: '💻',
    };
  } else {
    _insight = {
      title: 'Ya pasaron ambos eventos',
      text: `Black Friday y Cyber Monday ${year} ya pasaron. La próxima edición vuelve el cuarto viernes de noviembre de ${year + 1}. Mientras tanto, en Argentina hay Hot Sale (mayo) y CyberMonday CACE (primera semana de noviembre).`,
      tone: 'warn',
      icon: '⏪',
    };
  }

  return {
    diasBlackFriday: diasBF > 0 ? `${diasBF} días` : diasBF === 0 ? 'Hoy' : `Pasó hace ${-diasBF} días`,
    fechaBlackFriday: fmt(blackFriday),
    diasCyberMonday: diasCM > 0 ? `${diasCM} días` : diasCM === 0 ? 'Hoy' : `Pasó hace ${-diasCM} días`,
    fechaCyberMonday: fmt(cyberMonday),
    resumen: `Black Friday ${year}: ${fmt(blackFriday)} (${etiquetaBF}). Cyber Monday: ${fmt(cyberMonday)} (${etiquetaCM}).`,
    _insight,
  };
}
