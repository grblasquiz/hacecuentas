/** Cuenta regresiva al aguinaldo (SAC): próxima cuota 30/06 o 18/12, automático, sin pedir fecha */
export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

function diasEntre(desde: Date, hasta: Date): number {
  const a = new Date(desde.getFullYear(), desde.getMonth(), desde.getDate());
  const b = new Date(hasta.getFullYear(), hasta.getMonth(), hasta.getDate());
  return Math.round((b.getTime() - a.getTime()) / 86400000);
}

export function cuantoFaltaAguinaldoJunioDiciembre(_i: Inputs): Outputs {
  const hoy = new Date();
  const y = hoy.getFullYear();

  // Las dos fechas tope legales del SAC (Ley 27.073): 1ª cuota 30/06, 2ª cuota 18/12.
  // Construimos los candidatos de este año y del siguiente, y elegimos el más próximo aún no vencido.
  const candidatos = [
    { fecha: new Date(y, 5, 30), cuota: 1, label: '1ª cuota (junio)', anio: y },     // 30/06
    { fecha: new Date(y, 11, 18), cuota: 2, label: '2ª cuota (diciembre)', anio: y }, // 18/12
    { fecha: new Date(y + 1, 5, 30), cuota: 1, label: '1ª cuota (junio)', anio: y + 1 },
    { fecha: new Date(y + 1, 11, 18), cuota: 2, label: '2ª cuota (diciembre)', anio: y + 1 },
  ];

  // El próximo aguinaldo: primera fecha con días restantes >= 0 (incluye "hoy es el día").
  const target = candidatos.find((c) => diasEntre(hoy, c.fecha) >= 0) || candidatos[candidatos.length - 1];

  const dias = diasEntre(hoy, target.fecha);
  const semanas = Math.floor(dias / 7);
  const meses = Math.round(dias / 30.44);

  const fmtFecha = target.fecha.toLocaleDateString('es-AR', { day: 'numeric', month: 'long', year: 'numeric' });

  let resultadoTxt: string;
  let resumen: string;
  let _insight: any;

  if (dias === 0) {
    resultadoTxt = '¡Es hoy!';
    resumen = `Hoy vence la ${target.label} del aguinaldo (${fmtFecha}).`;
    _insight = {
      title: '¡El aguinaldo vence hoy!',
      text: `Hoy, **${fmtFecha}**, es la fecha tope de la **${target.label}** del SAC. El empleador puede usar hasta **4 días hábiles de gracia** adicionales (Ley 27.073). Revisá que el medio aguinaldo haya impactado en tu recibo.`,
      tone: 'good',
      icon: '💰',
    };
  } else {
    const escala = dias >= 60 ? `unos **${meses} meses**` : dias >= 14 ? `unas **${semanas} semanas**` : `**${dias} días**`;
    resultadoTxt = `${dias} días`;
    resumen = `Faltan ${dias} días para la ${target.label} del aguinaldo (${fmtFecha}).`;
    _insight = {
      title: `Faltan ${dias} días para el aguinaldo`,
      text: `Faltan **${dias} días** (${escala}) para la fecha tope de la **${target.label}** del SAC, el **${fmtFecha}**. El medio aguinaldo equivale al **50% de la mejor remuneración mensual** del semestre. Tenelo en cuenta para tu flujo de caja y no comprometerlo antes de cobrarlo.`,
      tone: dias <= 30 ? 'good' : 'neutral',
      icon: '💰',
    };
  }

  return {
    resultado: resultadoTxt,
    proximaCuota: target.label,
    fechaVencimiento: fmtFecha,
    resumen,
    _insight,
  };
}
