/**
 * Bono Cultural Joven 2026 (España) — elegibilidad, importe (400 €) y cuenta atrás del plazo.
 * Tienen derecho quienes cumplen 18 años en 2026 (nacidos en 2008). Plazo: 22-jun a 31-oct-2026.
 * Simula además el reparto/saldo de los 400 € según lo que prevés gastar.
 * Datos en src/lib/data/espana-2026.ts. Euros (es-ES).
 */
import { BONO_CULTURAL_2026 as B } from '../data/espana-2026.ts';

const fmtEur = (n: number): string =>
  new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(Math.round(n * 100) / 100) + ' €';

export interface Inputs {
  anioNacimiento: number | string;
  gastoPrevisto?: number | string; // lo que ya has gastado o prevés gastar
}

export interface Outputs { [k: string]: any; detalle: string; _insight?: any; _chart?: any; }

export function compute(i: Inputs): Outputs {
  const anio = Math.round(Number(i.anioNacimiento) || 0);
  const gasto = Number(i.gastoPrevisto) || 0;
  if (anio < 1990 || anio > 2026) throw new Error('Introduce tu año de nacimiento (por ejemplo, 2008)');

  const elegible = anio === B.anioNacimientoElegible;
  const importe = B.importe;

  const saldo = Math.max(importe - gasto, 0);
  const excede = gasto > importe;

  // Cuenta atrás hasta el fin de plazo (31-oct-2026)
  const fin = new Date(B.plazoFin + 'T23:59:59');
  const hoy = new Date();
  const msDia = 1000 * 60 * 60 * 24;
  const dias = Math.ceil((fin.getTime() - hoy.getTime()) / msDia);
  const plazoAbierto = dias >= 0;

  let estado: string;
  if (!elegible) {
    estado = anio < B.anioNacimientoElegible
      ? `No elegible en 2026: naciste en ${anio}. El bono es para quienes cumplen 18 este año (nacidos en 2008).`
      : `Aún no elegible: naciste en ${anio}. Podrás pedirlo el año en que cumplas 18.`;
  } else if (!plazoAbierto) {
    estado = 'Elegible por edad, pero el plazo de 2026 (hasta el 31 de octubre) ya ha finalizado.';
  } else {
    estado = `Elegible: tienes derecho a los ${fmtEur(importe)}. Quedan ${dias} días para solicitarlo (hasta el 31 de octubre de 2026).`;
  }

  const _insight = {
    title: 'Tu Bono Cultural Joven 2026',
    text: elegible
      ? `Naciste en 2008, así que **cumples 18 en 2026 y tienes derecho a los ${fmtEur(importe)}**. ${plazoAbierto ? `El plazo está abierto (quedan **${dias} días**, hasta el 31 de octubre).` : 'Pero el plazo de 2026 ya ha terminado.'} ${gasto > 0 ? `Si gastas ${fmtEur(gasto)}, te quedan **${fmtEur(saldo)}** de bono.` : 'Puedes repartir los 400 € entre artes en vivo, audiovisuales, patrimonio, productos físicos, cursos e instrumentos musicales.'}`
      : `El Bono Cultural Joven 2026 es solo para quienes **cumplen 18 años en 2026 (nacidos en 2008)**. ${estado}`,
    tone: elegible && plazoAbierto ? 'good' : 'warn',
    icon: '🎭',
  };

  const _chart = elegible ? {
    type: 'bar',
    segments: [
      { label: 'Gastado/previsto', value: Math.round(Math.min(gasto, importe) * 100) / 100 },
      { label: 'Saldo del bono', value: Math.round(saldo * 100) / 100 },
    ],
    ariaLabel: `De ${fmtEur(importe)}, ${fmtEur(Math.min(gasto, importe))} gastado y ${fmtEur(saldo)} de saldo.`,
  } : undefined;

  return {
    elegibilidad: elegible ? 'Sí, tienes derecho' : 'No elegible en 2026',
    importeBono: elegible ? fmtEur(importe) : '—',
    saldoRestante: elegible ? fmtEur(saldo) : '—',
    diasParaSolicitar: elegible && plazoAbierto ? `${dias} días` : (elegible ? 'Plazo cerrado' : '—'),
    estado,
    detalle: `Año de nacimiento ${anio} → ${elegible ? `elegible (400 €). ${gasto > 0 ? `Gasto ${fmtEur(gasto)} → saldo ${fmtEur(saldo)}${excede ? ' (excede el bono)' : ''}.` : ''}` : 'no elegible en 2026 (el bono es para nacidos en 2008).'}`,
    _insight,
    _chart,
  };
}
