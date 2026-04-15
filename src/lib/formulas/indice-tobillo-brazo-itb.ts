/** Índice tobillo-brazo (ITB) para enfermedad arterial periférica (EAP) */
export interface Inputs {
  sistolicaBrazoDer: number;
  sistolicaBrazoIzq: number;
  sistolicaTobilloDer: number;
  sistolicaTobilloIzq: number;
}
export interface Outputs {
  itbDerecho: number;
  itbIzquierdo: number;
  itbPromedio: number;
  categoriaDerecho: string;
  categoriaIzquierdo: string;
  interpretacion: string;
  requiereEstudios: boolean;
  resumen: string;
}

function categoriaITB(itb: number): string {
  if (itb > 1.4) return 'No compresible (calcificación arterial)';
  if (itb > 1.0) return 'Normal alto';
  if (itb >= 0.9) return 'Normal ✅';
  if (itb >= 0.7) return 'EAP leve';
  if (itb >= 0.4) return 'EAP moderada';
  return 'EAP severa (isquemia crítica)';
}

export function indiceTobilloBrazoItb(i: Inputs): Outputs {
  const bd = Number(i.sistolicaBrazoDer);
  const bi = Number(i.sistolicaBrazoIzq);
  const td = Number(i.sistolicaTobilloDer);
  const ti = Number(i.sistolicaTobilloIzq);

  if (!bd || !bi || !td || !ti) throw new Error('Ingresá las cuatro presiones sistólicas');
  if (bd < 50 || bi < 50 || td < 50 || ti < 50) throw new Error('Los valores parecen muy bajos; revisá unidades (mmHg)');
  if (bd > 260 || bi > 260 || td > 300 || ti > 300) throw new Error('Los valores parecen demasiado altos');

  // Se usa la MAYOR de las dos presiones braquiales como denominador
  const brazoMayor = Math.max(bd, bi);

  const itbDer = td / brazoMayor;
  const itbIzq = ti / brazoMayor;
  const itbPromedio = (itbDer + itbIzq) / 2;

  const catDer = categoriaITB(itbDer);
  const catIzq = categoriaITB(itbIzq);

  const itbMenor = Math.min(itbDer, itbIzq);
  let interpretacion = '';
  let requiereEstudios = false;

  if (itbMenor >= 0.9 && itbMenor <= 1.4) {
    interpretacion = 'ITB normal en ambas piernas. Sin evidencia de EAP.';
  } else if (itbMenor >= 0.7) {
    interpretacion = 'Sugerencia de EAP leve. Considerá control cardiovascular y factores de riesgo (tabaquismo, diabetes).';
    requiereEstudios = true;
  } else if (itbMenor >= 0.4) {
    interpretacion = 'EAP moderada. Consultá con vascular periférico; puede haber claudicación intermitente.';
    requiereEstudios = true;
  } else if (itbMenor < 0.4) {
    interpretacion = 'EAP severa / isquemia crítica. Derivación urgente a cirugía vascular.';
    requiereEstudios = true;
  } else {
    interpretacion = 'ITB > 1.4: arterias no compresibles (frecuente en diabetes o ERC). Requiere ecodoppler.';
    requiereEstudios = true;
  }

  return {
    itbDerecho: Number(itbDer.toFixed(2)),
    itbIzquierdo: Number(itbIzq.toFixed(2)),
    itbPromedio: Number(itbPromedio.toFixed(2)),
    categoriaDerecho: catDer,
    categoriaIzquierdo: catIzq,
    interpretacion,
    requiereEstudios,
    resumen: `ITB derecho ${itbDer.toFixed(2)} (${catDer}), izquierdo ${itbIzq.toFixed(2)} (${catIzq}). ${interpretacion}`,
  };
}
