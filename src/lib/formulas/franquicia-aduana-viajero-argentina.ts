import { FRANQUICIA_VIAJERO_2026 as F, fmtARS } from '../data/argentina-2026';

export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

const fmtUSD = (v: number) =>
  'US$' + v.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

/**
 * Franquicia de equipaje para ingresar a Argentina (ARCA, vigente 2026):
 * aérea/marítima US$500 por mayor (+US$500 free shop de llegada); terrestre/fluvial US$300.
 * Menores de 16: 50%. Grupo familiar acumula franquicias. Excedente paga 50%.
 */
export function compute(i: Inputs): Outputs {
  const via = String(i.via || 'aerea');
  const esAerea = via === 'aerea';
  const adultos = Math.min(20, Math.max(1, Math.round(Number(i.adultos) || 1)));
  const menores = Math.min(20, Math.max(0, Math.round(Number(i.menores16) || 0)));
  const compras = Math.max(0, Number(i.valorComprasUSD) || 0);
  const freeShop = esAerea ? Math.max(0, Number(i.compraFreeShopUSD) || 0) : 0;
  const tc = Math.max(1, Number(i.cotizacionDolar) || 1500);

  const base = esAerea ? F.aereaMaritimaUSD : F.terrestreFluvialUSD;
  const franquiciaEquipaje = adultos * base + menores * base * F.menores16Factor;
  const franquiciaFreeShop = esAerea ? adultos * F.freeShopLlegadaUSD + menores * F.freeShopLlegadaUSD * F.menores16Factor : 0;

  const excEquipaje = Math.max(0, compras - franquiciaEquipaje);
  const excFreeShop = Math.max(0, freeShop - franquiciaFreeShop);
  const excedente = excEquipaje + excFreeShop;
  const impuestoUSD = excedente * F.alicuotaExcedente;

  const out: Outputs = {
    franquiciaTotal: fmtUSD(franquiciaEquipaje) + (esAerea ? ` + ${fmtUSD(franquiciaFreeShop)} free shop llegada` : ''),
    excedenteGravado: fmtUSD(excedente),
    impuestoUSD: impuestoUSD > 0 ? fmtUSD(impuestoUSD) : 'US$0',
    impuestoPesos: impuestoUSD > 0 ? fmtARS(impuestoUSD * tc) : '$0',
    margenDisponible: excEquipaje === 0 ? fmtUSD(franquiciaEquipaje - compras) : 'US$0 (franquicia agotada)',
  };

  const grupo = adultos + menores > 1
    ? ` Como grupo familiar (${adultos} ${adultos === 1 ? 'mayor' : 'mayores'}${menores ? ` y ${menores} ${menores === 1 ? 'menor' : 'menores'} de 16` : ''}) las franquicias se suman.`
    : '';

  out._insight = impuestoUSD > 0
    ? {
        title: `Pagás ${fmtUSD(impuestoUSD)} en la Aduana`,
        text: `Tus compras superan la franquicia ${esAerea ? 'aérea/marítima' : 'terrestre/fluvial'} en **${fmtUSD(excedente)}** y el excedente tributa **50%**: **${fmtUSD(impuestoUSD)}** (~${fmtARS(impuestoUSD * tc)}). Declaralo espontáneamente al llegar: si la Aduana detecta lo no declarado, además del tributo puede aplicar multa.${grupo}`,
        tone: 'warn',
        icon: '🛃',
      }
    : {
        title: 'Entrás sin pagar: dentro de la franquicia',
        text: `Con **${fmtUSD(compras)}** en compras${freeShop ? ` y **${fmtUSD(freeShop)}** de free shop de llegada` : ''} no superás la franquicia de **${fmtUSD(franquiciaEquipaje)}**${esAerea ? ` (más ${fmtUSD(franquiciaFreeShop)} para el free shop del aeropuerto de llegada)` : ''}. Te quedan **${fmtUSD(Math.max(0, franquiciaEquipaje - compras))}** de margen.${grupo} Ropa y efectos personales usados no computan.`,
        tone: 'good',
        icon: '🧳',
      };
  return out;
}
