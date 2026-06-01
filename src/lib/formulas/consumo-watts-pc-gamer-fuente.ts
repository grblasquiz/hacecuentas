export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; }
export function consumoWattsPcGamerFuente(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const cpu=Number(i.cpu)||0; const gpu=Number(i.gpu)||0; const otr=Number(i.otros)||50;
  const total=cpu+gpu+otr; const fuente=Math.ceil(total*1.3/50)*50;
  const resumen = __lang === 'en'
    ? `Peak ${total}W → recommended PSU ${fuente}W.`
    : `Pico ${total}W → fuente recomendada ${fuente}W.`;
  return { total:`${total} W`, fuente:`${fuente} W (80+ Gold)`, resumen };
}
