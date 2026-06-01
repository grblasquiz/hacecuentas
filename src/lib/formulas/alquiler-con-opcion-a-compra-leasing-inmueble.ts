export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function alquilerConOpcionACompraLeasingInmueble(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : i.__lang === 'pt' ? 'pt' : 'es';
  const a=Number(i.alquilerMensual)||0; const m=Number(i.mesesPago)||0; const v=Number(i.valorInmueble)||0; const p=(Number(i.pctDescontable)||30)/100;
  const totAlq=a*m;
  const acum=totAlq*p;
  const falta=v-acum;
  const resumen = __lang === 'en'
    ? `${m} months × $${a}: total paid $${totAlq.toFixed(0)}, accumulated toward purchase $${acum.toFixed(0)}.`
    : __lang === 'pt'
    ? `${m} meses × $${a}: total pago $${totAlq.toFixed(0)}, acumulado para compra $${acum.toFixed(0)}.`
    : `${m} meses × $${a}: total alquilado $${totAlq.toFixed(0)}, acumulado compra $${acum.toFixed(0)}.`;

  const fmt = (n: number) => n.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const pctV = v > 0 ? acum / v * 100 : 0;
  const pctDesc = Math.round(p * 100);
  const cubierto = falta <= 0;
  const insTone = cubierto ? 'good' : 'neutral';
  const insTitle = __lang === 'en' ? 'How much you build toward buying'
    : __lang === 'pt' ? 'Quanto você acumula para comprar'
    : 'Cuánto vas acumulando para comprar';
  const insText = __lang === 'en'
    ? (cubierto
        ? `With **${pctDesc}%** of rent counting toward the price, your **$${fmt(acum)}** already covers the full **$${fmt(v)}** value. The other **$${fmt(totAlq - acum)}** of rent paid does not count toward purchase.`
        : `Only **${pctDesc}%** of each rent payment counts toward the price, so after **$${fmt(totAlq)}** paid you've built just **$${fmt(acum)}** (**${pctV.toFixed(1)}%** of the property). You'd still owe **$${fmt(falta)}** to buy.`)
    : __lang === 'pt'
    ? (cubierto
        ? `Com **${pctDesc}%** do aluguel contando para o preço, seus **$${fmt(acum)}** já cobrem todo o valor de **$${fmt(v)}**. Os outros **$${fmt(totAlq - acum)}** pagos não contam para a compra.`
        : `Só **${pctDesc}%** de cada aluguel conta para o preço, então após **$${fmt(totAlq)}** pagos você acumulou apenas **$${fmt(acum)}** (**${pctV.toFixed(1)}%** do imóvel). Ainda faltariam **$${fmt(falta)}** para comprar.`)
    : (cubierto
        ? `Con el **${pctDesc}%** del alquiler descontable, tus **$${fmt(acum)}** ya cubren todo el valor de **$${fmt(v)}**. Los otros **$${fmt(totAlq - acum)}** pagados de alquiler no cuentan para la compra.`
        : `Solo el **${pctDesc}%** de cada alquiler se descuenta del precio, así que tras pagar **$${fmt(totAlq)}** acumulaste apenas **$${fmt(acum)}** (**${pctV.toFixed(1)}%** del inmueble). Todavía te faltarían **$${fmt(falta)}** para comprar.`);

  return { totalAlquilado:'$'+fmt(totAlq), acumuladoCompra:'$'+fmt(acum), faltante:'$'+fmt(falta), resumen,
    _insight: { title: insTitle, text: insText, tone: insTone, icon: '🏠' } };
}
