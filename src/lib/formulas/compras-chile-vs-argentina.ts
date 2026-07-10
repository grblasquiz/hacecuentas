import { doughnut, money, n, positive, round } from './_ocio-costos';

export function comprasChileVsArgentina(i: any) {
  const precioChileArs = positive(i.precioChileArs, 'el precio en Chile pasado a pesos');
  const precioArgentinaArs = positive(i.precioArgentinaArs, 'el precio en Argentina');
  const valorComprasUsd = Math.max(0, n(i.valorComprasUsd));
  const dolarOficial = Math.max(1, n(i.dolarOficial, 1));
  const adultos = Math.max(0, n(i.adultos));
  const menores = Math.max(0, n(i.menores));
  const medio = String(i.medioIngreso || 'terrestre');
  const franquiciaAdulto = medio === 'aereo' ? 500 : 300;
  const franquiciaMenor = medio === 'aereo' ? 250 : 150;
  const franquiciaUsd = adultos * franquiciaAdulto + menores * franquiciaMenor;
  const excedenteUsd = Math.max(0, valorComprasUsd - franquiciaUsd);
  const impuestoAduanaArs = excedenteUsd * 0.5 * dolarOficial;
  const viajeArs = n(i.viajeArs);
  const totalChile = precioChileArs + viajeArs + impuestoAduanaArs;
  const diferencia = precioArgentinaArs - totalChile;
  const ahorroPct = precioArgentinaArs > 0 ? diferencia / precioArgentinaArs * 100 : 0;

  return {
    totalChile: round(totalChile),
    precioArgentinaArs: round(precioArgentinaArs),
    diferencia: round(diferencia),
    ahorroPct: round(ahorroPct),
    franquiciaUsd: round(franquiciaUsd),
    excedenteUsd: round(excedenteUsd),
    impuestoAduanaArs: round(impuestoAduanaArs),
    conviene: diferencia > 0 ? 'Conviene comprar en Chile' : 'Conviene comprar en Argentina',
    _chart: doughnut([
      { label: 'Producto en Chile', value: precioChileArs },
      { label: 'Viaje', value: viajeArs },
      { label: 'Aduana estimada', value: impuestoAduanaArs },
    ], totalChile, 'Costo real de comprar en Chile'),
    _insight: {
      title: diferencia > 0 ? 'Chile queda más barato' : 'Argentina queda más barato',
      text: diferencia > 0
        ? `Comprar en Chile queda **${money(diferencia)} más barato** después de viaje y aduana estimada. La franquicia usada es de **USD ${round(franquiciaUsd).toLocaleString('es-AR')}**.`
        : `Con viaje y aduana estimada, Argentina queda **${money(Math.abs(diferencia))} más barato**. Revisá si el viaje ya estaba planificado o si lo estás cargando solo por esta compra.`,
      tone: diferencia > 0 ? 'positive' : 'warn',
      icon: '🛍️',
    },
  };
}
