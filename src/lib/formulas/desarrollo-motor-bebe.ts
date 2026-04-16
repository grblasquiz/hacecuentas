/** Hitos del desarrollo motor del bebé por edad */
export interface Inputs { edadBebeMotor: number; }
export interface Outputs { hitosEsperados: string; proximosHitos: string; estimulacion: string; alerta: string; }

const hitos: Record<number, { esperados: string; proximos: string; estimulacion: string; alerta: string }> = {
  0: { esperados: 'Movimientos reflejos, gira la cabeza, reflejo de prensión', proximos: 'Levantar cabeza boca abajo, seguir objetos con la mirada', estimulacion: 'Contacto piel con piel, hablarle, ponerlo boca abajo brevemente', alerta: 'No succiona, no responde a sonidos fuertes, muy flácido' },
  2: { esperados: 'Levanta cabeza 45° boca abajo, abre y cierra manos, sigue objetos', proximos: 'Sostener cabeza firme, agarrar objetos, sonrisa social', estimulacion: 'Tummy time 3-5 min varias veces al día, juguetes de colores contrastantes', alerta: 'No levanta cabeza boca abajo, no sigue objetos con la mirada' },
  4: { esperados: 'Sostiene cabeza firme, se apoya en antebrazos, agarra objetos, ríe', proximos: 'Rodar, sentarse con apoyo, pasar objetos de mano a mano', estimulacion: 'Más tummy time, juguetes para agarrar, juego frente al espejo', alerta: 'No sostiene cabeza, no agarra objetos, no sonríe' },
  6: { esperados: 'Se sienta con apoyo, rueda, agarra y pasa objetos entre manos', proximos: 'Sentarse solo, gatear, pinza inferior', estimulacion: 'Juegos en el piso, objetos a distancia para motivar movimiento', alerta: 'No rueda, no se sienta con apoyo, no agarra' },
  9: { esperados: 'Se sienta solo, gatea, pinza inferior, dice ba-ba ma-ma', proximos: 'Pararse con apoyo, crucero, pinza superior', estimulacion: 'Espacio seguro para gatear, muebles para pararse, juguetes de encaje', alerta: 'No se sienta solo, no se desplaza, no balbucea' },
  12: { esperados: 'Se para solo, primeros pasos (o a punto), pinza fina, dice 1-3 palabras', proximos: 'Caminar solo con seguridad, correr, subir escaleras', estimulacion: 'Dejar caminar descalzo, juguetes de empujar, cubos para apilar', alerta: 'No se para con apoyo, no gatea ni se desplaza, no señala' },
  15: { esperados: 'Camina solo, apila 2-3 cubos, garabatea, dice 5-10 palabras', proximos: 'Correr, subir escaleras, patear pelota', estimulacion: 'Caminatas al aire libre, crayones gruesos, juegos de meter/sacar', alerta: 'No camina, no dice ninguna palabra, no señala' },
  18: { esperados: 'Corre (torpe), sube escaleras gateando, apila 3-4 cubos, usa cuchara', proximos: 'Correr bien, subir escaleras parado, saltar', estimulacion: 'Parques, pelotas, juegos de imitación, libros con texturas', alerta: 'No camina solo, no dice al menos 5 palabras, pierde habilidades' },
  24: { esperados: 'Corre bien, patea pelota, sube/baja escaleras, apila 6+ cubos, frases de 2 palabras', proximos: 'Saltar con 2 pies, pedalear triciclo, dibujar líneas', estimulacion: 'Juegos al aire libre, triciclo, rompecabezas simples, pintar', alerta: 'No corre, no dice frases, no sube escaleras' },
};

export function desarrolloMotor(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadBebeMotor));
  if (edad < 0 || edad > 24) throw new Error('Ingresá una edad entre 0 y 24 meses');
  const edades = Object.keys(hitos).map(Number).sort((a, b) => a - b);
  let closest = edades[0];
  for (const e of edades) { if (e <= edad) closest = e; }
  const h = hitos[closest];
  return { hitosEsperados: h.esperados, proximosHitos: h.proximos, estimulacion: h.estimulacion, alerta: h.alerta };
}
