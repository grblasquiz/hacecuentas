/** Agua y tiempo según tipo de arroz y cantidad (pers/gramos) */
export interface Inputs {
  tipoArroz?: string;
  cantidadGramos?: number;
  porciones?: number;
}
export interface Outputs {
  arrozGramos: number;
  aguaMl: number;
  aguaTazas: number;
  tiempoCoccion: number;
  temperatura: string;
  rendimientoCocido: number;
  tipo: string;
  instrucciones: string;
  resumen: string;
}

const TIPOS: Record<string, {
  nombre: string;
  ratio: number; // ml agua por gramo de arroz
  tiempoMin: number;
  temperatura: string;
  instrucciones: string;
  rendimiento: number; // gramos crudos → cocidos
}> = {
  blanco_largo: { nombre: 'Arroz blanco largo fino (tipo Gallo Oro)', ratio: 2.0, tiempoMin: 18, temperatura: 'Llevar a hervor, luego fuego mínimo tapado.', instrucciones: 'Lavar el arroz si querés grano más seco. Sal al hervir. 18 min tapado sin destapar. Reposo 5 min.', rendimiento: 3 },
  blanco_redondo: { nombre: 'Arroz blanco doble carolina (redondo)', ratio: 2.2, tiempoMin: 20, temperatura: 'Hervor suave tapado.', instrucciones: 'Ideal para risotto, arroz con leche, paella. 20 min tapado.', rendimiento: 2.8 },
  integral: { nombre: 'Arroz integral', ratio: 2.5, tiempoMin: 40, temperatura: 'Hervor, fuego bajo tapado.', instrucciones: 'Remojar 30 min antes acorta tiempo. 40-45 min tapado. Reposo 10 min.', rendimiento: 2.5 },
  basmati: { nombre: 'Basmati', ratio: 1.5, tiempoMin: 15, temperatura: 'Hervor, fuego mínimo tapado.', instrucciones: 'Lavar hasta que el agua salga clara. Remojar 15 min. Cocción 12-15 min. Reposo 5 min.', rendimiento: 3 },
  jazmin: { nombre: 'Jazmín', ratio: 1.5, tiempoMin: 15, temperatura: 'Hervor, fuego mínimo tapado.', instrucciones: 'Lavar 3 veces. 15 min tapado. Reposo 5 min.', rendimiento: 3 },
  arborio: { nombre: 'Arborio / Carnaroli (risotto)', ratio: 3.0, tiempoMin: 18, temperatura: 'Fuego medio, agregar caldo de a poco revolviendo.', instrucciones: 'NO lavar. Tostar 2 min con manteca/cebolla. Agregar caldo caliente en tandas mientras se revuelve. 18 min.', rendimiento: 3 },
  salvaje: { nombre: 'Arroz salvaje (wild rice)', ratio: 3.0, tiempoMin: 45, temperatura: 'Hervor bajo tapado.', instrucciones: '45-55 min hasta que los granos se abran. Colar excedente de agua.', rendimiento: 3.5 },
  parboiled: { nombre: 'Arroz parboiled (parbolizado)', ratio: 2.3, tiempoMin: 22, temperatura: 'Hervor, fuego bajo.', instrucciones: 'No se pasa, grano suelto. 22 min tapado.', rendimiento: 3 },
};

export function arrozAguaProporcion(i: Inputs): Outputs {
  const tipo = String(i.tipoArroz || 'blanco_largo');
  let gramos = Number(i.cantidadGramos) || 0;
  const porciones = Number(i.porciones) || 0;

  if (!TIPOS[tipo]) throw new Error('Tipo de arroz no válido');
  if (!gramos && !porciones) throw new Error('Ingresá cantidad de arroz o porciones');
  if (!gramos && porciones) gramos = porciones * 70; // 70 g/persona estándar (guarnición)
  if (gramos <= 0) throw new Error('Cantidad inválida');

  const t = TIPOS[tipo];
  const aguaMl = gramos * t.ratio;
  const aguaTazas = aguaMl / 240;
  const cocido = gramos * t.rendimiento;

  return {
    arrozGramos: gramos,
    aguaMl: Math.round(aguaMl),
    aguaTazas: Number(aguaTazas.toFixed(2)),
    tiempoCoccion: t.tiempoMin,
    temperatura: t.temperatura,
    rendimientoCocido: Math.round(cocido),
    tipo: t.nombre,
    instrucciones: t.instrucciones,
    resumen: `${gramos} g de ${t.nombre.toLowerCase()} + ${Math.round(aguaMl)} ml de agua, ${t.tiempoMin} min. Rinde ~${Math.round(cocido)} g cocido.`,
  };
}
