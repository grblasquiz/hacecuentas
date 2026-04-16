/** Costo de peajes por ruta */
export interface Inputs {
  rutaSeleccionada: string;
  tipoVehiculo: string;
  idaYVuelta: string;
  cantidadCabinasManual?: number;
  precioCabinaManual?: number;
}
export interface Outputs {
  costoTotal: number;
  cantidadCabinas: number;
  costoConTelepase: number;
  costoIda: number;
  detalle: string;
}

interface RutaInfo {
  cabinas: number;
  precioPromedio: number;
  nombre: string;
}

const RUTAS: Record<string, RutaInfo> = {
  bsas_mardel:       { cabinas: 5, precioPromedio: 2500, nombre: 'Buenos Aires - Mar del Plata (Autovía 2)' },
  bsas_rosario:      { cabinas: 4, precioPromedio: 2500, nombre: 'Buenos Aires - Rosario (Panamericana/RN9)' },
  bsas_cordoba:      { cabinas: 7, precioPromedio: 2800, nombre: 'Buenos Aires - Córdoba (RN 9)' },
  bsas_mendoza:      { cabinas: 10, precioPromedio: 3000, nombre: 'Buenos Aires - Mendoza (RN 7)' },
  acceso_norte:      { cabinas: 2, precioPromedio: 1500, nombre: 'Acceso Norte (Panamericana CABA-Pilar)' },
  acceso_oeste:      { cabinas: 2, precioPromedio: 1400, nombre: 'Acceso Oeste (CABA-Luján)' },
  autopista_laplata: { cabinas: 1, precioPromedio: 2000, nombre: 'Autopista Buenos Aires - La Plata' },
  autopista_ezeiza:  { cabinas: 1, precioPromedio: 2500, nombre: 'Autopista Riccheri (CABA-Ezeiza)' },
};

export function costoPeajeRuta(i: Inputs): Outputs {
  const ruta = String(i.rutaSeleccionada);
  const tipo = String(i.tipoVehiculo);
  const idaVuelta = i.idaYVuelta === 'si';

  // Multiplicador por tipo de vehículo
  let multVehiculo = 1;
  if (tipo === 'camioneta_grande') multVehiculo = 1.5;
  if (tipo === 'moto') multVehiculo = 0.5;

  let cabinas: number;
  let precioBase: number;
  let nombreRuta: string;

  if (ruta === 'personalizado') {
    cabinas = Number(i.cantidadCabinasManual) || 1;
    precioBase = Number(i.precioCabinaManual) || 0;
    nombreRuta = 'Ruta personalizada';
    if (precioBase <= 0) throw new Error('Ingresá el precio promedio por cabina');
  } else if (RUTAS[ruta]) {
    const r = RUTAS[ruta];
    cabinas = r.cabinas;
    precioBase = r.precioPromedio;
    nombreRuta = r.nombre;
  } else {
    throw new Error('Seleccioná una ruta válida');
  }

  const costoIda = Math.round(cabinas * precioBase * multVehiculo);
  const costoTotal = idaVuelta ? costoIda * 2 : costoIda;
  const costoConTelepase = Math.round(costoTotal * 0.85); // 15% descuento

  const tipoLabel = tipo === 'camioneta_grande' ? 'camioneta/SUV' : tipo === 'moto' ? 'moto' : 'auto';

  return {
    costoTotal,
    cantidadCabinas: idaVuelta ? cabinas * 2 : cabinas,
    costoConTelepase,
    costoIda,
    detalle: `${nombreRuta} — ${cabinas} cabinas por sentido × $${precioBase.toLocaleString('es-AR')} (${tipoLabel})${idaVuelta ? ' × 2 (ida y vuelta)' : ''}`,
  };
}
