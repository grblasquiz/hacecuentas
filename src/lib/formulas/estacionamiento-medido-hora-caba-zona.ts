export interface Inputs { [k: string]: number | string; }
export interface Outputs { [k: string]: string | number; _insight?: any; }

// Estacionamiento medido CABA 2026 — tarifa progresiva (sistema Blinkay).
// 1ra hora: tarifa base. Cada hora siguiente +30% sobre la hora anterior,
// hasta la 4ta hora. De la 5ta hora en adelante, la tarifa se mantiene fija
// en el valor de la 4ta hora.
export function estacionamientoMedidoHoraCabaZona(i: Inputs): Outputs {
  const hRaw = Number(i.horas);
  const h = Number.isFinite(hRaw) && hRaw > 0 ? hRaw : 0;

  // Tarifa base de la 1ra hora segun zona (valores 2026).
  const z = String(i.zona || 'estandar');
  const base = ({
    estandar: 700,        // San Nicolas, Montserrat, Balvanera, Recoleta, etc.
    puerto_madero: 176,   // Puerto Madero (tarifa diferencial mas baja)
  } as Record<string, number>)[z] ?? 700;

  // Construye el costo de cada hora con +30% acumulativo hasta la 4ta hora;
  // de la 5ta en adelante se repite la tarifa de la 4ta hora.
  const hourRate = (n: number): number => {
    const capped = Math.min(n, 4); // hora 1..4 progresiva
    return base * Math.pow(1.3, capped - 1);
  };

  // Suma el costo de las horas enteras + la fraccion de la ultima hora.
  let total = 0;
  const full = Math.floor(h);
  for (let n = 1; n <= full; n++) total += hourRate(n);
  const frac = h - full;
  if (frac > 0) total += hourRate(full + 1) * frac;

  const round = (x: number) => Math.round(x);
  total = round(total);
  const promedioHora = h > 0 ? round(total / h) : 0;

  const fmt = (x: number) => `$${x.toLocaleString('es-AR')}`;

  const _insight =
    h > 4
      ? {
          title: `Estacionar ${h} h cuesta ${fmt(total)}`,
          text: `Con la **tarifa progresiva** de CABA (sistema Blinkay), la 1ra hora vale **${fmt(round(base))}** y cada hora siguiente sube **30%** hasta la 4ta. De la 5ta hora en adelante la tarifa se estabiliza en **${fmt(round(hourRate(4)))}/h**. Las **${h} h** suman **${fmt(total)}** (promedio **${fmt(promedioHora)}/h**). Recorda activar el pago en la app **Blinkay** apenas estacionas.`,
          tone: 'neutral',
          icon: '🅿️',
        }
      : {
          title: `Estacionar ${h} h cuesta ${fmt(total)}`,
          text: `La 1ra hora vale **${fmt(round(base))}** y cada hora siguiente sube **30%** (tarifa progresiva). Por eso **${h} h** no es ${fmt(round(base))}×${h}: el total real es **${fmt(total)}** (promedio **${fmt(promedioHora)}/h**). El medido rige **lun-vie 8-20 h y sab 8-13 h**; domingos y feriados es gratis. Paga con la app **Blinkay**.`,
          tone: 'neutral',
          icon: '🅿️',
        };

  return {
    costoTotal: fmt(total),
    porHora: fmt(promedioHora) + '/h prom.',
    limite: 'Lun-vie 8-20 h · sab 8-13 h',
    _insight,
  };
}
