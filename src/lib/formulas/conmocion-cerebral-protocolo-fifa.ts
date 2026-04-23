/** Protocolo FIFA Concussion - retorno al juego en 6 pasos */
export interface Inputs {
  fechaConmocion: string;
  sintomasActuales: string;
  edad: number;
  antecedentes: string;
  fasePaso: string;
}
export interface Outputs {
  pasoActual: string;
  siguientesPasos: string;
  minimoDiasTotal: string;
  recomendacion: string;
  mensaje: string;
}

function parseFecha(s: string): number {
  const m = String(s || '').trim().replace('T', ' ');
  const [y, mo, d] = (m.split(/\s+/)[0] || '').split('-').map(Number);
  if (!y || !mo || !d) return NaN;
  return new Date(y, mo - 1, d).getTime();
}

export function conmocionCerebralProtocoloFifa(i: Inputs): Outputs {
  const sint = String(i.sintomasActuales || 'no');
  const edad = Number(i.edad) || 25;
  const antec = String(i.antecedentes || '0');
  const fase = String(i.fasePaso || 'paso-1');

  // FIFA Concussion Protocol / Berlin Consensus: 6 pasos, ≥24hs entre pasos, mínimo 6 días si asintomático.
  const pasos: Record<string, string> = {
    'paso-1': 'Paso 1: reposo físico y cognitivo hasta que los síntomas desaparezcan.',
    'paso-2': 'Paso 2: ejercicio aeróbico ligero (caminar, bicicleta estática suave <70% FC máx).',
    'paso-3': 'Paso 3: ejercicio específico de fútbol sin contacto, intensidad moderada.',
    'paso-4': 'Paso 4: entrenamiento sin contacto, ejercicios más complejos (pases, tiros).',
    'paso-5': 'Paso 5: entrenamiento completo con contacto (tras autorización médica).',
    'paso-6': 'Paso 6: retorno a competencia oficial.'
  };

  const pasoActualTxt = pasos[fase] || pasos['paso-1'];
  const nroPaso = parseInt(fase.replace('paso-', ''), 10) || 1;

  const fechaCon = parseFecha(String(i.fechaConmocion || ''));
  let diasDesde = 0;
  if (!isNaN(fechaCon)) {
    diasDesde = Math.floor((Date.now() - fechaCon) / (1000 * 60 * 60 * 24));
  }

  let minDiasTotal = 6;
  if (antec === '1') minDiasTotal = 10;
  else if (antec === '2') minDiasTotal = 14;
  else if (antec === '3+') minDiasTotal = 21;
  if (edad < 18) minDiasTotal = Math.max(minDiasTotal, 14); // poblaciones pediátricas protocolo más conservador

  const pasosRestantes = Math.max(0, 6 - nroPaso);
  const siguientes = pasosRestantes > 0
    ? `Faltan ${pasosRestantes} pasos (mínimo ${pasosRestantes} días más si todo va bien).`
    : 'Estás en el último paso: retorno a competencia.';

  let recomendacion = '';
  if (sint === 'si') {
    recomendacion = 'Síntomas presentes: volvé al Paso 1 (reposo). No avances hasta estar asintomático ≥24hs.';
  } else {
    recomendacion = `Asintomático: podés progresar al siguiente paso si pasaron ≥24hs sin síntomas. Mínimo total del protocolo: ${minDiasTotal} días desde la conmoción.`;
  }

  const msgFecha = fechaCon ? ` Transcurridos ${diasDesde} días desde la conmoción.` : '';

  return {
    pasoActual: pasoActualTxt,
    siguientesPasos: siguientes,
    minimoDiasTotal: `${minDiasTotal} días mínimo hasta retorno a competencia (protocolo FIFA / Consenso Ámsterdam 2022).`,
    recomendacion,
    mensaje: `${pasoActualTxt}${msgFecha} No reemplaza evaluación de médico (idealmente neurología deportiva).`
  };
}
