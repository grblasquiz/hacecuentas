/** Mundial 2026 - Presupuesto hincha total */
export interface Inputs { cantidadPartidos: number; categoriaEntrada: string; diasViaje: number; hotelPorNoche: number; }
export interface Outputs { total: string; desglose: string; porDia: string; _insight?: any; _chart?: any; }

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

  // Rubro más caro del viaje.
  const rubros: Array<[string, number]> = [
    ['vuelos', vuelos], ['alojamiento', alojamiento], ['entradas', entradas],
    ['comida', comida], ['transporte interno', transporteInterno], ['extras', extras],
  ];
  const mayor = rubros.reduce((a, b) => (b[1] > a[1] ? b : a));
  const pctMayor = (mayor[1] / total) * 100;
  const totalFmt = `USD ${total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;

  const insight = {
    title: 'Lo que te cuesta el Mundial',
    text: `Ir a **${partidos} partido(s)** durante **${dias} días** te sale **${totalFmt}**, o sea **USD ${porDia.toFixed(0)} por día**. El rubro que más pesa es **${mayor[0]}** con USD ${mayor[1].toLocaleString('es-AR', { maximumFractionDigits: 0 })} (**${pctMayor.toFixed(0)}%** del total).`,
    tone: total >= 8000 ? 'warn' : 'neutral',
    icon: '✈️',
  };

  return {
    total: totalFmt,
    desglose,
    porDia: `USD ${porDia.toFixed(0)} / día promedio`,
    _insight: insight,
    _chart: {
      type: 'doughnut',
      slices: [
        { label: 'Vuelos', value: vuelos },
        { label: 'Alojamiento', value: alojamiento },
        { label: 'Entradas', value: entradas },
        { label: 'Comida', value: comida },
        { label: 'Transporte interno', value: transporteInterno },
        { label: 'Extras', value: extras },
      ],
      prefix: 'USD ',
      centerValue: totalFmt,
      centerLabel: 'total del viaje',
      ariaLabel: `Desglose del presupuesto de ${totalFmt}: vuelos USD ${vuelos}, alojamiento USD ${alojamiento}, entradas USD ${entradas}, comida USD ${comida}, transporte USD ${transporteInterno} y extras USD ${extras}`,
    },
  };
}
