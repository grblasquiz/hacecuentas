/** Maridaje vino comida */
export interface Inputs { proteina: string; salsa: string; }
export interface Outputs { vinoPrincipal: string; alternativa: string; razonamiento: string; evitar: string; }

export function maridajeVinoComida(i: Inputs): Outputs {
  const p = String(i.proteina);
  const s = String(i.salsa);

  let principal = '', alt = '', razon = '', evitar = '';

  if (p === 'carne_roja') {
    if (s === 'grill_parrilla') { principal = 'Malbec joven (Mendoza)'; alt = 'Cabernet Sauvignon'; razon = 'Taninos medios balancean grasa ahumada; fruta madura complementa umami.'; evitar = 'Pinot Noir (muy liviano), Sauvignon Blanc'; }
    else if (s === 'horno') { principal = 'Cabernet Sauvignon o Bordeaux'; alt = 'Syrah, Malbec reserva'; razon = 'Cocción lenta pide vino estructurado y elegante.'; evitar = 'Vinos muy jóvenes'; }
    else if (s === 'cremosa') { principal = 'Cabernet Franc o Merlot'; alt = 'Tempranillo'; razon = 'Taninos suaves no chocan con cremas.'; evitar = 'Malbec tánico'; }
    else if (s === 'tomate') { principal = 'Sangiovese / Chianti'; alt = 'Nebbiolo'; razon = 'Acidez del vino complementa acidez del tomate.'; evitar = 'Vinos de alta madera'; }
    else { principal = 'Malbec'; alt = 'Cabernet'; razon = 'Clásico argentino para carne.'; evitar = 'Blancos livianos'; }
  } else if (p === 'cerdo') {
    principal = 'Pinot Noir o Malbec joven';
    alt = 'Tempranillo, Chardonnay';
    razon = 'Cerdo pide taninos medios o blanco con cuerpo.';
    evitar = 'Cabernet robusto (aplasta)';
  } else if (p === 'pollo') {
    if (s === 'citrica' || s === 'simple') { principal = 'Sauvignon Blanc'; alt = 'Pinot Grigio, Chardonnay sin barrica'; razon = 'Acidez refresca y complementa cítrico.'; evitar = 'Tintos, blancos dulces'; }
    else if (s === 'cremosa') { principal = 'Chardonnay con barrica'; alt = 'Viognier'; razon = 'Cuerpo y textura del vino dialogan con la crema.'; evitar = 'Sauvignon Blanc'; }
    else if (s === 'grill_parrilla' || s === 'horno') { principal = 'Chardonnay o Pinot Noir'; alt = 'Garnacha liviana'; razon = 'Pollo grillado tolera blanco con cuerpo o tinto liviano.'; evitar = 'Cabernet fuerte'; }
    else { principal = 'Chardonnay'; alt = 'Pinot Noir'; razon = 'Versátil para pollo.'; evitar = 'Vinos muy tánicos'; }
  } else if (p === 'pescado_blanco') {
    principal = 'Sauvignon Blanc';
    alt = 'Pinot Grigio, Albariño';
    razon = 'Pescado delicado pide blanco fresco con acidez.';
    evitar = 'Tintos (sabor metálico), blancos dulces';
  } else if (p === 'pescado_graso') {
    principal = 'Pinot Noir o Chardonnay';
    alt = 'Rosado provenzal';
    razon = 'Salmón/atún toleran tinto liviano o blanco robusto.';
    evitar = 'Cabernet tánico';
  } else if (p === 'mariscos') {
    principal = 'Albariño o Chablis';
    alt = 'Champagne brut, Sauvignon Blanc';
    razon = 'Mineralidad y acidez complementan sabor salino del mar.';
    evitar = 'Tintos, blancos dulces';
  } else if (p === 'pasta') {
    if (s === 'tomate') { principal = 'Sangiovese / Chianti'; alt = 'Montepulciano'; razon = 'Acidez de tomate pide vino ácido.'; evitar = 'Vinos muy dulces'; }
    else if (s === 'cremosa') { principal = 'Chardonnay'; alt = 'Viognier'; razon = 'Textura cremosa + vino con cuerpo.'; evitar = 'Vinos ácidos'; }
    else { principal = 'Sangiovese'; alt = 'Pinot Noir'; razon = 'Versátil para pastas.'; evitar = 'Cabernet fuerte'; }
  } else if (p === 'queso') {
    principal = 'Varía según queso: duros → Malbec, azules → Oporto';
    alt = 'Champagne (versátil)';
    razon = 'Cada queso requiere maridaje específico.';
    evitar = 'Un solo vino para toda la tabla';
  } else if (p === 'postre') {
    principal = 'Oporto o Sauternes';
    alt = 'Moscato, Tokaji';
    razon = 'Postre dulce requiere vino MÁS dulce para no saber amargo.';
    evitar = 'Vinos secos';
  }

  return { vinoPrincipal: principal, alternativa: alt, razonamiento: razon, evitar };
}
