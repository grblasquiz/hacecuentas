export interface Inputs { tipoFiltro: string; personas: number; litrosDia: number; }
export interface Outputs { mesesCambio: string; litrosTotales: string; senales: string; consejo: string; _insight?: any; }
interface FiltroData { litros: number; mesesMax: number; senales: string; consejo: string; }
const FILTROS: Record<string, FiltroData> = {
  carbon: { litros: 1200, mesesMax: 4, senales: 'Agua con sabor raro, flujo lento, color amarillento', consejo: 'No lo uses más allá de 4 meses aunque no se llegó al máximo de litros.' },
  osmosis: { litros: 8000, mesesMax: 12, senales: 'Baja presión, sabor raro, TDS alto en medidor', consejo: 'Cambiá prefiltros cada 6 meses y membrana cada 12-24 meses.' },
  sedimento: { litros: 5000, mesesMax: 6, senales: 'Flujo muy lento, agua turbia, acumulación visible', consejo: 'El prefiltro protege los filtros más caros. No escatimes en cambiarlo.' },
  ceramico: { litros: 3000, mesesMax: 12, senales: 'Flujo lento, no mejora al limpiar la vela', consejo: 'Limpiá la vela cerámica cada mes con cepillo suave. Cambiá al año.' },
  uv: { litros: 50000, mesesMax: 12, senales: 'Indicador UV apagado, lámpara oscurecida', consejo: 'La lámpara UV pierde eficacia al año aunque siga encendida. Cambiá anualmente.' },
};
export function filtroAguaCambioFrecuencia(i: Inputs): Outputs {
  const tipo = String(i.tipoFiltro || 'carbon'); const pers = Number(i.personas); const litDia = Number(i.litrosDia);
  if (!litDia) throw new Error('Ingresá los litros diarios');
  const data = FILTROS[tipo]; if (!data) throw new Error('Tipo de filtro no encontrado');
  const mesesPorLitros = data.litros / (litDia * 30);
  const meses = Math.min(data.mesesMax, Math.floor(mesesPorLitros));
  const limitaCaudal = Math.floor(mesesPorLitros) < data.mesesMax;
  const _insight = {
    title: `Cambialo cada ${meses} ${meses === 1 ? 'mes' : 'meses'}`,
    text: limitaCaudal
      ? `Con **${litDia} L/día** agotás los **${data.litros} L** de capacidad en unos **${meses} ${meses === 1 ? 'mes' : 'meses'}**, antes del límite de ${data.mesesMax} meses: te manda el caudal, no el calendario.`
      : `Te toca cambiarlo a los **${meses} meses** por vida útil del cartucho, aunque a **${litDia} L/día** todavía no llegues a los ${data.litros} L de capacidad. No lo estires de más: pierde eficacia con el tiempo.`,
    tone: meses <= 4 ? 'warn' : 'neutral',
    icon: '💧',
  };
  return { mesesCambio: `Cada ${meses} meses`, litrosTotales: `~${data.litros} litros de capacidad`, senales: data.senales, consejo: data.consejo, _insight };
}