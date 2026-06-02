export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number | Record<string, any>; }
export function facturaElectronicaAfipPrimeraVez(i: Inputs): Outputs {
  const r=String(i.regimen||'mono'); const t=String(i.tipo||'c');
  return {
    costo:'Gratuito (AFIP web)',
    proceso:'Alta punto venta → emisión factura → PDF/email al cliente',
    resumen:`Factura ${r} tipo ${t.toUpperCase()}: trámite gratuito en AFIP.`,
    _insight:{
      title:'Lo que tenés que saber',
      text:`Emitir tu primera factura **${t.toUpperCase()}** como **${r}** es **gratis** desde el comprobante en línea de AFIP: solo das de alta el punto de venta y emitís, sin contratar facturador externo.`,
      tone:'good',
      icon:'🧾',
    },
  };
}
