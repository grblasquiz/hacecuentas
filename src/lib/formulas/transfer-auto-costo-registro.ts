/** Estima el costo total de transferencia de un vehículo */
export interface Inputs {
  valuacionFiscal: number;
  mismaJurisdiccion: number;
}
export interface Outputs {
  costoTotal: number;
  arancelRegistro: number;
  selladoProvincial: number;
  detalle: string;
  _insight?: any;
  _chart?: any;
  _table?: any;
}

// Helper puro: misma math que el resultado principal. Lo llaman TANTO el cálculo
// central COMO cada fila de la tabla, así los números no pueden divergir.
function computarCosto(valuacion: number, misma: number) {
  // Arancel del registro: ~1.5% de la valuación
  const arancelRegistro = valuacion * 0.015;
  // Sellado provincial: ~1%
  const selladoProvincial = valuacion * 0.01;
  // Gastos fijos estimados
  const verificacionPolicial = 35000;
  const formularios = 15000;
  const informeDominio = 10000;
  // Extra por cambio de radicación
  const extraRadicacion = misma === 2 ? 50000 : 0;
  const costoTotal = arancelRegistro + selladoProvincial + verificacionPolicial + formularios + informeDominio + extraRadicacion;
  const arancelR = Math.round(arancelRegistro);
  const selladoR = Math.round(selladoProvincial);
  const fijos = verificacionPolicial + formularios + informeDominio;
  const totalRedondeado = Math.round(costoTotal);
  return { arancelRegistro, selladoProvincial, verificacionPolicial, formularios, informeDominio, extraRadicacion, costoTotal, arancelR, selladoR, fijos, totalRedondeado };
}

export function transferAutoCostoRegistro(i: Inputs): Outputs {
  const valuacion = Number(i.valuacionFiscal);
  const misma = Number(i.mismaJurisdiccion);

  if (!valuacion || valuacion < 500000) throw new Error('Ingresá la valuación fiscal del vehículo (mínimo $500.000)');
  if (misma < 1 || misma > 2) throw new Error('Indicá 1 (misma jurisdicción) o 2 (cambio de radicación)');

  const c = computarCosto(valuacion, misma);
  const arancelRegistro = c.arancelRegistro;
  const selladoProvincial = c.selladoProvincial;
  const verificacionPolicial = c.verificacionPolicial;
  const formularios = c.formularios;
  const informeDominio = c.informeDominio;
  const extraRadicacion = c.extraRadicacion;
  const costoTotal = c.costoTotal;

  const radicacion = misma === 2 ? ' Incluye gasto extra por cambio de radicación.' : '';

  // Componentes redondeados para el gráfico (suman el total mostrado en el donut).
  const arancelR = c.arancelR;
  const selladoR = c.selladoR;
  const fijos = c.fijos;
  const totalRedondeado = c.totalRedondeado;
  const slices = [
    { label: 'Arancel registro', value: arancelR },
    { label: 'Sellado provincial', value: selladoR },
    { label: 'Verificación + formularios', value: fijos },
  ];
  if (extraRadicacion > 0) slices.push({ label: 'Cambio de radicación', value: extraRadicacion });
  const totalSlices = slices.reduce((acc, s) => acc + s.value, 0);

  return {
    costoTotal: totalRedondeado,
    arancelRegistro: arancelR,
    selladoProvincial: selladoR,
    detalle: `Costo estimado de transferencia: $${totalRedondeado.toLocaleString('es-AR')}. Arancel registro: $${arancelR.toLocaleString('es-AR')}. Sellado: $${selladoR.toLocaleString('es-AR')}. Verificación + formularios: $${fijos.toLocaleString('es-AR')}.${radicacion}`,
    _insight: {
      title: 'Cuánto cuesta transferir el auto',
      text: `Transferir un vehículo valuado en **$${valuacion.toLocaleString('es-AR')}** sale unos **$${totalRedondeado.toLocaleString('es-AR')}**. El grueso son los impuestos sobre la valuación: arancel **$${arancelR.toLocaleString('es-AR')}** y sellado **$${selladoR.toLocaleString('es-AR')}**${extraRadicacion > 0 ? `, más **$${extraRadicacion.toLocaleString('es-AR')}** por el cambio de radicación` : ''}.`,
      tone: 'warn',
      icon: '🚗',
    },
    _chart: {
      type: 'doughnut',
      slices,
      prefix: '$',
      centerValue: `$${totalSlices.toLocaleString('es-AR')}`,
      centerLabel: 'Costo total',
      ariaLabel: `Desglose del costo de transferencia: arancel, sellado, verificación y formularios${extraRadicacion > 0 ? ' y cambio de radicación' : ''}, total $${totalSlices.toLocaleString('es-AR')}`,
    },
    _table: (() => {
      const peso = (n: number) => `$${Math.round(n).toLocaleString('es-AR')}`;
      // Incluye la valuación del usuario en la escala para que SU fila aparezca y coincida exacto.
      const valores = Array.from(new Set([5000000, 10000000, 15000000, 20000000, 30000000, valuacion]))
        .filter((v) => v >= 500000)
        .sort((a, b) => a - b);
      return {
        title: `Costo de transferencia por valuación fiscal (${misma === 2 ? 'cambio de radicación' : 'misma jurisdicción'})`,
        headers: ['Valuación fiscal', 'Arancel registro', 'Sellado prov.', 'Fijos + extras', 'Costo total'],
        align: ['left', 'right', 'right', 'right', 'right'],
        rows: valores.map((v) => {
          const r = computarCosto(v, misma);
          const fijosYExtra = r.fijos + r.extraRadicacion;
          return [peso(v), peso(r.arancelR), peso(r.selladoR), peso(fijosYExtra), peso(r.totalRedondeado)];
        }),
        note: `Estimación con arancel del registro ~1,5% y sellado provincial ~1% sobre la valuación, más gastos fijos (verificación, formularios, informe de dominio)${misma === 2 ? ' y el extra por cambio de radicación' : ''}. Los aranceles reales varían por jurisdicción y por la tabla DNRPA vigente.`,
      };
    })(),
  };
}
