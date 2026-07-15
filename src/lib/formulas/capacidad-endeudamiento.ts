export interface Inputs { ingresoMensual: number; pagosDeudaMensuales: number; nuevaCuota?: number; }
export function capacidadEndeudamiento(i: Inputs) {
  const ingreso=Number(i.ingresoMensual), deuda=Number(i.pagosDeudaMensuales), nueva=Number(i.nuevaCuota||0);
  if(!(ingreso>0)) throw new Error('Ingresá el ingreso mensual bruto.'); if(deuda<0||nueva<0) throw new Error('Las cuotas no pueden ser negativas.');
  const ratioActual=deuda/ingreso*100, ratioConNueva=(deuda+nueva)/ingreso*100, disponible30=Math.max(0,ingreso*.30-deuda), disponible40=Math.max(0,ingreso*.40-deuda);
  return { ratioActual:Number(ratioActual.toFixed(1)), ratioConNueva:Number(ratioConNueva.toFixed(1)), disponible30:Math.round(disponible30), disponible40:Math.round(disponible40), detalle:`Tus pagos representan ${ratioActual.toFixed(1)}% del ingreso bruto${nueva?`; con la cuota simulada serían ${ratioConNueva.toFixed(1)}%`:''}.`, _insight:{title:ratioConNueva<=30?'Carga contenida':ratioConNueva<=40?'Revisá el margen mensual':'Carga elevada',text:'El DTI es pagos mensuales de deuda dividido ingreso bruto. No existe un umbral universal: cada prestamista define sus criterios.',tone:ratioConNueva<=30?'good':ratioConNueva<=40?'neutral':'warn',icon:'📊'} };
}
