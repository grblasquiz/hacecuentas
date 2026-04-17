/**
 * Calculadora de Flores para Mesa - Evento.
 */
export interface FloresParaMesaEventoInputs { mesas:number; tipoCentro:string; }
export interface FloresParaMesaEventoOutputs { florestotales:number; florespormesa:number; verdebrillante:number; costoEstimado:number; }
export function floresParaMesaEvento(inputs: FloresParaMesaEventoInputs): FloresParaMesaEventoOutputs {
  const mesas = Number(inputs.mesas);
  const tipo = inputs.tipoCentro;
  if (!mesas || mesas <= 0) throw new Error('Ingresá mesas');
  let florespormesa = 20;
  if (tipo === 'simple') florespormesa = 10;
  else if (tipo === 'alto') florespormesa = 40;
  const florestotales = mesas * florespormesa;
  const verdebrillante = mesas * 200;
  const costoPorFlor = tipo === 'alto' ? 1.8 : (tipo === 'simple' ? 1.2 : 1.5);
  return {
    florestotales,
    florespormesa,
    verdebrillante,
    costoEstimado: Number((florestotales * costoPorFlor).toFixed(0)),
  };
}
