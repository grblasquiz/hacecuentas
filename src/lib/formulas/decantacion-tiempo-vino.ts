/** Decantación vino */
export interface Inputs { tipoVino: string; añadaVino?: number; }
export interface Outputs { tiempoDecantacion: string; metodo: string; razon: string; precaucion: string; }

export function decantacionTiempoVino(i: Inputs): Outputs {
  const tipo = String(i.tipoVino || 'tinto_medio');
  const anio = Number(i.añadaVino) || 0;
  const currentYear = 2026;
  const edad = anio > 0 ? currentYear - anio : 0;

  let tiempo = '', metodo = '', razon = '', prec = '';

  if (tipo === 'tinto_joven_tanico') {
    if (edad > 15) {
      tiempo = '10-15 min';
      metodo = 'Decantador simple, separar sedimento';
      razon = 'A esta edad, oxigenar poco para no oxidar.';
      prec = 'Servir dentro de 30 min.';
    } else if (edad > 5) {
      tiempo = '20-30 min';
      metodo = 'Decantador con aireación moderada';
      razon = 'Taninos algo integrados, necesita algo de aire.';
      prec = 'Probar tras 15 min y decidir.';
    } else {
      tiempo = '45-60 min';
      metodo = 'Decantador + aireador, movimiento circular';
      razon = 'Taninos jóvenes agresivos — el oxígeno los suaviza.';
      prec = 'Puede resistir hasta 2h de aire.';
    }
  } else if (tipo === 'tinto_joven_liviano') {
    tiempo = '15-20 min';
    metodo = 'Decantador simple';
    razon = 'Vinos livianos pierden fruta con mucho aire.';
    prec = 'No pasar de 30 min.';
  } else if (tipo === 'tinto_medio') {
    tiempo = '20-30 min';
    metodo = 'Decantador clásico';
    razon = 'Abrir aromas sin sobre-oxidar.';
    prec = 'Probar y ajustar.';
  } else if (tipo === 'tinto_anejo') {
    tiempo = '10-15 min';
    metodo = 'Decantador solo para separar sedimento';
    razon = 'Vinos viejos son frágiles — se oxidan rápido.';
    prec = 'SERVIR RÁPIDO. No exceder 20 min.';
  } else if (tipo === 'blanco') {
    tiempo = '0-5 min';
    metodo = 'No suele decantarse';
    razon = 'Blancos no necesitan oxígeno.';
    prec = 'Solo si huele reducido (azufre).';
  } else if (tipo === 'espumante') {
    tiempo = '0 min';
    metodo = 'NO DECANTAR';
    razon = 'Pierde CO₂ y burbujas.';
    prec = 'Servir directo de la botella.';
  } else if (tipo === 'postre_dulce') {
    tiempo = '10-15 min';
    metodo = 'Decantador simple';
    razon = 'Abrir aromas de fruta y miel.';
    prec = 'Servir frío.';
  } else if (tipo === 'rosado') {
    tiempo = '0 min';
    metodo = 'No decantar';
    razon = 'Frescura es lo esencial.';
    prec = 'Servir directo.';
  }

  return { tiempoDecantacion: tiempo, metodo, razon, precaucion: prec };
}
