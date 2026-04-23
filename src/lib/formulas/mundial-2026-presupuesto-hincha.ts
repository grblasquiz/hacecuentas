/** Mundial 2026 - Presupuesto hincha total */
export interface Inputs { cantidadPartidos: number; categoriaEntrada: string; diasViaje: number; hotelPorNoche: number; }
export interface Outputs { total: string; desglose: string; porDia: string; }

function precioPromedioEntrada(cat: string, cantidadPartidos: number): number {
  // cat 1-4
  const catN = cat.includes('Categoría 1') ? 1 : cat.includes('Categoría 2') ? 2 : cat.includes('Categoría 3') ? 3 : 4;
  const precios: Record<number, number[]> = {
    // [grupos, 16avos, 8vos, 4tos, semi, final]
    1: [500, 700, 900, 1400, 2200, 6750],
    2: [250, 400, 500, 800, 1200, 4100],
    3: [120, 180, 250, 400, 600, 1300],
    4: [60, 90, 150, 200, 300, 950],
  };
  const tabla = precios[catN];
  // Tomamos los primeros N partidos del camino hipotético (3 grupos + eliminatorias)
  const camino = [tabla[0], tabla[0], tabla[0], tabla[1], tabla[2], tabla[3], tabla[4]]; // grupo x3, 16avos, 8vos, 4tos, semi
  // Si son 7 partidos (incluye final), reemplazamos el último
  if (cantidadPartidos >= 7) camino[6] = tabla[5];
  else camino.push(tabla[5]);
  let total = 0;
  for (let i = 0; i < cantidadPartidos && i < camino.length; i++) total += camino[i];
  return total;
}

export function mundial2026PresupuestoHincha(i: Inputs): Outputs {
  const partidos = Number(i.cantidadPartidos);
  const cat = String(i.categoriaEntrada || '');
  const dias = Number(i.diasViaje);
  const hotel = Number(i.hotelPorNoche);
  if (!partidos || partidos < 1 || partidos > 7) throw new Error('Cantidad de partidos 1-7');
  if (!dias || dias < 1) throw new Error('Días inválidos');
  if (!hotel || hotel < 1) throw new Error('Costo hotel inválido');

  const vuelos = 1800;
  const alojamiento = dias * hotel;
  const entradas = precioPromedioEntrada(cat, partidos);
  const comida = dias * 70;
  const transporteInterno = partidos * 180;
  const extras = 500;
  const total = vuelos + alojamiento + entradas + comida + transporteInterno + extras;
  const porDia = total / dias;

  const desglose = `Vuelos USD ${vuelos} | Hotel USD ${alojamiento} (${dias} noches × ${hotel}) | Entradas USD ${entradas} (${partidos} partidos) | Comida USD ${comida} | Transporte interno USD ${transporteInterno} | Extras USD ${extras}`;

  return {
    total: `USD ${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`,
    desglose,
    porDia: `USD ${porDia.toFixed(0)} / día promedio`,
  };
}
