/**
 * Función renal: clearance de creatinina (Cockcroft-Gault) y tasa de filtrado
 * glomerular estimada (CKD-EPI 2021), con estadificación KDIGO.
 *
 * Las dos ecuaciones NO son intercambiables y por eso se devuelven las dos:
 *
 *  - Cockcroft-Gault (1976) estima el CLEARANCE DE CREATININA en mL/min, sin
 *    normalizar por superficie corporal. Es la que históricamente usan los
 *    prospectos y las tablas de ajuste de dosis de fármacos, así que sigue
 *    siendo la referencia cuando la pregunta es "cómo ajusto esta dosis".
 *
 *  - CKD-EPI 2021 estima la TFG en mL/min/1,73 m² y es la que recomienda KDIGO
 *    para clasificar enfermedad renal crónica. La revisión de 2021 ELIMINÓ el
 *    coeficiente por raza que tenía la versión 2009: no se incluye acá, y no es
 *    un olvido — es la ecuación vigente.
 *
 * Cockcroft-Gault usa el peso, así que en obesidad o edema sobreestima. Por eso
 * se ofrece elegir peso real / ideal / ajustado, que es lo que hace farmacia
 * clínica, y se avisa cuando el IMC sugiere que el peso real no es el adecuado.
 *
 * Ambas ecuaciones asumen creatinina en ESTADO ESTABLE: en falla renal aguda,
 * con la creatinina subiendo o bajando, ninguna de las dos es válida. El
 * resultado lo dice explícitamente.
 */

export interface FuncionRenalInputs {
  creatinina: number | string;      // mg/dL
  edad: number | string;            // años
  sexo: 'hombre' | 'mujer' | string;
  peso: number | string;            // kg
  altura?: number | string;         // cm — sólo para peso ideal/ajustado e IMC
  pesoUsado?: 'real' | 'ideal' | 'ajustado' | string;
  __lang?: string;
}

export interface FuncionRenalOutputs {
  clearanceCockcroftGault: number;
  tfgCkdEpi: number;
  estadioKdigo: string;
  pesoAplicado: number;
  interpretacion: string;
  advertencia: string;
  _insight?: unknown;
}

/** Estadios KDIGO 2012 de TFG (G1–G5), en mL/min/1,73 m². */
function estadioKDIGO(tfg: number): { codigo: string; texto: string } {
  if (tfg >= 90) return { codigo: 'G1', texto: 'G1 — TFG normal o alta (≥90)' };
  if (tfg >= 60) return { codigo: 'G2', texto: 'G2 — descenso leve (60–89)' };
  if (tfg >= 45) return { codigo: 'G3a', texto: 'G3a — descenso leve a moderado (45–59)' };
  if (tfg >= 30) return { codigo: 'G3b', texto: 'G3b — descenso moderado a grave (30–44)' };
  if (tfg >= 15) return { codigo: 'G4', texto: 'G4 — descenso grave (15–29)' };
  return { codigo: 'G5', texto: 'G5 — fallo renal (<15)' };
}

/**
 * Peso ideal — fórmula de Devine (1974), la que usan las tablas de dosificación.
 * Requiere altura; si no hay altura devuelve 0 y el llamador cae a peso real.
 */
function pesoIdealDevine(alturaCm: number, esHombre: boolean): number {
  if (!alturaCm || alturaCm <= 0) return 0;
  const pulgadasSobre60 = Math.max(0, (alturaCm - 152.4) / 2.54);
  return (esHombre ? 50 : 45.5) + 2.3 * pulgadasSobre60;
}

export function clearanceCreatininaFiltradoGlomerular(
  inputs: FuncionRenalInputs,
): FuncionRenalOutputs {
  const creatinina = Number(inputs.creatinina);
  const edad = Number(inputs.edad);
  const pesoReal = Number(inputs.peso);
  const alturaCm = inputs.altura ? Number(inputs.altura) : 0;
  const esHombre = String(inputs.sexo) !== 'mujer';

  if (!creatinina || creatinina <= 0) {
    throw new Error('Ingresá la creatinina sérica en mg/dL (por ejemplo 0,9).');
  }
  if (!edad || edad < 18) {
    throw new Error(
      'Estas ecuaciones son sólo para adultos (18 años o más). En pediatría se usa Schwartz, que no está en esta calculadora.',
    );
  }
  if (!pesoReal || pesoReal <= 0) {
    throw new Error('Ingresá el peso en kg.');
  }

  // ── Peso a aplicar en Cockcroft-Gault ────────────────────────────────────
  const pesoIdeal = pesoIdealDevine(alturaCm, esHombre);
  const modo = String(inputs.pesoUsado || 'real');
  let pesoAplicado = pesoReal;
  if (modo === 'ideal' && pesoIdeal > 0) {
    pesoAplicado = pesoIdeal;
  } else if (modo === 'ajustado' && pesoIdeal > 0) {
    // Peso ajustado = ideal + 0,4 × (real − ideal). Estándar en farmacia clínica
    // para obesidad; si el real es menor que el ideal, se usa el real.
    pesoAplicado = pesoReal > pesoIdeal ? pesoIdeal + 0.4 * (pesoReal - pesoIdeal) : pesoReal;
  }

  // ── Cockcroft-Gault (mL/min) ─────────────────────────────────────────────
  // CrCl = [(140 − edad) × peso] / (72 × Scr), × 0,85 si es mujer.
  const cg = (((140 - edad) * pesoAplicado) / (72 * creatinina)) * (esHombre ? 1 : 0.85);

  // ── CKD-EPI 2021 (mL/min/1,73 m²), SIN coeficiente de raza ───────────────
  // TFG = 142 × min(Scr/κ,1)^α × max(Scr/κ,1)^−1,200 × 0,9938^edad × 1,012 si mujer
  const kappa = esHombre ? 0.9 : 0.7;
  const alpha = esHombre ? -0.302 : -0.241;
  const ratio = creatinina / kappa;
  const ckdEpi =
    142 *
    Math.pow(Math.min(ratio, 1), alpha) *
    Math.pow(Math.max(ratio, 1), -1.2) *
    Math.pow(0.9938, edad) *
    (esHombre ? 1 : 1.012);

  const estadio = estadioKDIGO(ckdEpi);

  // ── Interpretación y advertencias ────────────────────────────────────────
  const cgRedondeado = Number(cg.toFixed(1));
  const ckdRedondeado = Number(ckdEpi.toFixed(1));

  const avisos: string[] = [];

  // Discrepancia relevante entre ambas: pasa sobre todo en pesos extremos.
  const brecha = Math.abs(cgRedondeado - ckdRedondeado);
  if (brecha >= 15) {
    avisos.push(
      `Las dos ecuaciones difieren en ${brecha.toFixed(0)} unidades. No es un error: Cockcroft-Gault depende del peso y no se normaliza por superficie corporal, mientras que CKD-EPI sí. En pesos extremos la brecha se agranda.`,
    );
  }

  if (alturaCm > 0) {
    const alturaM = alturaCm / 100;
    const imc = pesoReal / (alturaM * alturaM);
    if (imc >= 30 && modo === 'real') {
      avisos.push(
        `Con un IMC de ${imc.toFixed(1)} el peso real sobreestima el clearance en Cockcroft-Gault. Para ajuste de dosis se suele usar el peso ajustado.`,
      );
    }
    if (imc < 18.5 && modo !== 'real') {
      avisos.push(
        `Con un IMC de ${imc.toFixed(1)} (bajo peso) corresponde usar el peso real, no el ideal ni el ajustado.`,
      );
    }
  } else if (modo !== 'real') {
    avisos.push('Sin altura no se puede estimar el peso ideal, así que se usó el peso real.');
  }

  if (edad >= 65 && creatinina < 0.7) {
    avisos.push(
      'En personas mayores con poca masa muscular, una creatinina baja puede hacer parecer normal una función renal que no lo es. La creatinina sola no alcanza como criterio.',
    );
  }

  avisos.push(
    'Ambas ecuaciones asumen creatinina en estado estable: si está subiendo o bajando (falla renal aguda), ninguna de las dos es válida.',
  );

  const interpretacion =
    `Clearance de creatinina (Cockcroft-Gault): ${cgRedondeado} mL/min. ` +
    `TFG estimada (CKD-EPI 2021): ${ckdRedondeado} mL/min/1,73 m² → ${estadio.texto}. ` +
    `Para ajustar dosis de fármacos la referencia habitual de los prospectos es Cockcroft-Gault; ` +
    `para clasificar enfermedad renal crónica, la TFG de CKD-EPI. ` +
    `El estadio KDIGO no se define con un solo resultado: requiere confirmación a los 3 meses y albuminuria.`;

  return {
    clearanceCockcroftGault: cgRedondeado,
    tfgCkdEpi: ckdRedondeado,
    estadioKdigo: estadio.texto,
    pesoAplicado: Number(pesoAplicado.toFixed(1)),
    interpretacion,
    advertencia: avisos.join(' '),
  };
}

export default clearanceCreatininaFiltradoGlomerular;
