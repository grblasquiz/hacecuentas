/** Edad del perro en años humanos (fórmula científica logarítmica UCSD 2019) */
export interface Inputs {
  anos: number;
  tamano?: string;
}
export interface Outputs {
  edadHumanaLog: number;
  edadHumanaSimple: number;
  etapaVida: string;
  expectativa: number;
  _insight?: any;
  _chart?: any;
}

export function edadPerro(i: Inputs): Outputs {
  const a = Number(i.anos);
  const tamano = String(i.tamano || 'mediano');
  if (!a || a < 0) throw new Error('Ingresá la edad en años');

  // Fórmula UCSD 2019 (metilación del ADN): edad_humana = 16 × ln(edad_perro) + 31
  // Válida a partir del año 1
  let edadLog = 0;
  if (a < 1) edadLog = a * 15; // aproximación para cachorros
  else edadLog = 16 * Math.log(a) + 31;

  // Fórmula tradicional ajustada por tamaño (AAHA)
  let tradFactor = 5;
  if (tamano === 'pequeno') tradFactor = 4.5;
  else if (tamano === 'mediano') tradFactor = 5;
  else if (tamano === 'grande') tradFactor = 6;
  else if (tamano === 'gigante') tradFactor = 7;

  let edadSimple = 0;
  if (a <= 1) edadSimple = a * 15;
  else if (a <= 2) edadSimple = 15 + (a - 1) * 9;
  else edadSimple = 24 + (a - 2) * tradFactor;

  // Etapa
  let etapa = '';
  if (a < 0.5) etapa = 'Cachorro';
  else if (a < 1) etapa = 'Juvenil';
  else if (a < 3) etapa = 'Joven adulto';
  else if (a < 7) etapa = 'Adulto';
  else if (a < 10) etapa = 'Adulto senior';
  else etapa = 'Senior (geriátrico)';

  // Expectativa de vida por tamaño
  let expectativa = 12;
  if (tamano === 'pequeno') expectativa = 14;
  else if (tamano === 'mediano') expectativa = 12;
  else if (tamano === 'grande') expectativa = 10;
  else if (tamano === 'gigante') expectativa = 8;

  const edadLogR = Math.round(edadLog);
  const restante = Math.max(0, Math.round((expectativa - a) * 10) / 10);
  const toneStage: 'good' | 'warn' | 'neutral' =
    a >= expectativa ? 'warn' :
    (a >= 10 ? 'warn' :
    (a >= 7 ? 'neutral' : 'good'));
  const _insight = {
    title: 'La edad real de tu perro',
    text: `Con la fórmula científica (UCSD 2019), tu perro de **${a} ${a === 1 ? 'año' : 'años'}** equivale a **${edadLogR} años humanos** y está en etapa **${etapa.toLowerCase()}**. Para su tamaño, la expectativa media ronda los **${expectativa} años**${a >= expectativa ? ', que ya superó: cada año extra es un regalo, redoblá los controles veterinarios.' : `, así que le quedarían en promedio unos **${restante} años** por delante.`}`,
    tone: toneStage,
    icon: '🐶',
  };

  const _chart = {
    type: 'scale' as const,
    marker: a,
    markerLabel: etapa,
    min: 0,
    unit: '',
    segments: [
      { nombre: 'Cachorro', max: 1, color: '#bbf7d0', colorDark: '#166534' },
      { nombre: 'Joven adulto', max: 3, color: '#d9f99d', colorDark: '#3f6212' },
      { nombre: 'Adulto', max: 7, color: '#bfdbfe', colorDark: '#1e40af' },
      { nombre: 'Senior', max: 10, color: '#fed7aa', colorDark: '#9a3412' },
      { nombre: 'Geriátrico', max: Math.max(Math.ceil(expectativa) + 2, Math.ceil(a) + 1), color: '#fecaca', colorDark: '#b91c1c' },
    ],
    ariaLabel: `Escala de etapa de vida del perro: ${a} años reales (${etapa}), expectativa media ${expectativa} años.`,
  };

  return {
    edadHumanaLog: edadLogR,
    edadHumanaSimple: Math.round(edadSimple),
    etapaVida: etapa,
    expectativa,
    _insight,
    _chart,
  };
}
