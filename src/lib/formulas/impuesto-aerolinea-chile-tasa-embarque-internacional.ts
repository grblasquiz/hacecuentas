export interface Inputs {
  tipo_vuelo: 'nacional' | 'internacional' | 'internacional_retorno';
  ruta_origen?: string;
  numero_pasajeros: number;
}

export interface Outputs {
  tasa_embarque_unitaria: number;
  tasa_total_bruta: number;
  iva_tasa_embarque: number;
  tasa_total_neta: number;
  desglose_detalle: string;
  _insight?: any;
  _chart?: any;
}

export function compute(i: Inputs): Outputs {
  // Validación
  if (!i.tipo_vuelo || i.numero_pasajeros <= 0) {
    return {
      tasa_embarque_unitaria: 0,
      tasa_total_bruta: 0,
      iva_tasa_embarque: 0,
      tasa_total_neta: 0,
      desglose_detalle: 'Error: Verifica tipo vuelo y número de pasajeros.'
    };
  }

  // Constantes 2026 DGAC (Chile)
  // Referencial: $30 USD ≈ $29.000 CLP (TC Banco Central aproximado)
  const TASA_INTERNACIONAL_USD = 30;
  const TC_REFERENCIAL_2026 = 967; // $1 USD = ~$967 CLP (referencial 2026)
  const TASA_INTERNACIONAL_CLP = TASA_INTERNACIONAL_USD * TC_REFERENCIAL_2026; // ≈ $29.010

  // Tasas nacionales por zona (CLP, aprox 2026 DGAC)
  const TASA_NACIONAL_NORTE = 18000; // Iquique, Calama, La Serena
  const TASA_NACIONAL_CENTRO = 19500; // Santiago, Valparaíso
  const TASA_NACIONAL_SUR = 18500; // Concepción, Temuco, Puerto Montt, Punta Arenas

  // IVA Chile 2026
  const IVA = 0.19;

  // Determinar tasa unitaria según tipo vuelo
  let tasa_unitaria = 0;
  let moneda_desc = '';

  if (i.tipo_vuelo === 'internacional' || i.tipo_vuelo === 'internacional_retorno') {
    // Vuelos internacionales: USD a CLP
    tasa_unitaria = TASA_INTERNACIONAL_CLP;
    moneda_desc = `$${TASA_INTERNACIONAL_USD} USD (≈$${Math.round(tasa_unitaria).toLocaleString('es-CL')} CLP)`;
  } else if (i.tipo_vuelo === 'nacional') {
    // Vuelos nacionales: determinar zona por ruta_origen
    if (
      i.ruta_origen === 'ipe' ||
      i.ruta_origen === 'calama' ||
      i.ruta_origen === 'la_serena'
    ) {
      tasa_unitaria = TASA_NACIONAL_NORTE;
      moneda_desc = `Zona Norte (${Math.round(tasa_unitaria).toLocaleString('es-CL')} CLP)`;
    } else if (i.ruta_origen === 'puerto_montt' || i.ruta_origen === 'temuco' || i.ruta_origen === 'punta_arenas' || i.ruta_origen === 'concepcion') {
      tasa_unitaria = TASA_NACIONAL_SUR;
      moneda_desc = `Zona Sur (${Math.round(tasa_unitaria).toLocaleString('es-CL')} CLP)`;
    } else {
      // Centro/Santiago por defecto
      tasa_unitaria = TASA_NACIONAL_CENTRO;
      moneda_desc = `Zona Centro (${Math.round(tasa_unitaria).toLocaleString('es-CL')} CLP)`;
    }
  }

  // Cálculos
  const tasa_total_bruta = tasa_unitaria * i.numero_pasajeros;
  const iva_tasa_embarque = Math.round(tasa_total_bruta * IVA);
  const tasa_total_neta = tasa_total_bruta + iva_tasa_embarque;

  // Desglose detallado
  const tipo_vuelo_label =
    i.tipo_vuelo === 'nacional' ? 'Vuelo Nacional' :
    i.tipo_vuelo === 'internacional' ? 'Vuelo Internacional (Salida)' :
    'Vuelo Internacional (Retorno)';

  const desglose_detalle = `
**Resumen Tasa de Embarque Chile 2026**

Tipo vuelo: ${tipo_vuelo_label}
Tarifa unitaria: ${moneda_desc}
Pasajeros: ${i.numero_pasajeros}

---

**Desglose:**
- Tasa total (bruta): $${Math.round(tasa_total_bruta).toLocaleString('es-CL')} CLP
- IVA 19%: $${iva_tasa_embarque.toLocaleString('es-CL')} CLP
- **Total con IVA: $${Math.round(tasa_total_neta).toLocaleString('es-CL')} CLP**

Por pasajero (con IVA): $${Math.round((tasa_total_neta / i.numero_pasajeros)).toLocaleString('es-CL')} CLP

*Nota: Valores referenciales 2026. DGAC publica tasas exactas en sitio oficial. TC referencial: 1 USD = $${TC_REFERENCIAL_2026} CLP.*
  `.trim();

  const clp = (v: number) => '$' + Math.round(v).toLocaleString('es-CL');
  const porPax = tasa_total_neta / i.numero_pasajeros;

  const _insight = {
    title: 'Lo que pagás de tasa',
    text: `${tipo_vuelo_label} para ${i.numero_pasajeros} pasajero(s): la tasa de embarque total con IVA es **${clp(tasa_total_neta)} CLP** (${clp(porPax)} por pasajero). De ese monto, **${clp(iva_tasa_embarque)} CLP** son IVA del 19%.`,
    tone: 'warn' as const,
    icon: '✈️',
  };

  const _chart = {
    type: 'doughnut' as const,
    slices: [
      { label: 'Tasa (neta)', value: Math.round(tasa_total_bruta) },
      { label: 'IVA 19%', value: iva_tasa_embarque },
    ],
    prefix: '$',
    centerValue: clp(tasa_total_neta),
    centerLabel: 'Total CLP',
    ariaLabel: 'Composición de la tasa de embarque: tarifa más IVA',
  };

  return {
    tasa_embarque_unitaria: Math.round(tasa_unitaria),
    tasa_total_bruta: Math.round(tasa_total_bruta),
    iva_tasa_embarque: iva_tasa_embarque,
    tasa_total_neta: Math.round(tasa_total_neta),
    desglose_detalle: desglose_detalle,
    _insight,
    _chart
  };
}
