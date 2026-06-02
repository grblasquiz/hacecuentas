/** Tiempo y costo de carga auto eléctrico según potencia cargador y batería */
export interface Inputs { capacidadBateriaKwh: number; nivelBateriaInicialPct: number; nivelBateriaFinalPct: number; potenciaCargadorKw: number; eficienciaCargaPct: number; precioKwh: number; }
export interface Outputs { energiaNecesariaKwh: number; tiempoCargaHoras: number; costoTotalCarga: number; costoPorKm: number; explicacion: string; _insight?: any; _chart?: any; }
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
  const perdidas = energiaBruta - energiaNeta;
  const horasTxt = horas >= 1 ? `${horas.toFixed(1)} h` : `${Math.round(horas * 60)} min`;

  const _insight = {
    title: 'Tu sesión de carga',
    text: precio > 0
      ? `Subir del **${(ini*100).toFixed(0)}%** al **${(fin*100).toFixed(0)}%** mete **${energiaNeta.toFixed(1)} kWh** a la batería y tarda **${horasTxt}** a **${pot} kW**. Cuesta **${costo.toFixed(2)}** (~${costoKm.toFixed(3)}/km) y rinde unos **${kmAprox.toFixed(0)} km**.`
      : `Subir del **${(ini*100).toFixed(0)}%** al **${(fin*100).toFixed(0)}%** mete **${energiaNeta.toFixed(1)} kWh** a la batería y tarda **${horasTxt}** a **${pot} kW**, para unos **${kmAprox.toFixed(0)} km**. Cargá el precio del kWh para ver el costo.`,
    tone: 'neutral',
    icon: '🔌',
  };

  // Donut: energía útil que entra a la batería vs. pérdidas por eficiencia de carga (suman el bruto de la red).
  const _chart = {
    type: 'doughnut',
    slices: [
      { label: 'A la batería', value: Number(energiaNeta.toFixed(2)) },
      { label: 'Pérdidas de carga', value: Number(perdidas.toFixed(2)) },
    ],
    prefix: '',
    centerValue: `${energiaBruta.toFixed(1)} kWh`,
    centerLabel: 'De la red',
    ariaLabel: `De ${energiaBruta.toFixed(1)} kWh tomados de la red, ${energiaNeta.toFixed(1)} kWh llegan a la batería y ${perdidas.toFixed(1)} kWh se pierden por eficiencia.`,
  };

  return {
    energiaNecesariaKwh: Number(energiaBruta.toFixed(2)),
    tiempoCargaHoras: Number(horas.toFixed(2)),
    costoTotalCarga: Number(costo.toFixed(2)),
    costoPorKm: Number(costoKm.toFixed(4)),
    explicacion: `Cargar de ${(ini*100).toFixed(0)}% a ${(fin*100).toFixed(0)}% requiere ${energiaBruta.toFixed(1)} kWh y ${horas.toFixed(1)}h con cargador de ${pot} kW. Costo ${costo.toFixed(2)} (~${kmAprox.toFixed(0)} km de autonomía).`,
    _insight,
    _chart,
  };
}
