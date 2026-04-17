/** Calculadora de Margin Call en Futuros (precio de llamada) */
export interface Inputs { precioEntrada: number; contratos: number; multiplicador: number; equityCuenta: number; margenMantenimiento: number; direccion: 'long' | 'short'; }
export interface Outputs { precioMarginCall: number; distanciaMargin: number; distanciaPorcentaje: number; perdidaAlMC: number; evaluacion: string; }
export function marginCallFuturosPrecio(i: Inputs): Outputs {
  const ent = Number(i.precioEntrada); const n = Number(i.contratos);
  const mul = Number(i.multiplicador); const eq = Number(i.equityCuenta);
  const mm = Number(i.margenMantenimiento); const dir = i.direccion;
  if (!ent || ent <= 0) throw new Error('Ingresá entrada');
  if (!n || n <= 0) throw new Error('Ingresá contratos');
  if (!mul || mul <= 0) throw new Error('Ingresá multiplicador');
  if (!eq || eq <= 0) throw new Error('Ingresá equity');
  if (!mm || mm <= 0) throw new Error('Ingresá margen mantenimiento');
  const totalMaint = mm * n;
  if (eq <= totalMaint) throw new Error('Equity ya por debajo del mantenimiento');
  const exceso = eq - totalMaint;
  const puntos = exceso / (n * mul);
  const mc = dir === 'long' ? ent - puntos : ent + puntos;
  const pct = (Math.abs(mc - ent) / ent) * 100;
  let eval_ = '';
  if (pct < 1) eval_ = '☠️ Muy cerca — alto riesgo';
  else if (pct < 3) eval_ = '⚠️ Cerca — revisar size';
  else if (pct < 5) eval_ = '⚠️ Moderado';
  else if (pct < 10) eval_ = '✅ Espacio razonable';
  else eval_ = '✅ Muy lejos — buen buffer';
  return {
    precioMarginCall: Number(mc.toFixed(2)),
    distanciaMargin: Number(puntos.toFixed(2)),
    distanciaPorcentaje: Number(pct.toFixed(2)),
    perdidaAlMC: Number(exceso.toFixed(2)),
    evaluacion: eval_,
  };
}