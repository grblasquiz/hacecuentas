/**
 * Embarazo semana a semana — datos de desarrollo fetal y síntomas maternos por semana de gestación.
 *
 * Cobertura: semanas 4 a 40 (edad gestacional contada desde la FUM).
 * - longitudCm / pesoG: valores promedio estándar de biometría fetal.
 *   Hasta la semana 19 la longitud es coronilla-rabadilla (CRL); desde la 20, cabeza-talón
 *   (por eso "salta" de ~15 cm a ~26 cm en la semana 20).
 * - fruta: comparación de tamaño de uso popular (estilo guías de embarazo).
 * - desarrollo / sintomas: hito principal de la semana, en una línea.
 *
 * Fuentes: ACOG (American College of Obstetricians and Gynecologists),
 * Mayo Clinic (Fetal development week-by-week), MedlinePlus, OMS.
 * Los valores son PROMEDIOS orientativos; cada embarazo varía. No reemplaza control médico.
 */

export interface SemanaEmbarazo {
  semana: number;
  longitudCm: number; // 0 = sub-centimétrico (se muestra en mm)
  pesoG: number;      // 0 = menos de 1 g
  fruta: string;
  frutaEn: string;
  desarrollo: string;
  desarrolloEn: string;
  sintomas: string;
  sintomasEn: string;
}

export const SEMANAS_EMBARAZO: Record<number, SemanaEmbarazo> = {
  4:  { semana: 4,  longitudCm: 0.1, pesoG: 0, fruta: 'una semilla de amapola', frutaEn: 'a poppy seed', desarrollo: 'Se implanta el embrión y se forma el saco gestacional; arranca el tubo neural.', desarrolloEn: 'The embryo implants and the gestational sac forms; the neural tube begins.', sintomas: 'Posible manchado de implantación y un test de embarazo positivo.', sintomasEn: 'Possible implantation spotting and a positive pregnancy test.' },
  5:  { semana: 5,  longitudCm: 0.2, pesoG: 0, fruta: 'una semilla de sésamo', frutaEn: 'a sesame seed', desarrollo: 'Empieza a latir el tubo cardíaco y se forman las capas del embrión.', desarrolloEn: 'The heart tube starts beating and the embryo’s layers form.', sintomas: 'Náuseas, pechos sensibles y cansancio por la suba de hormonas.', sintomasEn: 'Nausea, tender breasts and fatigue from rising hormones.' },
  6:  { semana: 6,  longitudCm: 0.5, pesoG: 0, fruta: 'una lenteja', frutaEn: 'a lentil', desarrollo: 'El corazón late (~110 lpm) y aparecen los brotes de brazos y piernas.', desarrolloEn: 'The heart beats (~110 bpm) and arm and leg buds appear.', sintomas: 'Náuseas matutinas y ganas frecuentes de orinar.', sintomasEn: 'Morning sickness and frequent urination.' },
  7:  { semana: 7,  longitudCm: 1.0, pesoG: 0, fruta: 'un arándano', frutaEn: 'a blueberry', desarrollo: 'Se forman manos y pies (aún con membranas) y crece rápido la cabeza.', desarrolloEn: 'Hands and feet form (still webbed) and the head grows fast.', sintomas: 'Náuseas, antojos o aversiones a ciertos alimentos.', sintomasEn: 'Nausea, food cravings or aversions.' },
  8:  { semana: 8,  longitudCm: 1.6, pesoG: 1, fruta: 'una frambuesa', frutaEn: 'a raspberry', desarrollo: 'Se definen los dedos y todos los órganos principales están en formación.', desarrolloEn: 'Fingers take shape and all major organs are forming.', sintomas: 'Náuseas, hinchazón y cambios de humor.', sintomasEn: 'Nausea, bloating and mood swings.' },
  9:  { semana: 9,  longitudCm: 2.3, pesoG: 2, fruta: 'una uva', frutaEn: 'a grape', desarrollo: 'Desaparece la "cola" embrionaria: ya se considera feto.', desarrolloEn: 'The embryonic tail is gone — it’s now a fetus.', sintomas: 'Pechos más grandes, más saliva y náuseas persistentes.', sintomasEn: 'Larger breasts, extra saliva and ongoing nausea.' },
  10: { semana: 10, longitudCm: 3.1, pesoG: 4, fruta: 'una aceituna', frutaEn: 'a kumquat', desarrollo: 'Aparecen uñas y vello fino; las articulaciones ya se mueven.', desarrolloEn: 'Nails and fine hair appear; joints can move.', sintomas: 'En algunas bajan las náuseas; la ropa empieza a apretar.', sintomasEn: 'Nausea may ease; clothes start to feel tight.' },
  11: { semana: 11, longitudCm: 4.1, pesoG: 7, fruta: 'un higo', frutaEn: 'a fig', desarrollo: 'Los dedos se separan y aparecen los brotes dentarios.', desarrolloEn: 'Fingers separate and tooth buds appear.', sintomas: 'Aumenta el apetito y suele bajar la fatiga.', sintomasEn: 'Appetite grows and fatigue often eases.' },
  12: { semana: 12, longitudCm: 5.4, pesoG: 14, fruta: 'una lima', frutaEn: 'a lime', desarrollo: 'Tiene reflejos y los riñones ya producen orina.', desarrolloEn: 'It has reflexes and the kidneys produce urine.', sintomas: 'Para muchas terminan las náuseas; el útero empieza a asomar.', sintomasEn: 'Nausea often ends; the uterus starts to rise.' },
  13: { semana: 13, longitudCm: 7.4, pesoG: 23, fruta: 'una vaina de arvejas', frutaEn: 'a pea pod', desarrollo: 'Se forman las huellas dactilares y las cuerdas vocales.', desarrolloEn: 'Fingerprints and vocal cords form.', sintomas: 'Más energía: arranca el segundo trimestre.', sintomasEn: 'More energy — the second trimester begins.' },
  14: { semana: 14, longitudCm: 8.7, pesoG: 43, fruta: 'un limón', frutaEn: 'a lemon', desarrollo: 'Puede hacer muecas y chuparse el dedo; aparece el lanugo.', desarrolloEn: 'It can make faces and suck its thumb; lanugo appears.', sintomas: 'Llega el "brillo del embarazo" y vuelve la libido.', sintomasEn: 'The "pregnancy glow" arrives and libido returns.' },
  15: { semana: 15, longitudCm: 10.1, pesoG: 70, fruta: 'una manzana', frutaEn: 'an apple', desarrollo: 'Percibe la luz a través de los párpados y se endurecen los huesos.', desarrolloEn: 'It senses light through the eyelids and bones harden.', sintomas: 'Congestión nasal y encías más sensibles.', sintomasEn: 'Nasal congestion and more sensitive gums.' },
  16: { semana: 16, longitudCm: 11.6, pesoG: 100, fruta: 'una palta', frutaEn: 'an avocado', desarrollo: 'Movimientos coordinados; los ojos ya se ubican al frente.', desarrolloEn: 'Coordinated movements; the eyes move to the front.', sintomas: 'Quizá sientas las primeras pataditas; baja la acidez.', sintomasEn: 'You may feel the first kicks; heartburn eases.' },
  17: { semana: 17, longitudCm: 13, pesoG: 140, fruta: 'una pera', frutaEn: 'a pear', desarrollo: 'Acumula grasa parda y el esqueleto pasa de cartílago a hueso.', desarrolloEn: 'It stores brown fat and the skeleton turns from cartilage to bone.', sintomas: 'Aumento de peso y de apetito.', sintomasEn: 'Weight and appetite increase.' },
  18: { semana: 18, longitudCm: 14.2, pesoG: 190, fruta: 'un pimiento', frutaEn: 'a bell pepper', desarrollo: 'Empieza a oír sonidos y se marcan las huellas de manos y pies.', desarrolloEn: 'It starts to hear sounds; hand and foot prints form.', sintomas: 'Dolores de espalda y algún mareo.', sintomasEn: 'Backaches and occasional dizziness.' },
  19: { semana: 19, longitudCm: 15.3, pesoG: 240, fruta: 'un mango', frutaEn: 'a mango', desarrollo: 'La vérnix caseosa cubre y protege la piel.', desarrolloEn: 'Vernix caseosa coats and protects the skin.', sintomas: 'Calambres en las piernas y piel estirada.', sintomasEn: 'Leg cramps and stretching skin.' },
  20: { semana: 20, longitudCm: 25.6, pesoG: 300, fruta: 'un plátano', frutaEn: 'a banana', desarrollo: 'Mitad del camino: la ecografía morfológica puede revelar el sexo.', desarrolloEn: 'Halfway there: the anatomy scan may reveal the sex.', sintomas: 'Ombligo saltón y el útero llega al ombligo.', sintomasEn: 'Belly button pops and the uterus reaches the navel.' },
  21: { semana: 21, longitudCm: 26.7, pesoG: 360, fruta: 'una zanahoria', frutaEn: 'a carrot', desarrollo: 'Aparecen cejas y párpados; los movimientos se sienten más fuerte.', desarrolloEn: 'Eyebrows and eyelids appear; movements feel stronger.', sintomas: 'Várices y más apetito.', sintomasEn: 'Varicose veins and a bigger appetite.' },
  22: { semana: 22, longitudCm: 27.8, pesoG: 430, fruta: 'una papaya chica', frutaEn: 'a small papaya', desarrollo: 'Se forman los labios y los dientes dentro de las encías.', desarrolloEn: 'Lips form and teeth develop inside the gums.', sintomas: 'Estrías e hinchazón leve.', sintomasEn: 'Stretch marks and mild swelling.' },
  23: { semana: 23, longitudCm: 28.9, pesoG: 501, fruta: 'un pomelo', frutaEn: 'a grapefruit', desarrollo: 'Empieza a oír tu voz y los pulmones desarrollan vasos sanguíneos.', desarrolloEn: 'It starts to hear your voice and the lungs grow blood vessels.', sintomas: 'Tobillos hinchados y alguna contracción de Braxton-Hicks.', sintomasEn: 'Swollen ankles and occasional Braxton-Hicks.' },
  24: { semana: 24, longitudCm: 30, pesoG: 600, fruta: 'un choclo', frutaEn: 'an ear of corn', desarrollo: 'Umbral de viabilidad: la cara está casi formada.', desarrolloEn: 'Viability threshold: the face is nearly formed.', sintomas: 'Se acerca el test de diabetes gestacional (O’Sullivan).', sintomasEn: 'The gestational diabetes test is coming up.' },
  25: { semana: 25, longitudCm: 34.6, pesoG: 660, fruta: 'un nabo', frutaEn: 'a rutabaga', desarrollo: 'Responde a tu voz y empieza a ganar grasa.', desarrolloEn: 'It responds to your voice and starts gaining fat.', sintomas: 'Hemorroides y dolor lumbar.', sintomasEn: 'Hemorrhoids and lower-back pain.' },
  26: { semana: 26, longitudCm: 35.6, pesoG: 760, fruta: 'una lechuga', frutaEn: 'a head of lettuce', desarrollo: 'Abre los ojos e "inhala" líquido amniótico para entrenar los pulmones.', desarrolloEn: 'It opens its eyes and "breathes" amniotic fluid to train the lungs.', sintomas: 'Controlá la presión arterial; posible preeclampsia.', sintomasEn: 'Watch your blood pressure; possible preeclampsia.' },
  27: { semana: 27, longitudCm: 36.6, pesoG: 875, fruta: 'una coliflor', frutaEn: 'a cauliflower', desarrollo: 'Tiene patrones de sueño e hipo frecuente.', desarrolloEn: 'It has sleep patterns and frequent hiccups.', sintomas: 'Falta de aire y calambres: arranca el tercer trimestre.', sintomasEn: 'Shortness of breath and cramps — the third trimester begins.' },
  28: { semana: 28, longitudCm: 37.6, pesoG: 1005, fruta: 'una berenjena', frutaEn: 'an eggplant', desarrollo: 'Sueña (fase REM) y le crecen las pestañas.', desarrolloEn: 'It dreams (REM sleep) and grows eyelashes.', sintomas: 'Toca la vacuna dTpa y controles más seguidos.', sintomasEn: 'Time for the Tdap vaccine and more frequent check-ups.' },
  29: { semana: 29, longitudCm: 38.6, pesoG: 1153, fruta: 'una calabaza', frutaEn: 'a butternut squash', desarrollo: 'Los huesos se endurecen y necesita más calcio y hierro.', desarrolloEn: 'Bones harden and it needs more calcium and iron.', sintomas: 'Acidez y micción frecuente.', sintomasEn: 'Heartburn and frequent urination.' },
  30: { semana: 30, longitudCm: 39.9, pesoG: 1319, fruta: 'un repollo', frutaEn: 'a cabbage', desarrollo: 'Empieza a regular su temperatura y desaparece el lanugo.', desarrolloEn: 'It starts regulating its temperature and the lanugo fades.', sintomas: 'Cansancio y vaivén emocional.', sintomasEn: 'Tiredness and mood swings.' },
  31: { semana: 31, longitudCm: 41.1, pesoG: 1502, fruta: 'un coco', frutaEn: 'a coconut', desarrollo: 'Madura el sistema nervioso y mueve la cabeza de lado a lado.', desarrolloEn: 'The nervous system matures and it turns its head.', sintomas: 'Contracciones de Braxton-Hicks más notorias.', sintomasEn: 'More noticeable Braxton-Hicks contractions.' },
  32: { semana: 32, longitudCm: 42.4, pesoG: 1702, fruta: 'una escarola', frutaEn: 'a jicama', desarrollo: 'Tiene uñas completas y practica los movimientos de respirar.', desarrolloEn: 'It has full nails and practices breathing movements.', sintomas: 'Falta de aire y dolor de espalda.', sintomasEn: 'Shortness of breath and back pain.' },
  33: { semana: 33, longitudCm: 43.7, pesoG: 1918, fruta: 'un ananá', frutaEn: 'a pineapple', desarrollo: 'Los huesos del cráneo siguen flexibles y las pupilas reaccionan a la luz.', desarrolloEn: 'The skull bones stay flexible and the pupils react to light.', sintomas: 'Torpeza e insomnio.', sintomasEn: 'Clumsiness and insomnia.' },
  34: { semana: 34, longitudCm: 45, pesoG: 2146, fruta: 'un melón', frutaEn: 'a cantaloupe', desarrollo: 'Madura el sistema nervioso central y las uñas llegan a la punta de los dedos.', desarrolloEn: 'The central nervous system matures and nails reach the fingertips.', sintomas: 'Fatiga e hinchazón.', sintomasEn: 'Fatigue and swelling.' },
  35: { semana: 35, longitudCm: 46.2, pesoG: 2383, fruta: 'un melón verde', frutaEn: 'a honeydew melon', desarrollo: 'Los riñones están listos y sube de peso rápidamente.', desarrolloEn: 'The kidneys are ready and it gains weight fast.', sintomas: 'Queda poco espacio para comer; más acidez.', sintomasEn: 'Little room to eat; more heartburn.' },
  36: { semana: 36, longitudCm: 47.4, pesoG: 2622, fruta: 'una lechuga romana', frutaEn: 'romaine lettuce', desarrollo: 'Suele encajarse cabeza abajo y pierde casi todo el lanugo.', desarrolloEn: 'It usually settles head-down and sheds most of the lanugo.', sintomas: 'Presión en la pelvis; toca el cultivo de estreptococo B.', sintomasEn: 'Pelvic pressure; time for the Group B Strep culture.' },
  37: { semana: 37, longitudCm: 48.6, pesoG: 2859, fruta: 'una acelga', frutaEn: 'a bunch of swiss chard', desarrollo: 'A término temprano: practica respirar y succionar.', desarrolloEn: 'Early term: it practices breathing and sucking.', sintomas: 'Contracciones de práctica más seguidas.', sintomasEn: 'More frequent practice contractions.' },
  38: { semana: 38, longitudCm: 49.8, pesoG: 3083, fruta: 'un puerro', frutaEn: 'a leek', desarrollo: 'Tiene un agarre firme y los órganos están listos.', desarrolloEn: 'It has a firm grip and the organs are ready.', sintomas: 'Hinchazón y ansiedad por el parto.', sintomasEn: 'Swelling and pre-labor anxiety.' },
  39: { semana: 39, longitudCm: 50.7, pesoG: 3288, fruta: 'una sandía chica', frutaEn: 'a small watermelon', desarrollo: 'A término: suma una capa de grasa para regular la temperatura.', desarrolloEn: 'Full term: it adds a fat layer to regulate temperature.', sintomas: 'Señales de parto: expulsión del tapón mucoso.', sintomasEn: 'Signs of labor: losing the mucus plug.' },
  40: { semana: 40, longitudCm: 51.2, pesoG: 3462, fruta: 'un zapallo chico', frutaEn: 'a small pumpkin', desarrollo: 'Fecha probable de parto: está listo para nacer.', desarrolloEn: 'Due date: it’s ready to be born.', sintomas: 'Contracciones reales y posible rotura de la bolsa.', sintomasEn: 'Real contractions and possible water breaking.' },
};

/** Devuelve los datos de la semana, acotando al rango 4–40. null si es <4. */
export function datosSemana(semana: number): SemanaEmbarazo | null {
  if (!Number.isFinite(semana) || semana < 4) return null;
  const s = Math.min(40, Math.max(4, Math.floor(semana)));
  return SEMANAS_EMBARAZO[s] || null;
}

/** Longitud formateada: mm si <1 cm, si no cm con separador local. */
export function fmtLongitud(cm: number, lang: string): string {
  if (cm <= 0) return lang === 'en' ? 'a few mm' : 'unos mm';
  if (cm < 1) return `${Math.round(cm * 10)} mm`;
  const n = lang === 'en' ? cm.toFixed(1) : cm.toFixed(1).replace('.', ',');
  return `${n} cm`;
}

/** Peso formateado: "<1 g" si 0, kg si ≥1000 g. */
export function fmtPeso(g: number, lang: string): string {
  if (g <= 0) return lang === 'en' ? 'less than 1 g' : 'menos de 1 g';
  if (g >= 1000) {
    const kg = (g / 1000);
    const n = lang === 'en' ? kg.toFixed(2) : kg.toFixed(2).replace('.', ',');
    return `${n} kg`;
  }
  return `${g} g`;
}

/** Cómo se mide la longitud según la semana (cambia en la semana 20). */
export function notaMedida(semana: number, lang: string): string {
  if (semana < 20) return lang === 'en' ? 'crown to rump' : 'de la coronilla a la rabadilla';
  return lang === 'en' ? 'head to heel' : 'de la cabeza a los pies';
}
