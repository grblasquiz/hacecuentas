/** Tabla china de predicción del sexo del bebé */
export interface Inputs { edadMadre: number; mesConcepciones: string; }
export interface Outputs { prediccion: string; edadLunar: string; precision: string; metodosCientificos: string; }

// Tabla china: F=femenino, M=masculino
// Filas: edad lunar 18-45, Columnas: mes 1-12
const tabla: Record<number, string[]> = {
  18: ['F','M','F','M','M','M','M','M','M','M','M','M'],
  19: ['M','F','M','F','F','M','M','F','M','M','F','F'],
  20: ['F','M','F','M','M','M','M','M','M','F','M','M'],
  21: ['M','F','F','F','F','F','F','F','F','F','F','F'],
  22: ['F','M','M','F','M','F','F','M','F','F','F','F'],
  23: ['M','M','F','M','M','F','M','F','M','M','M','F'],
  24: ['M','F','F','M','M','F','M','M','F','M','M','F'],
  25: ['F','M','F','M','F','M','F','M','M','M','M','M'],
  26: ['M','F','M','F','M','F','M','F','F','F','F','F'],
  27: ['F','F','M','M','F','M','F','F','M','F','M','M'],
  28: ['M','F','F','M','F','M','F','M','F','F','M','M'],
  29: ['F','M','F','F','M','F','F','M','F','M','F','F'],
  30: ['M','F','F','F','F','F','F','F','F','F','M','M'],
  31: ['M','F','M','F','F','F','F','F','F','F','F','M'],
  32: ['M','F','F','F','F','F','F','F','F','F','F','M'],
  33: ['F','M','F','M','F','F','F','M','F','F','F','M'],
  34: ['M','F','M','F','F','F','F','F','F','F','M','M'],
  35: ['M','M','F','M','F','F','F','M','F','F','M','M'],
  36: ['M','F','M','M','M','F','M','M','F','F','F','F'],
  37: ['F','F','M','F','F','F','M','F','F','M','M','M'],
  38: ['M','F','F','M','F','F','M','F','M','F','M','F'],
  39: ['F','F','M','F','F','F','M','F','M','M','F','F'],
  40: ['M','F','F','M','F','M','F','M','F','M','F','M'],
  41: ['F','F','M','F','M','M','F','M','F','M','F','M'],
  42: ['M','F','M','F','M','M','M','F','M','F','M','F'],
  43: ['F','M','F','F','M','M','M','F','F','F','M','M'],
  44: ['M','M','F','F','F','M','M','F','F','M','F','F'],
  45: ['F','M','F','M','F','F','M','F','M','F','M','M'],
};

export function sexoBebeTablaChina(i: Inputs): Outputs {
  const edad = Math.round(Number(i.edadMadre));
  const mes = Number(i.mesConcepciones);
  if (!edad || edad < 18 || edad > 45) throw new Error('Ingresá una edad entre 18 y 45');
  if (!mes || mes < 1 || mes > 12) throw new Error('Seleccioná un mes de concepción');

  // Edad lunar = edad + 1
  const edadLunar = edad + 1;
  const edadLunarClamped = Math.max(18, Math.min(45, edadLunar));

  const fila = tabla[edadLunarClamped];
  const resultado = fila[mes - 1];

  const prediccion = resultado === 'F'
    ? '🎀 NENA (femenino) según la tabla china'
    : '💙 NENE (masculino) según la tabla china';

  return {
    prediccion,
    edadLunar: `${edadLunar} años (edad occidental ${edad} + 1)`,
    precision: '~50% (igual que adivinar al azar). La tabla china NO tiene base científica.',
    metodosCientificos: 'Ecografía (sem. 16-20, precisión 95-99%) o test ADN fetal (sem. 9-10, precisión >99%).',
  };
}
