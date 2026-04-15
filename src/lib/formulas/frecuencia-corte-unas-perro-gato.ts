/** Frecuencia de corte de uñas según especie, actividad, superficie y edad */
export interface Inputs {
  especie: string;
  actividad?: string;
  superficie?: string;
  edad?: string;
  tieneRascador?: boolean;
}
export interface Outputs {
  frecuenciaSemanas: string;
  herramienta: string;
  tecnica: string;
  alerta: string;
  detalle: string;
}

export function frecuenciaCorteUnasPerroGato(i: Inputs): Outputs {
  const especie = String(i.especie || 'perro');
  const actividad = String(i.actividad || 'moderado');
  const superficie = String(i.superficie || 'mixta');
  const edad = String(i.edad || 'adulto');
  const rascador = i.tieneRascador !== false;

  let semMin = 3;
  let semMax = 4;
  let herramienta = '';
  let tecnica = '';
  let alerta = '';

  if (especie === 'gato') {
    // Gatos
    if (edad === 'senior') {
      semMin = 2;
      semMax = 2;
    } else if (edad === 'cachorro') {
      semMin = 3;
      semMax = 4;
    } else {
      if (rascador && actividad === 'alto') {
        semMin = 3;
        semMax = 4;
      } else if (rascador) {
        semMin = 2;
        semMax = 3;
      } else {
        semMin = 2;
        semMax = 2;
      }
    }

    herramienta = 'Cortauñas tipo tijera mini o guillotina pequeña para gatos.';
    tecnica = 'Presioná suavemente la almohadilla para exponer la uña. Cortá solo la punta transparente (2 mm antes del quick rosado). No olvides el espolón (dedo interno).';
    alerta = 'Revisá especialmente el espolón (dedo interno): no se desgasta nunca y puede clavarse en la almohadilla si crece demasiado.';
  } else {
    // Perros
    // Base por actividad
    if (actividad === 'alto') {
      semMin = 4;
      semMax = 6;
    } else if (actividad === 'moderado') {
      semMin = 3;
      semMax = 4;
    } else {
      semMin = 2;
      semMax = 3;
    }

    // Ajuste por superficie
    if (superficie === 'asfalto') {
      semMin += 1;
      semMax += 2;
    } else if (superficie === 'blanda') {
      semMin = Math.max(2, semMin - 1);
      semMax = Math.max(2, semMax - 1);
    }

    // Ajuste por edad
    if (edad === 'senior') {
      semMin = Math.max(2, semMin - 1);
      semMax = Math.max(2, semMax - 1);
    } else if (edad === 'cachorro') {
      semMin = Math.min(semMin, 3);
      semMax = Math.min(semMax, 4);
    }

    herramienta = actividad === 'alto' || superficie === 'asfalto'
      ? 'Cortauñas tipo tenaza/tijera para perros (o dremel/lima eléctrica para uñas negras).'
      : 'Cortauñas tipo guillotina (perros chicos/medianos) o tenaza (grandes). Dremel opcional para uñas negras.';
    tecnica = 'Cortá solo la punta. Uñas claras: 2 mm antes del quick rosado. Uñas negras: cortá de a poco (1-2 mm) hasta ver un punto gris en el centro del corte. Tené polvo hemostático a mano.';
    alerta = 'Si las uñas hacen clic-clic en piso liso, ya están demasiado largas. Revisá siempre el espolón (dedo interno) que no se desgasta con el asfalto.';
  }

  const frecuenciaSemanas = semMin === semMax
    ? `Cada ${semMin} semanas`
    : `Cada ${semMin}-${semMax} semanas`;

  return {
    frecuenciaSemanas,
    herramienta,
    tecnica,
    alerta,
    detalle: `${especie === 'gato' ? 'Gato' : 'Perro'} (${edad}, actividad ${actividad}): cortá las uñas ${frecuenciaSemanas.toLowerCase()}. ${herramienta} ${alerta}`,
  };
}
