export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Recomendaciones basadas en AAHA 2019 Canine Life Stage Guidelines y WSAVA
// v1 = especie: "1" = perra, "2" = gata
// v2 = tamaño (solo aplica para perras): "1"=pequeña(<10kg), "2"=mediana(10-25kg), "3"=grande(25-45kg), "4"=gigante(>45kg)

export function castracionPerraGataEdadIdeal(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const especie = String(i.v1 || '1');
  const tamano = String(i.v2 || '1');

  type InfoResult = {
    edadIdeal: string;
    edadMin: string;
    edadMax: string;
    riesgoMama: string;
    nota: string;
    edadIdeal_en: string;
    edadMin_en: string;
    edadMax_en: string;
    riesgoMama_en: string;
    nota_en: string;
  };

  let info: InfoResult;

  if (especie === '2') {
    // Gata
    info = {
      edadIdeal: '4–5 meses',
      edadMin: '4 meses',
      edadMax: '6 meses',
      riesgoMama: '7× menor riesgo de tumor mamario si se castra antes de los 6 meses',
      nota: 'AAHA recomienda castrar gatas antes de los 5 meses ("Fix Felines by Five"). A los 4 meses ya pueden entrar en celo, por eso no se debe esperar.',
      edadIdeal_en: '4–5 months',
      edadMin_en: '4 months',
      edadMax_en: '6 months',
      riesgoMama_en: '7× lower mammary tumor risk if spayed before 6 months',
      nota_en: 'AAHA recommends spaying cats by 5 months ("Fix Felines by Five"). Queens can enter first heat as early as 4 months.',
    };
  } else {
    // Perra según tamaño
    switch (tamano) {
      case '1': // pequeña < 10 kg
        info = {
          edadIdeal: '5–6 meses',
          edadMin: '5 meses',
          edadMax: '6 meses',
          riesgoMama: 'Hasta 200× menor riesgo de tumor mamario si se castra antes del primer celo',
          nota: 'Razas pequeñas (<10 kg): castrar antes del primer celo reduce drásticamente el riesgo de tumores mamarios. El primer celo ocurre entre los 5–8 meses. (AAHA 2019)',
          edadIdeal_en: '5–6 months',
          edadMin_en: '5 months',
          edadMax_en: '6 months',
          riesgoMama_en: 'Up to 200× lower mammary tumor risk if spayed before first heat',
          nota_en: 'Small breeds (<10 kg): spay before first heat significantly reduces mammary tumor risk. First heat occurs between 5–8 months. (AAHA 2019)',
        };
        break;
      case '2': // mediana 10–25 kg
        info = {
          edadIdeal: '6–9 meses',
          edadMin: '6 meses',
          edadMax: '9 meses',
          riesgoMama: 'Riesgo de tumor mamario significativamente menor si se castra antes del primer celo',
          nota: 'Razas medianas (10–25 kg): idealmente antes del primer celo o justo después. Las placas de crecimiento cierran alrededor de los 8–10 meses. (AAHA 2019)',
          edadIdeal_en: '6–9 months',
          edadMin_en: '6 months',
          edadMax_en: '9 months',
          riesgoMama_en: 'Significantly lower mammary tumor risk if spayed before first heat',
          nota_en: 'Medium breeds (10–25 kg): ideally before first heat or shortly after. Growth plates close around 8–10 months. (AAHA 2019)',
        };
        break;
      case '3': // grande 25–45 kg
        info = {
          edadIdeal: '9–12 meses',
          edadMin: '9 meses',
          edadMax: '15 meses',
          riesgoMama: 'Riesgo moderado de osteosarcoma e incontinencia urinaria si se castra muy temprano',
          nota: 'Razas grandes (25–45 kg): esperar al cierre de las placas de crecimiento (~12 meses) reduce el riesgo ortopédico. La AAHA recomienda una ventana de 9–15 meses. (AAHA 2019)',
          edadIdeal_en: '9–12 months',
          edadMin_en: '9 months',
          edadMax_en: '15 months',
          riesgoMama_en: 'Moderate risk of osteosarcoma and urinary incontinence if spayed too early',
          nota_en: 'Large breeds (25–45 kg): wait for growth plate closure (~12 months) to reduce orthopedic risk. AAHA recommends a 9–15 month window. (AAHA 2019)',
        };
        break;
      case '4': // gigante > 45 kg
        info = {
          edadIdeal: '12–18 meses',
          edadMin: '12 meses',
          edadMax: '24 meses',
          riesgoMama: 'Mayor riesgo de osteosarcoma, displasia de cadera e incontinencia si se castra antes de los 12 meses',
          nota: 'Razas gigantes (>45 kg, ej. Gran Danés, Rottweiler, San Bernardo): las placas de crecimiento cierran entre los 18–24 meses. Consultar con veterinario para definir el momento óptimo según historia clínica. (AAHA 2019 + estudios Hart 2016)',
          edadIdeal_en: '12–18 months',
          edadMin_en: '12 months',
          edadMax_en: '24 months',
          riesgoMama_en: 'Higher risk of osteosarcoma, hip dysplasia and incontinence if spayed before 12 months',
          nota_en: 'Giant breeds (>45 kg, e.g. Great Dane, Rottweiler, St. Bernard): growth plates close between 18–24 months. Consult your vet to define the optimal timing based on clinical history. (AAHA 2019 + Hart 2016 studies)',
        };
        break;
      default:
        info = {
          edadIdeal: '5–6 meses',
          edadMin: '5 meses',
          edadMax: '6 meses',
          riesgoMama: 'Hasta 200× menor riesgo de tumor mamario si se castra antes del primer celo',
          nota: 'Razas pequeñas (<10 kg): castrar antes del primer celo. (AAHA 2019)',
          edadIdeal_en: '5–6 months',
          edadMin_en: '5 months',
          edadMax_en: '6 months',
          riesgoMama_en: 'Up to 200× lower mammary tumor risk if spayed before first heat',
          nota_en: 'Small breeds (<10 kg): spay before first heat. (AAHA 2019)',
        };
    }
  }

  const resultado = __lang === 'en' ? info.edadIdeal_en : info.edadIdeal;
  const resumen = __lang === 'en'
    ? `Recommended age window: ${info.edadMin_en} – ${info.edadMax_en}. ${info.riesgoMama_en}. ${info.nota_en}`
    : `Ventana recomendada: ${info.edadMin} – ${info.edadMax}. ${info.riesgoMama}. ${info.nota}`;

  const insight = __lang === 'en'
    ? {
        title: 'Optimal spay age',
        text: `**Ideal: ${info.edadIdeal_en}** (window: ${info.edadMin_en}–${info.edadMax_en}). ${info.riesgoMama_en}. ${info.nota_en}`,
        tone: 'positive',
        icon: '✂️',
      }
    : {
        title: 'Edad ideal de castración',
        text: `**Ideal: ${info.edadIdeal}** (ventana: ${info.edadMin}–${info.edadMax}). ${info.riesgoMama}. ${info.nota}`,
        tone: 'positive',
        icon: '✂️',
      };

  return { resultado, resumen, _insight: insight };
}
