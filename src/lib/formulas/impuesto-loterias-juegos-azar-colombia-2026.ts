import { COLOMBIA_2026 } from '../data/colombia-2026';

export interface Inputs {
  monto_premio: number;
  tipo_juego: 'baloto' | 'loteria_nacional' | 'loteria_departamental' | 'otros_juegos';
  uvt_2026: number;
}

export interface Outputs {
  uvt_48_pesos: number;
  supera_umbral: string;
  retension_17: number;
  premio_neto: number;
  ganancia_ocasional: number;
  impuesto_complementario: number;
  total_impuesto: number;
  tasa_efectiva: number;
  obligacion_declaracion: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Constantes y validación
  const uvt_2026 = i.uvt_2026 || COLOMBIA_2026.uvt; // UVT 2026 = $52.374 (Resolución DIAN 000238/2025)
  const umbral_uvt = 48; // Ley, Decreto 624/1989
  const retencion_porcentaje = 0.17; // 17% - retención obligatoria
  
  // Tarifa marginal estimada ganancia ocasional (aprox. 37% sin otros ingresos, máx. 39% con otros)
  const tarifa_marginal_base = 0.37; // Reforma tributaria 2022
  
  // Cálculo del umbral en pesos
  const uvt_48_pesos = umbral_uvt * uvt_2026;
  
  // Validar monto positivo
  const monto = i.monto_premio > 0 ? i.monto_premio : 0;
  
  // Determinar si supera umbral
  const supera = monto > uvt_48_pesos;
  const supera_umbral = supera ? 'Sí, aplica retención' : 'No, bajo umbral';
  
  // Retención en la fuente (solo si supera umbral)
  const retension_17 = supera ? Math.round(monto * retencion_porcentaje) : 0;
  
  // Premio neto a recibir
  const premio_neto = monto - retension_17;
  
  // Ganancia ocasional (gravable, solo si supera umbral)
  const ganancia_ocasional = supera ? monto : 0;
  
  // Impuesto complementario estimado
  // = (Ganancia ocasional × Tarifa marginal) − Retención ya pagada
  // Nota: si no hay otros ingresos y ganancia ocasional es único ingreso,
  // la tarifa marginal es aproximadamente 37%. Con otros ingresos sube hasta 39%.
  // Esta calculadora asume tarifa base 37% (caso común: ganador sin otros ingresos).
  let impuesto_complementario = 0;
  if (supera) {
    const impuesto_definitivo = Math.round(ganancia_ocasional * tarifa_marginal_base);
    impuesto_complementario = Math.max(0, impuesto_definitivo - retension_17);
  }
  
  // Total impuesto (retención + complementario)
  const total_impuesto = retension_17 + impuesto_complementario;
  
  // Tasa efectiva de impuesto
  const tasa_efectiva = monto > 0 ? Math.round((total_impuesto / monto) * 10000) / 100 : 0;
  
  // Obligación de declaración
  let obligacion_declaracion = 'No obligado (bajo umbral)';
  if (supera) {
    obligacion_declaracion = 'Sí, obligado. Declarar formulario 210 (Ganancia ocasional)';
  }
  
  // Neto final que realmente te queda tras retención + complementario
  const neto_final = Math.max(0, monto - total_impuesto);

  // ── Insight narrativo (dinámico según umbral) ──────────────────────
  const fmtCO = (n: number) => '$' + Math.round(n).toLocaleString('es-CO', { maximumFractionDigits: 0 });
  const _insight = !supera
    ? {
        title: 'Premio exento de retención',
        text: `Tu premio de **${fmtCO(monto)}** no supera el umbral de 48 UVT (**${fmtCO(uvt_48_pesos)}**), así que **no tiene retención** ni impuesto de ganancia ocasional. Te quedás con el total.`,
        tone: 'good',
        icon: '🍀',
      }
    : {
        title: 'Lo que te queda del premio',
        text: `De **${fmtCO(monto)}** te retienen **${fmtCO(retension_17)}** (17%) en la fuente y el impuesto total de ganancia ocasional llega a **${fmtCO(total_impuesto)}** (**${tasa_efectiva}%** efectivo). En la mano te quedan **${fmtCO(neto_final)}** y quedás obligado a declarar (formulario 210).`,
        tone: 'warn',
        icon: '🎰',
      };

  // ── Gráfico: sólo si supera umbral, repartiendo el premio ──────────
  const _chart = supera
    ? {
        type: 'doughnut',
        slices: [
          { label: 'Te queda', value: Math.round(neto_final) },
          { label: 'Retención 17%', value: Math.round(retension_17) },
          ...(impuesto_complementario > 0 ? [{ label: 'Impuesto complementario', value: Math.round(impuesto_complementario) }] : []),
        ],
        prefix: '$',
        centerValue: fmtCO(monto),
        centerLabel: 'Premio',
        ariaLabel: 'Reparto del premio entre lo que te queda, la retención del 17% y el impuesto complementario',
      }
    : undefined;

  return {
    uvt_48_pesos: Math.round(uvt_48_pesos),
    supera_umbral,
    retension_17,
    premio_neto,
    ganancia_ocasional,
    impuesto_complementario,
    total_impuesto,
    tasa_efectiva,
    obligacion_declaracion,
    _insight,
    ...(_chart ? { _chart } : {}),
  };
}
