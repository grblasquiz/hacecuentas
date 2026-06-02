export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function licenciaConducirCostoCategoriaB1A(i: Inputs): Outputs {
  const t=String(i.tipo||'nueva'); const c=String(i.categoria||'b');
  const baseTipo: Record<string,number> = { nueva:40000, renov:25000, duplicado:15000, ampliacion:30000 };
  const multCat: Record<string,number> = { a:1, b:1, c:1.4, d:1.5, e:1.3 };
  const t1=(baseTipo[t]||40000)*(multCat[c]||1);
  const tipoTxt: Record<string,string> = { nueva:'licencia nueva', renov:'renovación', duplicado:'duplicado', ampliacion:'ampliación' };
  const fmt='$'+t1.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
  const recargo = (multCat[c]||1) > 1;
  const _insight = {
    title: 'Costo del trámite',
    text: recargo
      ? `Una **${tipoTxt[t]||t}** categoría **${c.toUpperCase()}** ronda los **${fmt}**: la categoría ${c.toUpperCase()} aplica un recargo sobre el arancel base por exigir exámenes y aptitudes adicionales. Es un estimado de referencia; el valor exacto lo fija cada municipio.`
      : `Una **${tipoTxt[t]||t}** categoría **${c.toUpperCase()}** ronda los **${fmt}**. Es un valor de referencia: el arancel definitivo varía según el municipio donde tramites y puede sumar libreta sanitaria o curso de manejo.`,
    tone: 'neutral',
    icon: '🚗',
  };
  return { costo:fmt, validez:'5 años primera, luego 2-5 según edad', resumen:`${t} ${c.toUpperCase()}: ~$${t1.toFixed(0)}.`, _insight };
}
