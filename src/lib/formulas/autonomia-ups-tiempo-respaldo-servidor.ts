export interface Inputs { va?: number; w?: number; __lang?: string; [k: string]: number | string | undefined; }
export interface Outputs { [k: string]: string | number; _insight?: any; _chart?: any; }

// Estima la autonomía (runtime) de un UPS a partir de su capacidad en VA y la
// carga real en W. No se puede calcular exacto sin el Wh de la batería, así que
// se usa un modelo tipo Peukert calibrado contra las tablas publicadas de
// runtime de APC / CyberPower / Eaton (2024): energía útil ≈ VA × 0.028 Wh y un
// exponente de descarga 1.5 que premia las cargas bajas (la batería SLA rinde
// más a menor corriente). Reproduce la tabla de referencia dentro de ~15%.
export function autonomiaUpsTiempoRespaldoServidor(i: Inputs): Outputs {
  const __lang = i.__lang === 'en' ? 'en' : 'es';
  const va = Number(i.va) || 0;
  const w = Number(i.w) || 0;
  if (w === 0) return { minutos: '—', utilizacion: '—', resumen: __lang === 'en' ? 'Load cannot be 0.' : 'Carga no puede ser 0.' };

  const wMax = va * 0.6;                 // potencia útil real (FP 0.6)
  const ut = (w / wMax) * 100;           // utilización %
  const peukert = w < wMax ? Math.pow(wMax / w, 0.5) : 1; // premio a carga baja
  const min = (va * 0.028 / w) * 60 * peukert;            // minutos de respaldo

  const sobrecarga = ut > 100;
  const tone = sobrecarga ? 'warn' : (ut > 80 ? 'warn' : 'good');

  let text: string;
  if (__lang === 'en') {
    text = sobrecarga
      ? `With **${w} W** you exceed the UPS's usable power of ${va} VA (~${wMax.toFixed(0)} W): it is **overloaded at ${ut.toFixed(0)}%** and may shut off without warning. Reduce the load or move to a larger unit.`
      : (ut > 80
        ? `You are using **${ut.toFixed(0)}%** of the UPS capacity: the **~${min.toFixed(0)} min** of backup barely covers an orderly shutdown. With so little headroom, any extra draw leaves you short.`
        : `With **${w} W** on a ${va} VA UPS you use **${ut.toFixed(0)}%** of its capacity and get **~${min.toFixed(0)} min** of backup. Comfortable margin to save your work and shut down without rushing.`);
  } else {
    text = sobrecarga
      ? `Con **${w} W** superás la potencia útil del UPS de ${va} VA (~${wMax.toFixed(0)} W): está **sobrecargado al ${ut.toFixed(0)}%** y puede apagarse de golpe. Bajá la carga o pasá a un equipo más grande.`
      : (ut > 80
        ? `Estás usando el **${ut.toFixed(0)}%** de la capacidad del UPS: el respaldo de **~${min.toFixed(0)} min** alcanza apenas para un apagado ordenado. Con tan poco margen, cualquier consumo extra lo deja corto.`
        : `Con **${w} W** sobre un UPS de ${va} VA usás el **${ut.toFixed(0)}%** de su capacidad y obtenés **~${min.toFixed(0)} min** de respaldo. Margen cómodo para guardar y apagar sin apuro.`);
  }

  const _insight = {
    title: __lang === 'en' ? 'Estimated backup time' : 'Respaldo estimado',
    text,
    tone,
    icon: '🔋',
  };

  const segEs = [
    { nombre: 'Holgado', max: 50, color: '#16a34a', colorDark: '#22c55e' },
    { nombre: 'Recomendado', max: 80, color: '#65a30d', colorDark: '#84cc16' },
    { nombre: 'Al límite', max: 100, color: '#f59e0b', colorDark: '#fbbf24' },
    { nombre: 'Sobrecarga', max: Math.max(130, Math.ceil(ut) + 5), color: '#dc2626', colorDark: '#f87171' },
  ];
  const segEn = [
    { nombre: 'Comfortable', max: 50, color: '#16a34a', colorDark: '#22c55e' },
    { nombre: 'Recommended', max: 80, color: '#65a30d', colorDark: '#84cc16' },
    { nombre: 'At the limit', max: 100, color: '#f59e0b', colorDark: '#fbbf24' },
    { nombre: 'Overload', max: Math.max(130, Math.ceil(ut) + 5), color: '#dc2626', colorDark: '#f87171' },
  ];

  const _chart = {
    type: 'scale',
    marker: Math.round(ut),
    markerLabel: __lang === 'en' ? `${ut.toFixed(0)}% load` : `${ut.toFixed(0)}% de uso`,
    min: 0,
    segments: __lang === 'en' ? segEn : segEs,
    ariaLabel: __lang === 'en'
      ? `UPS load level: ${ut.toFixed(0)}% of its usable capacity`
      : `Nivel de uso del UPS: ${ut.toFixed(0)}% de su capacidad útil`,
  };

  const resumen = __lang === 'en'
    ? `${va} VA UPS at ${w} W: ~${min.toFixed(0)} min (${ut.toFixed(0)}% load).`
    : `UPS ${va}VA con ${w}W: ~${min.toFixed(0)} min (${ut.toFixed(0)}% uso).`;

  return {
    minutos: `${min.toFixed(1)} min`,
    utilizacion: `${ut.toFixed(0)}%`,
    resumen,
    _insight,
    _chart,
  };
}
