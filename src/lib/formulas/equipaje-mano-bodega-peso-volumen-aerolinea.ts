export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function equipajeManoBodegaPesoVolumenAerolinea(i: Inputs): Outputs {
  const a=String(i.aerolinea||'aerolineas_ar'); const t=String(i.tipo||'mano');
  const pesos={'aerolineas_ar':{mano:8,bodega_economica:23,bodega_business:32},'latam':{mano:8,bodega_economica:23,bodega_business:32},'gol':{mano:10,bodega_economica:23,bodega_business:32},'american':{mano:10,bodega_economica:23,bodega_business:32},'iberia':{mano:10,bodega_economica:23,bodega_business:32},'emirates':{mano:7,bodega_economica:30,bodega_business:40}};
  const p=pesos[a][t];
  const med=t==='mano'?'55×35×25 cm':'158 cm lineales (largo+ancho+alto)';
  const esMano = t==='mano';
  const _insight = {
    title: 'Tu franquicia',
    text: esMano
      ? `Tu equipaje de mano puede pesar hasta **${p} kg** y medir **${med}**. Pesalo y medilo en casa: si te pasás, en el mostrador lo mandan a bodega y pagás exceso (**USD 10–30/kg**).`
      : `Tu valija de bodega puede pesar hasta **${p} kg** con un máximo de **${med}**. Cada kilo de más se cobra aparte (**USD 10–30/kg**), así que repartí el peso entre valijas antes de despachar.`,
    tone: 'neutral',
    icon: esMano ? '🎒' : '🧳',
  };
  return { peso:`${p} kg`, medidas:med, costoExceso:`USD 10-30/kg exceso`, _insight };
}
