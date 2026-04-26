/** Frecuencia extracción y stock leche materna recomendado para volver al trabajo */
export interface Inputs { edadBebeMeses: number; horasFueraPorDia: number; tomasPorDiaBebe: number; mlPorTomaPromedio: number; diasStockBuffer: number; }
export interface Outputs { extraccionesPorDiaTrabajo: number; mlNecesariosPorDia: number; stockTotalRecomendadoMl: number; bolsasFreezer150ml: number; explicacion: string; }
export function lactarioLecheMaternaExtraccionFrecuenciaStock(i: Inputs): Outputs {
  const edad = Number(i.edadBebeMeses);
  const horasFuera = Number(i.horasFueraPorDia) || 0;
  const tomasDia = Number(i.tomasPorDiaBebe) || 0;
  const mlToma = Number(i.mlPorTomaPromedio) || 0;
  const buffer = Number(i.diasStockBuffer) || 3;
  if (!edad || edad < 0) throw new Error('Ingresá la edad del bebé en meses');
  if (horasFuera <= 0 || tomasDia <= 0 || mlToma <= 0) throw new Error('Completá horas fuera, tomas y ml por toma');
  const tomasFuera = Math.ceil((horasFuera / 24) * tomasDia);
  const extracciones = Math.max(2, Math.ceil(horasFuera / 3));
  const mlDia = tomasFuera * mlToma;
  const stockTotal = mlDia * buffer;
  const bolsas = Math.ceil(stockTotal / 150);
  return {
    extraccionesPorDiaTrabajo: extracciones,
    mlNecesariosPorDia: Number(mlDia.toFixed(0)),
    stockTotalRecomendadoMl: Number(stockTotal.toFixed(0)),
    bolsasFreezer150ml: bolsas,
    explicacion: `Para ${horasFuera}h fuera: ~${extracciones} extracciones/día, ${mlDia} ml/día. Stock buffer ${buffer} días = ${stockTotal} ml (${bolsas} bolsas de 150 ml).`,
  };
}
