/** Elemento zodiacal por signo */
export interface Inputs { signo: string; }
export interface Outputs { elemento: string; signosDelElemento: string; compatibles: string; descripcion: string; }

const ELEM: Record<string,{elem:string;signos:string;compat:string;desc:string}> = {
  aries:{elem:'Fuego',signos:'Aries, Leo, Sagitario',compat:'Fuego y Aire',desc:'Energía pura, pasión, impulso. Sos directo/a, valiente y competitivo/a. Tu fuego interno te empuja a liderar y actuar.'},
  tauro:{elem:'Tierra',signos:'Tauro, Virgo, Capricornio',compat:'Tierra y Agua',desc:'Estabilidad, sensualidad, materialismo sano. Sos confiable, paciente y valorás lo tangible.'},
  geminis:{elem:'Aire',signos:'Géminis, Libra, Acuario',compat:'Aire y Fuego',desc:'Intelecto, comunicación, ideas. Sos curioso/a, versátil y siempre tenés algo interesante para decir.'},
  cancer:{elem:'Agua',signos:'Cáncer, Escorpio, Piscis',compat:'Agua y Tierra',desc:'Emociones, intuición, profundidad. Sos empático/a, protector/a y te conectás profundamente con los demás.'},
  leo:{elem:'Fuego',signos:'Aries, Leo, Sagitario',compat:'Fuego y Aire',desc:'Fuego fijo: brillo constante. Sos generoso/a, carismático/a y necesitás brillar.'},
  virgo:{elem:'Tierra',signos:'Tauro, Virgo, Capricornio',compat:'Tierra y Agua',desc:'Tierra mutable: adaptable y metódico/a. Sos analítico/a, servicial y buscás la perfección.'},
  libra:{elem:'Aire',signos:'Géminis, Libra, Acuario',compat:'Aire y Fuego',desc:'Aire cardinal: equilibrio e iniciativa social. Sos diplomático/a, estético/a y buscás la armonía.'},
  escorpio:{elem:'Agua',signos:'Cáncer, Escorpio, Piscis',compat:'Agua y Tierra',desc:'Agua fija: profundidad intensa. Sos apasionado/a, perceptivo/a y no te conformás con la superficie.'},
  sagitario:{elem:'Fuego',signos:'Aries, Leo, Sagitario',compat:'Fuego y Aire',desc:'Fuego mutable: llama aventurera. Sos optimista, filosófico/a y necesitás libertad.'},
  capricornio:{elem:'Tierra',signos:'Tauro, Virgo, Capricornio',compat:'Tierra y Agua',desc:'Tierra cardinal: ambición y estructura. Sos disciplinado/a, responsable y apuntás alto.'},
  acuario:{elem:'Aire',signos:'Géminis, Libra, Acuario',compat:'Aire y Fuego',desc:'Aire fijo: ideas revolucionarias. Sos original, independiente y pensás en el futuro.'},
  piscis:{elem:'Agua',signos:'Cáncer, Escorpio, Piscis',compat:'Agua y Tierra',desc:'Agua mutable: empatía universal. Sos intuitivo/a, artístico/a y te conectás con todo.'},
};

export function elementoZodiacal(i: Inputs): Outputs {
  const s = String(i.signo).toLowerCase();
  const data = ELEM[s];
  if (!data) throw new Error('Seleccioná un signo válido');
  return { elemento: data.elem, signosDelElemento: data.signos, compatibles: data.compat, descripcion: data.desc };
}
