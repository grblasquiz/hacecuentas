export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function autoviaPeajesArgentinaRuta2Ruta3(i: Inputs): Outputs {
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1*v2/10;
  const _insight = {
    title: 'Tu estimación de peajes',
    text: `Sobre los valores que cargaste, el costo estimado del trayecto es de **$${r.toFixed(2)}**. Las tarifas de peaje de la Ruta 2 y la Ruta 3 se actualizan seguido y varían según la categoría del vehículo y el medio de pago (Telepase suele tener descuento), así que tomá este número como referencia y confirmá la tarifa vigente antes de salir.`,
    tone: 'neutral',
    icon: '🛣️',
  };
  return { resultado:r.toFixed(2), resumen:`Cálculo: ${v1} × ${v2} / 10 = ${r.toFixed(2)}.`, _insight };
}
