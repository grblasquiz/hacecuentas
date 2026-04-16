/** Test de tipo de piel (grasa, seca, mixta, sensible) */
export interface Inputs {
  brilloZonaT: string;
  tirantes: string;
  poros: string;
  reaccionProductos: string;
  textura: string;
}
export interface Outputs {
  tipoPiel: string;
  descripcion: string;
  cuidadoRecomendado: string;
  ingredientesClave: string;
  mensaje: string;
}

export function tipoPielTest(i: Inputs): Outputs {
  const brilloZonaT = String(i.brilloZonaT || 'medio');
  const tirantes = String(i.tirantes || 'no');
  const poros = String(i.poros || 'normales');
  const reaccionProductos = String(i.reaccionProductos || 'no');
  const textura = String(i.textura || 'normal');

  let puntos = { grasa: 0, seca: 0, mixta: 0, sensible: 0, normal: 0 };

  // Brillo zona T
  if (brilloZonaT === 'mucho') { puntos.grasa += 3; puntos.mixta += 2; }
  else if (brilloZonaT === 'medio') { puntos.mixta += 3; puntos.normal += 1; }
  else { puntos.seca += 2; puntos.normal += 2; }

  // Tirantes
  if (tirantes === 'siempre') { puntos.seca += 3; }
  else if (tirantes === 'a_veces') { puntos.seca += 1; puntos.mixta += 1; }
  else { puntos.grasa += 1; puntos.normal += 2; }

  // Poros
  if (poros === 'grandes') { puntos.grasa += 3; }
  else if (poros === 'zonaT') { puntos.mixta += 3; }
  else if (poros === 'pequenos') { puntos.seca += 1; puntos.normal += 2; }
  else { puntos.normal += 2; }

  // Reacción a productos
  if (reaccionProductos === 'siempre') { puntos.sensible += 4; }
  else if (reaccionProductos === 'a_veces') { puntos.sensible += 2; }
  else { puntos.normal += 1; }

  // Textura
  if (textura === 'rugosa') { puntos.seca += 2; }
  else if (textura === 'oleosa') { puntos.grasa += 2; }
  else { puntos.normal += 2; }

  // Determinar tipo
  const entries = Object.entries(puntos).sort((a, b) => b[1] - a[1]);
  const tipo = entries[0][0];

  const descripciones: Record<string, string> = {
    grasa: 'Piel grasa: brillo excesivo, poros visibles, tendencia al acné. Producción alta de sebo.',
    seca: 'Piel seca: tirante, opaca, puede descamarse. Baja producción de sebo.',
    mixta: 'Piel mixta: zona T grasa (frente, nariz, mentón) y mejillas secas o normales.',
    sensible: 'Piel sensible: se enrojece fácil, reacciona a productos. Necesita cuidado extra.',
    normal: 'Piel normal: equilibrada, sin brillo excesivo ni tirantes. Poros poco visibles.',
  };

  const cuidados: Record<string, string> = {
    grasa: 'Limpieza suave 2x/día, gel oil-free, exfoliación 2x/semana, hidratante ligero.',
    seca: 'Limpieza cremosa, hidratante rica (ceramidas), evitar agua caliente, SPF diario.',
    mixta: 'Limpieza suave, hidratante ligero en zona T, más rico en mejillas. BHA/AHA semanales.',
    sensible: 'Productos sin fragancia ni alcohol. Testear siempre en antebrazo. Hidratante con centella asiática.',
    normal: 'Rutina básica: limpieza, hidratante, SPF. Podés incorporar activos gradualmente.',
  };

  const ingredientes: Record<string, string> = {
    grasa: 'Niacinamida, ácido salicílico (BHA), arcilla, zinc, retinol.',
    seca: 'Ácido hialurónico, ceramidas, manteca de karité, escualano, vitamina E.',
    mixta: 'Niacinamida, ácido hialurónico, BHA suave, gel-crema.',
    sensible: 'Centella asiática, avena coloidal, alantoína, pantenol, ceramidas.',
    normal: 'Vitamina C, retinol (gradual), ácido hialurónico, péptidos.',
  };

  return {
    tipoPiel: tipo.charAt(0).toUpperCase() + tipo.slice(1),
    descripcion: descripciones[tipo],
    cuidadoRecomendado: cuidados[tipo],
    ingredientesClave: ingredientes[tipo],
    mensaje: `Tu tipo de piel es: ${tipo.charAt(0).toUpperCase() + tipo.slice(1)}. ${descripciones[tipo]}`,
  };
}
