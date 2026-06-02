// Valor UTM live desde mindicador.cl (cron diario fetch-chile.mjs), con fallback verificado.
import clLive from "../../data/live/chile.json";

export interface Inputs {
  tipo_vehiculo: 'particular' | 'comercial_ligero' | 'comercial_pesado' | 'moto';
  ano_fabricacion: number;
  planta_seleccionada: '3cv' | 'cesmec' | 'detran';
  meses_atraso: number;
}

export interface Outputs {
  es_obligatoria: boolean;
  frecuencia_meses: string;
  proximo_vencimiento: string;
  precio_3cv: number;
  precio_cesmec: number;
  precio_detran: number;
  multa_estimada: number;
  advertencia_legal: string;
  _insight?: any;
}

export function compute(i: Inputs): Outputs {
  const anoActual = 2026;
  const antigüedad = anoActual - i.ano_fabricacion;
  
  // Determinar obligatoriedad según tipo y antigüedad
  let esObligatoria = false;
  let frecuenciaMeses = 'No aplica';
  
  if (i.tipo_vehiculo === 'particular' && antigüedad >= 4) {
    esObligatoria = true;
    frecuenciaMeses = 'Anual (12 meses)';
  } else if (i.tipo_vehiculo === 'comercial_ligero' && antigüedad >= 3) {
    esObligatoria = true;
    frecuenciaMeses = antigüedad > 10 ? 'Semestral (6 meses)' : 'Anual (12 meses)';
  } else if (i.tipo_vehiculo === 'comercial_pesado' && antigüedad >= 3) {
    esObligatoria = true;
    frecuenciaMeses = antigüedad > 10 ? 'Semestral (6 meses)' : 'Anual (12 meses)';
  } else if (i.tipo_vehiculo === 'moto' && antigüedad >= 5) {
    esObligatoria = true;
    frecuenciaMeses = 'Anual (12 meses)';
  }
  
  // Calcular próximo vencimiento (estimado 6 meses desde hoy si aplica)
  const hoy = new Date();
  const proximoVence = new Date(hoy);
  proximoVence.setMonth(proximoVence.getMonth() + 6);
  const proximoVencimientoStr = proximoVence.toISOString().split('T')[0];
  
  // Precios base 2026 por tipo y planta (en CLP, sin IVA privadas)
  const preciosBase: { [key in typeof i.tipo_vehiculo]: { [key in typeof i.planta_seleccionada]: number } } = {
    particular: { '3cv': 18500, cesmec: 16800, detran: 14500 },
    comercial_ligero: { '3cv': 22000, cesmec: 20500, detran: 17800 },
    comercial_pesado: { '3cv': 28000, cesmec: 26500, detran: 21000 },
    moto: { '3cv': 12000, cesmec: 11200, detran: 9800 }
  };
  
  const precio3cv = preciosBase[i.tipo_vehiculo]['3cv'] || 0;
  const precioCesmec = preciosBase[i.tipo_vehiculo].cesmec || 0;
  const precioDetran = preciosBase[i.tipo_vehiculo].detran || 0;
  
  // Calcular multa por atraso (Código Tránsito, UTA 2026 ≈ 62.000 CLP)
  // Tramos: 0-1 mes = 5-10 UTM, 2-3 meses = 15-20 UTM, 4+ meses = 30-50 UTM
  const utmValor = (clLive as any)?.utm?.valor ?? 70588; // Valor UTM live mindicador.cl con fallback verificado
  let multaUtm = 0;
  let estadoLegal = 'Revisión vigente: legal';
  
  if (i.meses_atraso > 0) {
    if (i.meses_atraso <= 1) {
      multaUtm = 7.5; // promedio 5-10
    } else if (i.meses_atraso <= 3) {
      multaUtm = 17.5; // promedio 15-20
    } else {
      multaUtm = 40; // promedio 30-50
    }
    
    if (i.meses_atraso >= 6) {
      estadoLegal = `⚠️ ALERTA CRÍTICA: ${i.meses_atraso} meses atraso. Bloqueo circulatorio automático activo. Riesgo decomiso temporal. Circulación prohibida.`;
    } else {
      estadoLegal = `⚠️ Circulación sin revisión: ${i.meses_atraso} mes(es) atraso. Multa aplicable + possibles sanciones adicionales (sin seguro, sin permiso).`;
    }
  }
  
  const multaEstimada = Math.round(multaUtm * utmValor);

  const fmtCl = (n: number) => Math.round(n).toLocaleString('es-CL');
  const precioMin = Math.min(precio3cv, precioCesmec, precioDetran);
  let insight: Outputs['_insight'];
  if (!esObligatoria) {
    insight = {
      title: 'Revisión técnica',
      text: `Por tipo y antigüedad, tu vehículo **aún no está obligado** a revisión técnica. Cuando lo esté, la planta más económica te saldría unos **$${fmtCl(precioMin)} CLP**.`,
      tone: 'neutral',
      icon: '🚗',
    };
  } else if (i.meses_atraso >= 6) {
    insight = {
      title: 'Bloqueo circulatorio',
      text: `Con **${i.meses_atraso} meses** de atraso ya corre bloqueo de circulación y riesgo de decomiso temporal: la multa estimada trepa a **$${fmtCl(multaEstimada)} CLP**. Renová cuanto antes (planta más barata desde $${fmtCl(precioMin)}).`,
      tone: 'warn',
      icon: '🚫',
    };
  } else if (i.meses_atraso > 0) {
    insight = {
      title: 'Revisión vencida',
      text: `Circular con **${i.meses_atraso} mes(es)** de atraso expone a una multa estimada de **$${fmtCl(multaEstimada)} CLP**, varias veces el costo de la revisión (desde $${fmtCl(precioMin)}). Conviene ponerte al día ya.`,
      tone: 'warn',
      icon: '⚠️',
    };
  } else {
    insight = {
      title: 'Revisión vigente',
      text: `Tu revisión figura **vigente** y sin multas. La próxima la podés hacer desde **$${fmtCl(precioMin)} CLP** en la planta más económica (${frecuenciaMeses.toLowerCase()}).`,
      tone: 'good',
      icon: '✅',
    };
  }

  return {
    es_obligatoria: esObligatoria,
    frecuencia_meses: frecuenciaMeses,
    proximo_vencimiento: proximoVencimientoStr,
    precio_3cv: precio3cv,
    precio_cesmec: precioCesmec,
    precio_detran: precioDetran,
    multa_estimada: multaEstimada,
    advertencia_legal: estadoLegal,
    _insight: insight
  };
}
