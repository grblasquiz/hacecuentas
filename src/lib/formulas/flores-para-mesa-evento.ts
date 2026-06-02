/**
 * Calculadora de Flores para Mesa - Evento.
 */
export interface FloresParaMesaEventoInputs { mesas:number; tipoCentro:string; }
export interface FloresParaMesaEventoOutputs { florestotales:number; florespormesa:number; verdebrillante:number; costoEstimado:number; _insight?:any; }
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
  const costoEstimado = Number((florestotales * costoPorFlor).toFixed(0));
  const tipoLabel = tipo === 'alto' ? 'centro alto' : (tipo === 'simple' ? 'centro simple' : 'centro mediano');
  const insight = {
    title: 'Resumen del pedido',
    text: `Para **${mesas}** mesas con **${tipoLabel}** necesitás **${florestotales.toLocaleString('es-AR')}** flores (${florespormesa} por mesa) más unos **${verdebrillante.toLocaleString('es-AR')}** tallos de verde. Presupuestá cerca de **$${costoEstimado.toLocaleString('es-AR')}** solo en flores.`,
    tone: 'neutral',
    icon: '💐',
  };
  return {
    florestotales,
    florespormesa,
    verdebrillante,
    costoEstimado,
    _insight: insight,
  };
}
