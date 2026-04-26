/** Tiempo y costo de carga auto eléctrico según potencia cargador y batería */
export interface Inputs { capacidadBateriaKwh: number; nivelBateriaInicialPct: number; nivelBateriaFinalPct: number; potenciaCargadorKw: number; eficienciaCargaPct: number; precioKwh: number; }
export interface Outputs { energiaNecesariaKwh: number; tiempoCargaHoras: number; costoTotalCarga: number; costoPorKm: number; explicacion: string; }
export function cargadorAutoElectricoHogar7Kw22Kw(i: Inputs): Outputs {
  const cap = Number(i.capacidadBateriaKwh);
  const ini = Number(i.nivelBateriaInicialPct) / 100;
  const fin = Number(i.nivelBateriaFinalPct) / 100;
  const pot = Number(i.potenciaCargadorKw);
  const efic = (Number(i.eficienciaCargaPct) || 90) / 100;
  const precio = Number(i.precioKwh) || 0;
  if (!cap || cap <= 0) throw new Error('Ingresá la capacidad de batería');
  if (!pot || pot <= 0) throw new Error('Ingresá la potencia del cargador');
  if (fin <= ini) throw new Error('Nivel final debe ser mayor al inicial');
  const energiaNeta = cap * (fin - ini);
  const energiaBruta = energiaNeta / efic;
  const horas = energiaBruta / pot;
  const costo = energiaBruta * precio;
  const kmAprox = energiaNeta * 6;
  const costoKm = kmAprox > 0 ? costo / kmAprox : 0;
  return {
    energiaNecesariaKwh: Number(energiaBruta.toFixed(2)),
    tiempoCargaHoras: Number(horas.toFixed(2)),
    costoTotalCarga: Number(costo.toFixed(2)),
    costoPorKm: Number(costoKm.toFixed(4)),
    explicacion: `Cargar de ${(ini*100).toFixed(0)}% a ${(fin*100).toFixed(0)}% requiere ${energiaBruta.toFixed(1)} kWh y ${horas.toFixed(1)}h con cargador de ${pot} kW. Costo ${costo.toFixed(2)} (~${kmAprox.toFixed(0)} km de autonomía).`,
  };
}
