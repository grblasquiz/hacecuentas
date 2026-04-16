/** Comparación método avalancha vs bola de nieve para pagar deudas */

export interface Inputs {
  deuda1Monto: number;
  deuda1Tasa: number;
  deuda1Minimo: number;
  deuda2Monto: number;
  deuda2Tasa: number;
  deuda2Minimo: number;
  deuda3Monto: number;
  deuda3Tasa: number;
  deuda3Minimo: number;
  pagoMensualTotal: number;
}

export interface Outputs {
  mesesAvalancha: number;
  mesesBolaNieve: number;
  interesAvalancha: number;
  interesBolaNieve: number;
  ahorroAvalancha: number;
  mejorMetodo: string;
  formula: string;
  explicacion: string;
}

interface Deuda {
  monto: number;
  tasa: number;
  minimo: number;
}

function simular(deudas: Deuda[], pagoTotal: number, ordenarPor: 'tasa' | 'monto'): { meses: number; interesTotal: number } {
  const ds = deudas.map(d => ({ ...d, saldo: d.monto }));

  if (ordenarPor === 'tasa') {
    ds.sort((a, b) => b.tasa - a.tasa); // Avalancha: mayor tasa primero
  } else {
    ds.sort((a, b) => a.saldo - b.saldo); // Bola de nieve: menor saldo primero
  }

  let meses = 0;
  let interesTotal = 0;
  const MAX_MESES = 600;

  while (ds.some(d => d.saldo > 0) && meses < MAX_MESES) {
    meses++;
    let disponible = pagoTotal;

    // Acumular intereses
    for (const d of ds) {
      if (d.saldo > 0) {
        const interes = d.saldo * (d.tasa / 100 / 12);
        interesTotal += interes;
        d.saldo += interes;
      }
    }

    // Pagar mínimos primero
    for (const d of ds) {
      if (d.saldo > 0) {
        const pago = Math.min(d.minimo, d.saldo, disponible);
        d.saldo -= pago;
        disponible -= pago;
      }
    }

    // El extra va a la primera deuda con saldo
    for (const d of ds) {
      if (d.saldo > 0 && disponible > 0) {
        const pago = Math.min(d.saldo, disponible);
        d.saldo -= pago;
        disponible -= pago;
        break; // Solo a la primera
      }
    }
  }

  return { meses, interesTotal };
}

export function deudaAvalanchaVsBolaNieve(i: Inputs): Outputs {
  const deudas: Deuda[] = [];
  let sumaMinimos = 0;

  for (let n = 1; n <= 3; n++) {
    const monto = Number((i as Record<string, number>)[`deuda${n}Monto`]) || 0;
    const tasa = Number((i as Record<string, number>)[`deuda${n}Tasa`]) || 0;
    const minimo = Number((i as Record<string, number>)[`deuda${n}Minimo`]) || 0;
    if (monto > 0) {
      deudas.push({ monto, tasa, minimo });
      sumaMinimos += minimo;
    }
  }

  if (deudas.length === 0) throw new Error('Ingresá al menos una deuda');

  const pagoTotal = Number(i.pagoMensualTotal);
  if (!pagoTotal || pagoTotal < sumaMinimos) throw new Error(`El pago mensual debe ser al menos $${sumaMinimos.toLocaleString()} (suma de mínimos)`);

  const avalancha = simular(deudas, pagoTotal, 'tasa');
  const bolaNieve = simular(deudas, pagoTotal, 'monto');

  const ahorroAvalancha = bolaNieve.interesTotal - avalancha.interesTotal;
  const mejorMetodo = ahorroAvalancha > 0 ? 'Avalancha' : ahorroAvalancha < 0 ? 'Bola de nieve' : 'Igual';

  const totalDeuda = deudas.reduce((s, d) => s + d.monto, 0);

  const formula = `Avalancha: ${avalancha.meses} meses ($${Math.round(avalancha.interesTotal).toLocaleString()} interés) vs Bola de nieve: ${bolaNieve.meses} meses ($${Math.round(bolaNieve.interesTotal).toLocaleString()} interés)`;
  const explicacion = `Deuda total: $${totalDeuda.toLocaleString()}, pago mensual: $${pagoTotal.toLocaleString()}. **Avalancha** (mayor tasa primero): ${avalancha.meses} meses, $${Math.round(avalancha.interesTotal).toLocaleString()} de interés total. **Bola de nieve** (menor saldo primero): ${bolaNieve.meses} meses, $${Math.round(bolaNieve.interesTotal).toLocaleString()} de interés total. ${mejorMetodo === 'Avalancha' ? `Avalancha ahorra $${Math.round(ahorroAvalancha).toLocaleString()} y ${bolaNieve.meses - avalancha.meses} meses. Pero bola de nieve da victorias rápidas que motivan.` : 'Ambos métodos dan resultado similar con estas deudas.'}`;

  return {
    mesesAvalancha: avalancha.meses,
    mesesBolaNieve: bolaNieve.meses,
    interesAvalancha: Math.round(avalancha.interesTotal),
    interesBolaNieve: Math.round(bolaNieve.interesTotal),
    ahorroAvalancha: Math.round(ahorroAvalancha),
    mejorMetodo,
    formula,
    explicacion,
  };
}
