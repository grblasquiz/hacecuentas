/** CyberMonday Argentina (CACE): días faltantes y ahorro estimado por categoría */
const CATEGORIA_DESCUENTO: Record<string, [number, number]> = {
  electronica: [10, 25],
  hogar: [15, 30],
  ropa: [20, 40],
  viajes: [10, 20],
  deportes: [15, 35],
  belleza: [20, 40],
  juguetes: [15, 30],
};

const NOMBRES: Record<string, string> = {
  electronica: 'electrónica',
  hogar: 'hogar',
  ropa: 'ropa',
  viajes: 'viajes',
  deportes: 'deportes',
  belleza: 'belleza',
  juguetes: 'juguetes',
};

export interface Inputs {
  fechaCyberMonday: string;
  montoAspiracional: number;
  categoria: string;
}
export interface Outputs {
  diasFaltantes: string;
  ahorroEstimadoMin: number;
  ahorroEstimadoMax: number;
  rangoDescuento: string;
  recomendacion: string;
}

export function cyberMondayCountdownAhorroEstimado(i: Inputs): Outputs {
  const fechaStr = String(i.fechaCyberMonday || '2026-11-02');
  const monto = Number(i.montoAspiracional);
  const categoria = String(i.categoria || 'electronica');

  if (!monto || monto <= 0) throw new Error('Ingresá un monto aspiracional válido');

  const parts = fechaStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) throw new Error('Fecha inválida (YYYY-MM-DD)');
  const [yy, mm, dd] = parts;
  const target = new Date(yy, mm - 1, dd);
  if (isNaN(target.getTime())) throw new Error('Fecha inválida');

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - hoy.getTime()) / 86400000);

  const [descMin, descMax] = CATEGORIA_DESCUENTO[categoria] ?? [10, 25];
  const ahorroMin = monto * (descMin / 100);
  const ahorroMax = monto * (descMax / 100);
  const nombre = NOMBRES[categoria] ?? categoria;

  const fmt = (n: number) => Math.round(n).toLocaleString('es-AR');
  let diasTxt: string;
  let reco: string;
  if (diff > 0) {
    diasTxt = `${diff} días`;
    reco = `Faltan ${diff} días para el CyberMonday (${fechaStr}). En ${nombre} se espera un descuento real del ${descMin}–${descMax}%: ahorrarías entre $${fmt(ahorroMin)} y $${fmt(ahorroMax)} sobre $${fmt(monto)}. Anotá el precio actual para verificar después si el descuento es legítimo.`;
  } else if (diff === 0) {
    diasTxt = 'Hoy';
    reco = `Es hoy. Ahorro estimado en ${nombre}: entre $${fmt(ahorroMin)} y $${fmt(ahorroMax)} sobre $${fmt(monto)}. Compará con el precio que tenía antes del evento para no caer en descuentos inflados.`;
  } else {
    diasTxt = `Pasó hace ${Math.abs(diff)} días`;
    reco = `El CyberMonday ya pasó (${fechaStr}). La próxima oportunidad grande es Black Friday (noviembre internacional) o Hot Sale (mayo). Mientras tanto, podés esperar promos puntuales por banco/billetera.`;
  }

  return {
    diasFaltantes: diasTxt,
    ahorroEstimadoMin: Math.round(ahorroMin),
    ahorroEstimadoMax: Math.round(ahorroMax),
    rangoDescuento: `${descMin}–${descMax}%`,
    recomendacion: reco,
  };
}
