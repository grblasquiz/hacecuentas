/** Timeline de recuperación posparto */
export interface Inputs { fechaParto: string; tipoParto: string; }
export interface Outputs { semanaPosparto: string; queEsperar: string; ejercicio: string; proximoHito: string; }

export function pospartoRecuperacion(i: Inputs): Outputs {
  const parts = String(i.fechaParto || '').split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Ingresá una fecha de parto válida');
  const [yy, mm, dd] = parts;
  const parto = new Date(yy, mm - 1, dd);
  if (isNaN(parto.getTime())) throw new Error('Ingresá una fecha de parto válida');
  const tipo = String(i.tipoParto);
  const hoy = new Date(); hoy.setHours(0, 0, 0, 0);
  const dias = Math.floor((hoy.getTime() - parto.getTime()) / (1000 * 60 * 60 * 24));
  if (dias < 0) throw new Error('La fecha del parto no puede ser futura');
  const semanas = Math.floor(dias / 7);

  const esCesarea = tipo === 'cesarea';
  let queEsperar = '', ejercicio = '', proximoHito = '';

  if (semanas < 1) {
    queEsperar = 'Loquios abundantes, contracciones uterinas, cansancio extremo, cambios hormonales intensos.';
    ejercicio = esCesarea ? 'Reposo. Solo levantarte para ir al baño con ayuda.' : 'Reposo. Podés caminar dentro de casa.';
    proximoHito = 'Semana 2: los loquios empiezan a disminuir.';
  } else if (semanas < 3) {
    queEsperar = 'Loquios disminuyendo, ' + (esCesarea ? 'incisión en proceso de cicatrización, dolor al moverse.' : 'periné mejorando, posible baby blues.');
    ejercicio = esCesarea ? 'Caminatas muy cortas dentro de casa.' : 'Caminatas suaves (15-20 min). Ejercicios de Kegel.';
    proximoHito = 'Semana 4: mejoría significativa del dolor y sangrado.';
  } else if (semanas < 6) {
    queEsperar = 'Loquios mínimos o terminando, energía mejorando, ' + (esCesarea ? 'cicatriz cerrándose.' : 'tejidos recuperándose.');
    ejercicio = esCesarea ? 'Caminatas de 20-30 min. No cargar peso.' : 'Caminatas, yoga suave, natación (si no hay sangrado).';
    proximoHito = 'Semana 6: control posparto con tu obstetra.';
  } else if (semanas < 8) {
    queEsperar = 'Control posparto. Evaluación de piso pélvico. ' + (esCesarea ? 'Evaluación de la cicatriz.' : 'Alta para retomar actividades.');
    ejercicio = esCesarea ? 'Ejercicio suave con alta médica. Evitar abdominales tradicionales.' : 'Ejercicio moderado con alta médica. Kegel + hipopresivos.';
    proximoHito = 'Semana 12: recuperación muscular avanzada.';
  } else if (semanas < 12) {
    queEsperar = 'Recuperación avanzada. Posible retorno de la menstruación si no amamantás.';
    ejercicio = 'Ejercicio moderado a intenso (con progresión). Hipopresivos para diástasis.';
    proximoHito = 'Mes 6: recuperación hormonal y de peso más avanzada.';
  } else {
    queEsperar = 'Recuperación a largo plazo. El cuerpo sigue ajustándose. Paciencia.';
    ejercicio = 'Actividad física normal. Atención al piso pélvico si hay incontinencia.';
    proximoHito = 'Mes 12: la mayoría de las mujeres se sienten "como antes" (o descubren su nueva normalidad).';
  }

  return {
    semanaPosparto: `Semana ${semanas} posparto (${dias} días desde el parto)`,
    queEsperar, ejercicio, proximoHito,
  };
}
