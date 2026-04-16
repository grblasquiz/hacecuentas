/** Tamaño del bebé por semana de embarazo */
export interface Inputs {
  semanaGestacion: number;
}
export interface Outputs {
  fruta: string;
  longitud: string;
  peso: string;
  desarrollo: string;
}

// Datos basados en OMS / INTERGROWTH-21st
const datos: Record<number, { fruta: string; longitud: string; peso: string; desarrollo: string }> = {
  4: { fruta: '🌱 Semilla de amapola', longitud: '1 mm', peso: '–', desarrollo: 'Se implanta el blastocisto en el útero.' },
  5: { fruta: '🌱 Semilla de sésamo', longitud: '2 mm', peso: '–', desarrollo: 'Se forma el tubo neural (futuro cerebro y médula).' },
  6: { fruta: '🫘 Lenteja', longitud: '5 mm', peso: '–', desarrollo: 'Empieza a latir el corazón.' },
  7: { fruta: '🫐 Arándano', longitud: '1 cm', peso: '–', desarrollo: 'Se forman los brotes de brazos y piernas.' },
  8: { fruta: '🫐 Frambuesa', longitud: '1,6 cm', peso: '1 g', desarrollo: 'Se forman los dedos. Movimientos reflejos.' },
  9: { fruta: '🍒 Cereza', longitud: '2,3 cm', peso: '2 g', desarrollo: 'Se forman los párpados y orejas. Todos los órganos presentes.' },
  10: { fruta: '🍓 Frutilla', longitud: '3 cm', peso: '4 g', desarrollo: 'Fin del período embrionario, empieza período fetal.' },
  11: { fruta: '🫐 Higo', longitud: '4 cm', peso: '7 g', desarrollo: 'Se forman las uñas. El bebé empieza a tragar líquido amniótico.' },
  12: { fruta: '🍋 Lima', longitud: '5,4 cm', peso: '14 g', desarrollo: 'Se pueden ver los genitales. Reflejos de succión.' },
  13: { fruta: '🍋 Limón', longitud: '7,4 cm', peso: '23 g', desarrollo: 'Se forman las huellas dactilares. Cuerdas vocales se desarrollan.' },
  14: { fruta: '🍑 Durazno', longitud: '8,7 cm', peso: '43 g', desarrollo: 'Puede fruncir el ceño y entrecerrar los ojos.' },
  15: { fruta: '🍎 Manzana', longitud: '10 cm', peso: '70 g', desarrollo: 'Se forma lanugo (vello fino). Esqueleto se osifica.' },
  16: { fruta: '🥑 Palta', longitud: '11,6 cm', peso: '100 g', desarrollo: 'Primeros movimientos perceptibles (primigestas a veces lo sienten).' },
  17: { fruta: '🍐 Pera', longitud: '13 cm', peso: '140 g', desarrollo: 'Se forma la vérnix (capa protectora de la piel).' },
  18: { fruta: '🍠 Batata', longitud: '14 cm', peso: '190 g', desarrollo: 'Oídos funcionales — puede escuchar sonidos.' },
  19: { fruta: '🥭 Mango', longitud: '15 cm', peso: '240 g', desarrollo: 'Se forman los sentidos: gusto, olfato, tacto, vista y oído.' },
  20: { fruta: '🍌 Banana', longitud: '25 cm', peso: '300 g', desarrollo: 'Mitad del embarazo. Movimientos claros. Ecografía morfológica.' },
  21: { fruta: '🥕 Zanahoria', longitud: '27 cm', peso: '360 g', desarrollo: 'El bebé tiene cejas. Traga líquido amniótico regularmente.' },
  22: { fruta: '🫒 Papaya', longitud: '28 cm', peso: '430 g', desarrollo: 'Labios y párpados más definidos. Ciclos de sueño/vigilia.' },
  23: { fruta: '🍆 Berenjena chica', longitud: '29 cm', peso: '500 g', desarrollo: 'Pulmones producen surfactante. Piel arrugada y roja.' },
  24: { fruta: '🌽 Choclo', longitud: '30 cm', peso: '600 g', desarrollo: 'Viabilidad extrauterina con cuidados intensivos neonatales.' },
  25: { fruta: '🥦 Brócoli', longitud: '34 cm', peso: '660 g', desarrollo: 'Responde a la voz. Patrón de sueño más regular.' },
  26: { fruta: '🥬 Lechuga', longitud: '36 cm', peso: '760 g', desarrollo: 'Abre los ojos. Pulmones siguen madurando.' },
  27: { fruta: '🥒 Pepino', longitud: '37 cm', peso: '875 g', desarrollo: 'Cerebro muy activo. Puede tener hipo.' },
  28: { fruta: '🍆 Berenjena', longitud: '38 cm', peso: '1 kg', desarrollo: 'Tercer trimestre. Puede soñar (fase REM detectada).' },
  29: { fruta: '🎃 Zapallo chico', longitud: '39 cm', peso: '1,15 kg', desarrollo: 'Huesos se endurecen (excepto cráneo). Acumula grasa.' },
  30: { fruta: '🥬 Repollo', longitud: '40 cm', peso: '1,3 kg', desarrollo: 'Médula ósea produce glóbulos rojos. Pelo crece.' },
  31: { fruta: '🥥 Coco', longitud: '41 cm', peso: '1,5 kg', desarrollo: 'Los 5 sentidos funcionan. Gira hacia la luz.' },
  32: { fruta: '🎃 Zapallo', longitud: '42 cm', peso: '1,7 kg', desarrollo: 'Uñas completas. Pulmones casi maduros.' },
  33: { fruta: '🍍 Ananá', longitud: '44 cm', peso: '1,9 kg', desarrollo: 'Cráneo flexible para el parto. Inmunoglobulinas de la madre.' },
  34: { fruta: '🍈 Melón', longitud: '45 cm', peso: '2,1 kg', desarrollo: 'Sistema nervioso central maduro. Vérnix se acumula.' },
  35: { fruta: '🍈 Melón honeydew', longitud: '46 cm', peso: '2,4 kg', desarrollo: 'Riñones maduros. Hígado procesa desechos.' },
  36: { fruta: '🥬 Lechuga romana', longitud: '47 cm', peso: '2,6 kg', desarrollo: 'Pulmones maduros. Se considera pretérmino tardío.' },
  37: { fruta: '🥬 Acelga', longitud: '48 cm', peso: '2,8 kg', desarrollo: 'A término temprano. El bebé puede nacer sin riesgos.' },
  38: { fruta: '🥒 Puerro', longitud: '49 cm', peso: '3 kg', desarrollo: 'Órganos maduros. Encajamiento en la pelvis.' },
  39: { fruta: '🍉 Sandía mini', longitud: '50 cm', peso: '3,2 kg', desarrollo: 'A término completo. Listo para nacer.' },
  40: { fruta: '🍉 Sandía', longitud: '51 cm', peso: '3,4 kg', desarrollo: 'Fecha probable de parto. Peso y talla promedio al nacer.' },
  41: { fruta: '🍉 Sandía grande', longitud: '51 cm', peso: '3,6 kg', desarrollo: 'A término tardío. Se monitorea bienestar fetal.' },
  42: { fruta: '🍉 Sandía XL', longitud: '52 cm', peso: '3,7 kg', desarrollo: 'Postérmino. Se evalúa inducción del parto.' },
};

export function tamanoBebeSemana(i: Inputs): Outputs {
  const semana = Math.round(Number(i.semanaGestacion));
  if (!semana || semana < 4 || semana > 42) throw new Error('Ingresá una semana entre 4 y 42');

  const d = datos[semana];
  if (!d) {
    // Interpolar para semanas sin datos exactos (ej: 15)
    const keys = Object.keys(datos).map(Number).sort((a, b) => a - b);
    let lower = keys[0], upper = keys[keys.length - 1];
    for (const k of keys) {
      if (k <= semana) lower = k;
      if (k >= semana && upper >= semana) { upper = k; break; }
    }
    return datos[lower] || datos[upper];
  }

  return {
    fruta: d.fruta,
    longitud: d.longitud,
    peso: d.peso,
    desarrollo: d.desarrollo,
  };
}
