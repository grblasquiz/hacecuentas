/**
 * Calculadora de Fruta por Invitado - Cumple.
 */
export interface FrutaPorInvitadoCumpleInputs { invitados:number; rol:string; }
export interface FrutaPorInvitadoCumpleOutputs { kgFruta:number; kgFrutillas:number; kgManzana:number; kgBanana:number; kgVariados:number; }
export function frutaPorInvitadoCumple(inputs: FrutaPorInvitadoCumpleInputs): FrutaPorInvitadoCumpleOutputs {
  const inv = Number(inputs.invitados);
  const rol = inputs.rol;
  if (!inv || inv <= 0) throw new Error('Ingresá invitados');
  let gramos = 200;
  if (rol === 'decoracion') gramos = 100;
  else if (rol === 'licuados') gramos = 300;
  const kgFruta = (inv * gramos) / 1000;
  return {
    kgFruta: Number(kgFruta.toFixed(2)),
    kgFrutillas: Number((kgFruta * 0.3).toFixed(2)),
    kgManzana: Number((kgFruta * 0.25).toFixed(2)),
    kgBanana: Number((kgFruta * 0.2).toFixed(2)),
    kgVariados: Number((kgFruta * 0.25).toFixed(2)),
  };
}
