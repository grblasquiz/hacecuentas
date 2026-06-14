export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: any; }
// ANSES — Prestación por Desempleo (Ley 24.013, modif. Decreto 267/2006).
// Cuantía: 75% del promedio de las mejores remuneraciones netas de los últimos 6 meses,
// acotada entre un piso y un techo que ANSES actualiza por movilidad.
// Valores liquidados junio 2026: piso $181.500 / techo $363.000.
// (Topes vigentes a 06-2026; ANSES los ajusta periódicamente — revisar trimestralmente.)
const PCT_PRESTACION = 0.75;          // 75% del promedio (Decreto 267/2006)
const PISO_DESEMPLEO = 181500;        // piso liquidado jun-2026
const TECHO_DESEMPLEO = 363000;       // techo liquidado jun-2026
export function asignacionDesempleoSeguroPrestacionAnses(i: Inputs): Outputs {
  const s=Number(i.ultimoSueldoBruto)||0; const m=Number(i.mesesCotizados)||0;
  const base=s*PCT_PRESTACION;
  const monto = s>0 ? Math.min(Math.max(base, PISO_DESEMPLEO), TECHO_DESEMPLEO) : 0;
  let meses=0;
  if (m>=36) meses=12; else if (m>=24) meses=8; else if (m>=12) meses=4; else if (m>=6) meses=2;
  const montoMostrado = meses>0 ? monto : 0;
  const total=montoMostrado*meses;
  const fmt=(n:number)=>'$'+Math.round(n).toLocaleString('es-AR');
  const techoAplica = s>0 && base > TECHO_DESEMPLEO;
  const pisoAplica = s>0 && base < PISO_DESEMPLEO;
  const _insight = meses===0
    ? {
        title: 'No alcanzás el mínimo',
        text: `Con **${m} mes${m!==1?'es':''}** cotizados no llegás a los **6 meses** mínimos que pide ANSES para cobrar el seguro de desempleo. Necesitás al menos 6 meses de aportes en los últimos 3 años.`,
        tone: 'warn',
        icon: '🚫',
      }
    : {
        title: 'Tu prestación por desempleo',
        text: `Vas a cobrar **${fmt(monto)}** por mes durante **${meses} meses** (total **${fmt(total)}**), calculado como el **75%** del promedio de tus últimos 6 sueldos. ` +
          (techoAplica
            ? `Tu sueldo superó el tope, así que la cuota quedó limitada al máximo de **${fmt(TECHO_DESEMPLEO)}** (jun-2026).`
            : pisoAplica
              ? `Como el 75% quedaba por debajo del piso, cobrás el mínimo de **${fmt(PISO_DESEMPLEO)}** (jun-2026).`
              : 'A más meses cotizados, más tiempo de cobertura: con 36 meses llegás al máximo de 12 cuotas.'),
        tone: 'good',
        icon: '🛟',
      };
  return { monto:fmt(montoMostrado), meses:meses.toString(), total:fmt(total), resumen:`Sueldo $${s.toLocaleString('es-AR')}, ${m} meses cotizados: ${meses} meses × ${fmt(montoMostrado)}.`, _insight };
}
