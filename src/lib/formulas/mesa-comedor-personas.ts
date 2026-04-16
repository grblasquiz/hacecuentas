export interface Inputs { personas: number; forma?: string; espacioExtra?: string; }
export interface Outputs { largoCm: number; anchoCm: number; espacioMinimo: string; consejo: string; }
export function mesaComedorPersonas(i: Inputs): Outputs {
  let pers = Number(i.personas); if (!pers || pers < 2) throw new Error('Mínimo 2 personas');
  const forma = String(i.forma || 'rectangular'); const extra = String(i.espacioExtra || 'no');
  if (extra === 'si') pers += 3;
  let largo = 0, ancho = 0, consejo = '';
  if (forma === 'rectangular') {
    ancho = 90; // estándar
    const lugaresLargo = Math.ceil(pers / 2); // 2 por lado
    largo = Math.max(120, lugaresLargo * 60); // 60cm por persona
    consejo = 'Mesa rectangular: ideal para espacios alargados. 60 cm de ancho mínimo por comensal.';
  } else if (forma === 'redonda') {
    const circ = pers * 60;
    const diam = Math.round(circ / Math.PI);
    largo = Math.max(90, diam); ancho = largo;
    consejo = 'Mesa redonda: mejor para conversación. Hasta 6 personas funciona bien; más de 8 ya es incómodo.';
  } else {
    const lado = Math.ceil(pers / 4);
    largo = Math.max(90, lado * 60 * 2); ancho = largo;
    consejo = 'Mesa cuadrada: ideal para 4 personas. Para 8+ se hace muy grande.';
  }
  return { largoCm: largo, anchoCm: ancho, espacioMinimo: '75–90 cm libres entre mesa y pared/mueble para poder sentarse y levantarse', consejo };
}