export interface Inputs { [k: string]: number | string; }
export interface Outputs { diametro: string; canoComercial: string; resumen: string; _insight?: any; }
export function canoAguaDiametroCaudal(i: Inputs): Outputs {
  const Q_ls = Number(i.Q) || 0;
  const Qm3s = Q_ls / 1000;
  const V = 1.5;
  const A = Qm3s / V;
  const d = Math.sqrt(4 * A / Math.PI) * 1000;
  const comerciales = [13, 20, 25, 32, 40, 50, 63, 75, 90, 110];
  const next = comerciales.find(x => x >= d) || d;

  const dMm = Math.round(d);
  const fueraCatalogo = !comerciales.some(x => x >= d) && d > 0;
  let textoInsight: string;
  let toneInsight: string;
  if (Q_ls <= 0) {
    textoInsight = 'Ingresá el caudal en litros por segundo para dimensionar el caño. El cálculo asume una **velocidad de 1,5 m/s**, el valor recomendado para evitar ruido y golpe de ariete en instalaciones domiciliarias.';
    toneInsight = 'neutral';
  } else if (fueraCatalogo) {
    textoInsight = `Para **${Q_ls} l/s** a 1,5 m/s necesitás un diámetro interno de **${dMm} mm**, que supera el caño comercial más grande del listado (**110 mm**). Vas a tener que ir a un diámetro mayor o dividir el caudal en dos ramales.`;
    toneInsight = 'warn';
  } else {
    textoInsight = `Para mover **${Q_ls} l/s** a **1,5 m/s** hace falta un diámetro interno de **${dMm} mm**, así que el caño comercial inmediato que lo cubre es el de **${next} mm**. Elegir el siguiente tamaño baja la velocidad real y reduce las pérdidas de carga.`;
    toneInsight = 'good';
  }

  const _insight = {
    title: 'Qué caño elegir',
    text: textoInsight,
    tone: toneInsight,
    icon: '🚰'
  };

  return { diametro: d.toFixed(0) + ' mm', canoComercial: next + ' mm',
    resumen: `Ø ${d.toFixed(0)} mm necesario (V=1.5 m/s). Comercial: ${next} mm.`,
    _insight };
}
