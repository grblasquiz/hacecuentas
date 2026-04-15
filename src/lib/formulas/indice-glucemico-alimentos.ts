/** Índice glucémico y carga glucémica de una comida */
export interface Inputs {
  alimento: string;
  gramosCarbohidratos: number;
  igPersonalizado?: number;
}
export interface Outputs {
  indiceGlucemico: number;
  cargaGlucemica: number;
  categoriaIG: string;
  categoriaCG: string;
  impactoGlucemico: string;
  recomendacion: string;
  resumen: string;
}

// Tabla ampliada de IG (referencia: Universidad de Sydney / International Tables)
const IG_ALIMENTOS: Record<string, number> = {
  'arroz-blanco': 73,
  'arroz-integral': 68,
  'pan-blanco': 75,
  'pan-integral': 54,
  'pasta': 55,
  'papa-hervida': 78,
  'papa-frita': 63,
  'batata': 63,
  'quinoa': 53,
  'avena': 55,
  'cereales-azucarados': 80,
  'banana-madura': 62,
  'manzana': 36,
  'naranja': 43,
  'uva': 59,
  'sandia': 76,
  'leche': 39,
  'yogurt-natural': 41,
  'helado': 51,
  'azucar-blanca': 65,
  'miel': 61,
  'glucosa': 100,
  'fructosa': 19,
  'chocolate-negro': 40,
  'galletas-dulces': 70,
  'lentejas': 32,
  'garbanzos': 28,
  'porotos': 30,
  'zanahoria-cocida': 39,
  'brocoli': 15,
  'tomate': 15,
};

export function indiceGlucemicoAlimentos(i: Inputs): Outputs {
  const alimento = String(i.alimento || '').toLowerCase();
  const carbs = Number(i.gramosCarbohidratos);
  const igCustom = Number(i.igPersonalizado) || 0;

  if (!carbs || carbs < 0) throw new Error('Ingresá los gramos de carbohidratos');

  let ig = 0;
  if (igCustom > 0) {
    ig = igCustom;
  } else if (IG_ALIMENTOS[alimento]) {
    ig = IG_ALIMENTOS[alimento];
  } else {
    throw new Error(`Alimento "${alimento}" no está en la tabla. Ingresá IG personalizado.`);
  }

  if (ig < 0 || ig > 110) throw new Error('El IG debe estar entre 0 y 110');

  const cg = (ig * carbs) / 100;

  let categoriaIG = '';
  if (ig <= 55) categoriaIG = 'IG bajo ✅';
  else if (ig <= 69) categoriaIG = 'IG medio';
  else categoriaIG = 'IG alto';

  let categoriaCG = '';
  if (cg <= 10) categoriaCG = 'CG baja ✅';
  else if (cg <= 19) categoriaCG = 'CG media';
  else categoriaCG = 'CG alta';

  let impacto = '', recomendacion = '';
  if (cg <= 10) {
    impacto = 'Pico glucémico leve.';
    recomendacion = 'Excelente elección. Apto para personas con diabetes/prediabetes.';
  } else if (cg <= 19) {
    impacto = 'Pico glucémico moderado.';
    recomendacion = 'OK combinado con proteína/grasa para amortiguar subida.';
  } else {
    impacto = 'Pico glucémico elevado.';
    recomendacion = 'Cuidado si tenés diabetes o resistencia a la insulina. Combiná con fibra/proteína.';
  }

  return {
    indiceGlucemico: ig,
    cargaGlucemica: Number(cg.toFixed(1)),
    categoriaIG,
    categoriaCG,
    impactoGlucemico: impacto,
    recomendacion,
    resumen: `${alimento} tiene IG ${ig} (${categoriaIG}) y con ${carbs} g de carbos genera CG ${cg.toFixed(1)} (${categoriaCG}). ${impacto}`,
  };
}
