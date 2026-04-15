/** Calorías de platos argentinos típicos */
export interface Inputs {
  plato: string;
  porciones?: number;
}
export interface Outputs {
  caloriasTotales: number;
  composicion: string;
  detalle: string;
}

interface DatoPlato {
  nombre: string;
  kcal: number;
  proteina: number;
  carbs: number;
  grasa: number;
  porcion: string;
}

export function caloriasPlayoArgentinoTipico(i: Inputs): Outputs {
  const plato = i.plato;
  const porciones = Number(i.porciones) || 1;

  if (!plato) throw new Error('Seleccioná un plato');
  if (porciones <= 0) throw new Error('La cantidad debe ser mayor a 0');

  const platos: Record<string, DatoPlato> = {
    asado_completo: { nombre: 'Asado completo', kcal: 1050, proteina: 70, carbs: 15, grasa: 75, porcion: '~400 g carne + achuras + chorizo' },
    milanesa_napolitana: { nombre: 'Milanesa napolitana', kcal: 800, proteina: 45, carbs: 40, grasa: 50, porcion: '1 milanesa con jamón, salsa y queso' },
    milanesa_simple: { nombre: 'Milanesa con puré', kcal: 750, proteina: 40, carbs: 55, grasa: 40, porcion: '1 milanesa + puré de papas' },
    empanada_carne: { nombre: 'Empanada de carne', kcal: 300, proteina: 12, carbs: 22, grasa: 18, porcion: '1 unidad al horno' },
    empanada_jyq: { nombre: 'Empanada de jamón y queso', kcal: 280, proteina: 10, carbs: 20, grasa: 17, porcion: '1 unidad al horno' },
    choripan: { nombre: 'Choripán', kcal: 500, proteina: 22, carbs: 30, grasa: 32, porcion: '1 chorizo en pan francés' },
    pizza_muzzarella: { nombre: 'Pizza de muzzarella', kcal: 280, proteina: 12, carbs: 30, grasa: 12, porcion: '1 porción (⅛ pizza)' },
    locro: { nombre: 'Locro', kcal: 650, proteina: 30, carbs: 55, grasa: 35, porcion: '1 plato hondo' },
    ravioles_tuco: { nombre: 'Ravioles con tuco', kcal: 580, proteina: 25, carbs: 60, grasa: 25, porcion: '1 plato' },
    bife_ensalada: { nombre: 'Bife de chorizo con ensalada', kcal: 550, proteina: 55, carbs: 10, grasa: 33, porcion: '1 bife ~300 g + ensalada' },
    matambre_rusa: { nombre: 'Matambre con ensalada rusa', kcal: 700, proteina: 35, carbs: 40, grasa: 45, porcion: '3-4 fetas + ensalada rusa' },
    flan_ddl: { nombre: 'Flan con dulce de leche y crema', kcal: 450, proteina: 10, carbs: 50, grasa: 22, porcion: '1 porción con DDL y crema' },
    medialunas: { nombre: 'Medialunas (3)', kcal: 500, proteina: 10, carbs: 60, grasa: 25, porcion: '3 medialunas de manteca' },
    alfajor_maicena: { nombre: 'Alfajor de maicena', kcal: 250, proteina: 3, carbs: 35, grasa: 12, porcion: '1 alfajor' },
    mate_facturas: { nombre: 'Mate con 3 facturas', kcal: 550, proteina: 8, carbs: 70, grasa: 28, porcion: 'Mate + 3 facturas surtidas' },
  };

  const dato = platos[plato];
  if (!dato) throw new Error('Plato no encontrado');

  const kcalTotal = Math.round(dato.kcal * porciones);
  const prot = Math.round(dato.proteina * porciones);
  const carbs = Math.round(dato.carbs * porciones);
  const grasa = Math.round(dato.grasa * porciones);

  return {
    caloriasTotales: kcalTotal,
    composicion: `Proteína: ${prot} g | Carbohidratos: ${carbs} g | Grasa: ${grasa} g`,
    detalle: `${dato.nombre} (${dato.porcion}) × ${porciones}: ${kcalTotal} kcal. Proteína ${prot} g, carbs ${carbs} g, grasa ${grasa} g. Valores aproximados por porción estándar.`,
  };
}
