export interface Inputs { [k: string]: number | string; __lang?: string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }
export function becaPromedioMinimoRequisitoUniversidades(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const v1=Number(i.v1)||0; const v2=Number(i.v2)||1;
  const r=v1/v2;
  const prom = r.toFixed(2);
  const resumen = __lang === 'en'
    ? `Your GPA is ${prom} (${v1} total grade points ÷ ${v2} courses completed).`
    : `Tu promedio es ${prom} (suma de notas ${v1} ÷ ${v2} materias).`;

  // Umbrales de referencia: escala 4.0 (EN) vs escala 1-10 argentina (ES)
  const enEscala4 = r <= 4.3;
  const refEn = enEscala4
    ? `On the 4.0 scale, many scholarships set the bar at **3.0**, and competitive merit awards usually ask for **3.5 or higher** — falling below the stated minimum disqualifies you regardless of other merits.`
    : `Check which scale your institution uses: most U.S. scholarships state their minimum on the 4.0 scale, so convert your average before comparing.`;
  const refEs = `Como referencia 2026: Beca Progresar pide **6,00**, Bicentenario **7,00** y las becas EVC-CIN **7,50**. Quedar abajo del mínimo te deja afuera sin importar el resto de la postulación.`;

  const insightText = __lang === 'en'
    ? `Your resulting average is **${prom}**. ${refEn} If you're close to a cutoff, one strong semester can still move the average before you apply.`
    : `Tu promedio resultante es **${prom}**. ${refEs} Si estás cerca del corte, un buen cuatrimestre todavía puede mover el promedio antes de postular.`;
  return {
    resultado:prom,
    resumen,
    _insight: {
      title: __lang === 'en' ? 'How to read your average' : 'Cómo leer tu promedio',
      text: insightText,
      tone: 'neutral',
      icon: '📊',
    },
  };
}
