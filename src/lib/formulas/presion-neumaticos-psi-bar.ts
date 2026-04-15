/** Convierte presión de neumáticos entre PSI, bar y kPa */
export interface Inputs {
  valorPresion: number;
  unidadOrigen: number;
}
export interface Outputs {
  psi: number;
  bar: number;
  kpa: number;
  detalle: string;
}

export function presionNeumaticosPsiBar(i: Inputs): Outputs {
  const valor = Number(i.valorPresion);
  const unidad = Number(i.unidadOrigen);

  if (!valor || valor <= 0) throw new Error('Ingresá un valor de presión mayor a 0');
  if (unidad < 1 || unidad > 3) throw new Error('La unidad debe ser 1 (PSI), 2 (Bar) o 3 (kPa)');

  let psi: number, bar: number, kpa: number;

  if (unidad === 1) {
    // Origen: PSI
    psi = valor;
    bar = valor * 0.0689476;
    kpa = valor * 6.89476;
  } else if (unidad === 2) {
    // Origen: Bar
    bar = valor;
    psi = valor * 14.5038;
    kpa = valor * 100;
  } else {
    // Origen: kPa
    kpa = valor;
    psi = valor * 0.145038;
    bar = valor * 0.01;
  }

  const unidades = ['', 'PSI', 'bar', 'kPa'];
  let rango = '';
  if (psi >= 28 && psi <= 36) rango = 'Rango normal para autos';
  else if (psi < 28) rango = 'Presión baja — verificá si es correcta para tu vehículo';
  else if (psi <= 45) rango = 'Rango normal para SUV/pickup con carga';
  else rango = 'Presión alta — verificá la especificación de tu vehículo';

  return {
    psi: Number(psi.toFixed(1)),
    bar: Number(bar.toFixed(2)),
    kpa: Number(kpa.toFixed(1)),
    detalle: `${valor} ${unidades[unidad]} = ${psi.toFixed(1)} PSI = ${bar.toFixed(2)} bar = ${kpa.toFixed(1)} kPa. ${rango}.`,
  };
}
