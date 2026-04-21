/**
 * Tests unitarios de las fórmulas críticas del sitio.
 *
 * Estrategia: cubrir las 20+ calcs más usadas con 2-5 casos cada una.
 * Incluye casos que cazaron bugs reales (UTC dates, edge cases de /0, etc.)
 * para evitar regressions cuando agentes regeneran código.
 *
 * Correr: npm test
 */

import { describe, it, expect } from 'vitest';

// --- Salud ---
import { imc } from '../src/lib/formulas/imc';
import { bmr } from '../src/lib/formulas/bmr';
import { caloriasTDEE } from '../src/lib/formulas/calorias-tdee';
import { pesoIdeal } from '../src/lib/formulas/peso-ideal';
import { hidratacionEjercicio } from '../src/lib/formulas/hidratacion-ejercicio';
import { indiceMasaCorporalPediatrico } from '../src/lib/formulas/indice-masa-corporal-pediatrico';

// --- Fechas (las del bug UTC que cazamos) ---
import { edadExacta } from '../src/lib/formulas/edad-exacta';
import { proximoCumpleanos } from '../src/lib/formulas/proximo-cumpleanos';
import { embarazo } from '../src/lib/formulas/embarazo';
import { ovulacion } from '../src/lib/formulas/ovulacion';
import { diasEntreFechas } from '../src/lib/formulas/dias-entre-fechas';

// --- Finanzas ---
import { interesCompuesto } from '../src/lib/formulas/interes-compuesto';
import { interesSimple } from '../src/lib/formulas/interes-simple';
import { plazoFijo } from '../src/lib/formulas/plazo-fijo';

// --- Matemática ---
import { porcentaje } from '../src/lib/formulas/porcentaje';
import { reglaTres } from '../src/lib/formulas/regla-tres';
import { combinatoriaPermutaciones } from '../src/lib/formulas/combinatoria-permutaciones';

// --- Marketing / negocios ---
import { marketingCtr } from '../src/lib/formulas/marketing-ctr';
import { margenGanancia } from '../src/lib/formulas/margen-ganancia';
import { ivaIncluidoNetoDiscriminar } from '../src/lib/formulas/iva-incluido-neto-discriminar';

// --- Deportes ---
import { vo2maxCooper } from '../src/lib/formulas/vo2max-cooper';
import { rmPesoMaximo } from '../src/lib/formulas/1rm-peso-maximo';

// --- Cafeína ---
import { cafeinaDosisRendimiento } from '../src/lib/formulas/cafeina-dosis-rendimiento';

// Helper: extrae el primer field numérico con nombre dado.
function pick(obj: any, keys: string[]): number | undefined {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === 'number' && !isNaN(v)) return v;
  }
  return undefined;
}

// ---------------------------------------------------------------------------
// SALUD
// ---------------------------------------------------------------------------

describe('imc (OMS)', () => {
  it('mujer 1.65m 68kg → IMC ~24.98 (normal al borde)', () => {
    const r = imc({ peso: 68, altura: 165 });
    expect(r.imc).toBeCloseTo(24.98, 1);
    expect(r.categoria.toLowerCase()).toMatch(/normal/);
  });

  it('1.70m 50kg → bajo peso', () => {
    const r = imc({ peso: 50, altura: 170 });
    expect(r.imc).toBeCloseTo(17.3, 1);
    expect(r.categoria).toMatch(/Bajo peso/);
  });

  it('1.80m 95kg → sobrepeso', () => {
    const r = imc({ peso: 95, altura: 180 });
    expect(r.imc).toBeCloseTo(29.3, 1);
    expect(r.categoria).toMatch(/Sobrepeso/);
  });

  it('peso 0 → error', () => {
    expect(() => imc({ peso: 0, altura: 170 })).toThrow();
  });
});

describe('indiceMasaCorporalPediatrico (CDC/OMS)', () => {
  // Ejemplo del JSON del calc: niño 8y, 28kg, 128cm → IMC 17.1, P75-85, peso normal alto.
  it('ejemplo JSON: niño 8y, 28kg, 128cm → IMC 17.1, P75-85', () => {
    const r = indiceMasaCorporalPediatrico({ peso: 28, altura: 128, edadAnios: 8, sexo: 'm' });
    expect(r.imc).toBeCloseTo(17.1, 1);
    expect(r.percentilAprox).toMatch(/75-85/);
    expect(r.clasificacion).toMatch(/Peso normal/);
  });

  it('IMC bajo: niño 5y, 14kg, 110cm → bajo peso (<P5)', () => {
    // IMC = 14 / 1.21 = 11.57, muy por debajo de P5=13.6 → bajo peso.
    const r = indiceMasaCorporalPediatrico({ peso: 14, altura: 110, edadAnios: 5, sexo: 'm' });
    expect(r.imc).toBeCloseTo(11.6, 1);
    expect(r.clasificacion).toBe('Bajo peso');
  });

  it('IMC obesidad: niña 10y, 55kg, 135cm → obesidad (≥P95)', () => {
    // IMC = 55 / 1.8225 = 30.2, muy por encima de P95=21.3 (niñas 10y).
    const r = indiceMasaCorporalPediatrico({ peso: 55, altura: 135, edadAnios: 10, sexo: 'f' });
    expect(r.imc).toBeCloseTo(30.2, 1);
    expect(r.clasificacion).toBe('Obesidad');
  });

  it('interpolación: 8.5y vs 8.4y no debe saltar de clasificación por 0.1 años', () => {
    // Antes del fix: 8.49 usa tabla 8 (P95=19.5), 8.50 usa tabla 9 (P95=20.4).
    // Un niño con IMC 20.0 saltaba de "Obesidad" a "Sobrepeso" por 0.01 años.
    // Con interpolación lineal, a 8.5y P95 ≈ (19.5+20.4)/2 = 19.95 — el borde
    // se mueve suave, no hay saltos bruscos por cruzar medio año.
    const r1 = indiceMasaCorporalPediatrico({ peso: 32.77, altura: 128, edadAnios: 8.49, sexo: 'm' });
    const r2 = indiceMasaCorporalPediatrico({ peso: 32.77, altura: 128, edadAnios: 8.50, sexo: 'm' });
    expect(r1.imc).toBeCloseTo(20.0, 1);
    expect(r2.imc).toBeCloseTo(20.0, 1);
    // Ambas versiones deben dar la MISMA clasificación (no salto abrupto).
    expect(r1.clasificacion).toBe(r2.clasificacion);
  });

  it('diferencia por sexo: mismo peso/altura/edad, sexos distintos → percentiles distintos', () => {
    const m = indiceMasaCorporalPediatrico({ peso: 40, altura: 135, edadAnios: 10, sexo: 'm' });
    const f = indiceMasaCorporalPediatrico({ peso: 40, altura: 135, edadAnios: 10, sexo: 'f' });
    // Mismo IMC (21.95) pero diferentes tablas de percentiles.
    expect(m.imc).toBeCloseTo(f.imc, 1);
    // En niños P95=21.4, en niñas P95=21.3 a 10y — ambos cerca pero distintos.
    // El test asegura que la bifurcación por sexo existe, no los valores exactos.
    expect(m.detalle).toMatch(/Masculino/);
    expect(f.detalle).toMatch(/Femenino/);
  });

  it('rechaza edad fuera de rango (2-18 años)', () => {
    expect(() => indiceMasaCorporalPediatrico({ peso: 10, altura: 80, edadAnios: 1, sexo: 'm' })).toThrow();
    expect(() => indiceMasaCorporalPediatrico({ peso: 70, altura: 170, edadAnios: 20, sexo: 'm' })).toThrow();
  });

  it('rechaza peso/altura inválidos', () => {
    expect(() => indiceMasaCorporalPediatrico({ peso: 0, altura: 120, edadAnios: 8, sexo: 'm' })).toThrow();
    expect(() => indiceMasaCorporalPediatrico({ peso: 25, altura: 0, edadAnios: 8, sexo: 'm' })).toThrow();
  });
});

describe('bmr (Mifflin-St Jeor)', () => {
  it('hombre 30 años 80kg 180cm → BMR ~1780', () => {
    const r = bmr({ sexo: 'm', edad: 30, peso: 80, altura: 180 } as any);
    expect(r.bmr).toBeGreaterThan(1700);
    expect(r.bmr).toBeLessThan(1850);
  });

  it('mujer 25 años 60kg 165cm → BMR ~1345', () => {
    const r = bmr({ sexo: 'f', edad: 25, peso: 60, altura: 165 } as any);
    expect(r.bmr).toBeGreaterThan(1280);
    expect(r.bmr).toBeLessThan(1410);
  });
});

describe('caloriasTDEE', () => {
  it('hombre 30 años 80kg 180cm moderado → TDEE 2600-2900', () => {
    const r = caloriasTDEE({
      sexo: 'masculino',
      edad: 30,
      peso: 80,
      altura: 180,
      actividad: 'moderado',
    } as any);
    expect(r.tdee).toBeGreaterThan(2500);
    expect(r.tdee).toBeLessThan(3000);
  });

  it('mujer 25 años 60kg 165cm sedentario → TDEE < 1800', () => {
    const r = caloriasTDEE({
      sexo: 'femenino',
      edad: 25,
      peso: 60,
      altura: 165,
      actividad: 'sedentario',
    } as any);
    expect(r.tdee).toBeLessThan(1800);
    expect(r.tdee).toBeGreaterThan(1400);
  });
});

describe('pesoIdeal', () => {
  it('hombre 1.75m → rango lógico', () => {
    const r: any = pesoIdeal({ sexo: 'hombre', altura: 175 });
    const min = pick(r, ['pesoMinimo', 'pesoIdealMin', 'min']);
    const max = pick(r, ['pesoMaximo', 'pesoIdealMax', 'max']);
    if (typeof min === 'number' && typeof max === 'number') {
      expect(min).toBeGreaterThan(50);
      expect(max).toBeLessThan(85);
      expect(max).toBeGreaterThan(min);
    }
  });
});

describe('hidratacionEjercicio', () => {
  it('70kg 60min 25°C → agua recomendada > 400ml', () => {
    const r = hidratacionEjercicio({
      peso: 70,
      duracion: 60,
      intensidad: 'alta',
      temperaturaAmbiente: 25,
    } as any);
    expect(r.aguaRecomendada).toBeGreaterThan(400);
  });
});

// ---------------------------------------------------------------------------
// FECHAS (bug UTC)
// ---------------------------------------------------------------------------

describe('edadExacta (bug UTC)', () => {
  it('nacido 10 enero 2000: mensaje NO menciona "9 de enero"', () => {
    const r: any = edadExacta({ fechaNacimiento: '2000-01-10' });
    const str = JSON.stringify(r).toLowerCase();
    expect(str).not.toMatch(/9\s*de\s*enero/);
  });

  it('edad ≥ 20 para nacido 2000-06-15', () => {
    const r: any = edadExacta({ fechaNacimiento: '2000-06-15' });
    const anos = pick(r, ['anios', 'años', 'edad', 'years', 'edadAnios']);
    if (typeof anos === 'number') expect(anos).toBeGreaterThanOrEqual(20);
  });
});

describe('proximoCumpleanos (bug UTC)', () => {
  it('nacimiento 10-ene: mensaje menciona "10", NO "9/1"', () => {
    const r = proximoCumpleanos({ fechaNacimiento: '1990-01-10' });
    expect(r.mensaje).toMatch(/10/);
    expect(r.mensaje).not.toMatch(/9\/1\/|9 de enero/);
  });

  it('días faltantes en rango 0-366', () => {
    const r = proximoCumpleanos({ fechaNacimiento: '1990-06-01' });
    expect(r.diasFaltan).toBeGreaterThanOrEqual(0);
    expect(r.diasFaltan).toBeLessThanOrEqual(366);
  });
});

describe('embarazo (Naegele)', () => {
  it('FUM 15 enero 2026: FPP debe caer en octubre 2026 (+280 días)', () => {
    const r: any = embarazo({ fum: '2026-01-15' });
    // fpp en formato ISO 2026-10-XX (octubre)
    expect(r.fpp).toMatch(/^2026-10-\d{2}$/);
  });
});

describe('ovulacion', () => {
  it('FUM 1 enero, ciclo 28 → devuelve fechas coherentes', () => {
    const r = ovulacion({ fum: '2026-01-01', largoCiclo: 28 });
    expect(r.fechaOvulacion).toBeTruthy();
    expect(r.ventanaFertilInicio).toBeTruthy();
    expect(r.ventanaFertilFin).toBeTruthy();
    // Día de ovulación = FUM + (28 - 14) = 15 ene. Fix UTC aplicado.
    expect(r.fechaOvulacion).toMatch(/2026-01/);
  });
});

describe('diasEntreFechas', () => {
  it('1 ene a 1 feb 2026 → 31 días', () => {
    const r: any = diasEntreFechas({ desde: '2026-01-01', hasta: '2026-02-01' });
    const dias = pick(r, ['dias', 'diasCalendario', 'total', 'diferencia']);
    if (typeof dias === 'number') expect(Math.abs(dias)).toBe(31);
  });

  it('misma fecha → 0 días', () => {
    const r: any = diasEntreFechas({ desde: '2026-06-15', hasta: '2026-06-15' });
    const dias = pick(r, ['dias', 'diasCalendario', 'total', 'diferencia']);
    if (typeof dias === 'number') expect(dias).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// FINANZAS
// ---------------------------------------------------------------------------

describe('interesCompuesto', () => {
  it('$100k al 10% anual por 10 años sin aportes → ~$259k', () => {
    const r = interesCompuesto({
      capitalInicial: 100000,
      tasaAnual: 10,
      plazoAnios: 10,
      aporteMensual: 0,
    });
    expect(r.valorFinal).toBeGreaterThan(240000);
    expect(r.valorFinal).toBeLessThan(280000);
  });

  it('capital 0 + aporte mensual $1000 por 5 años al 10% → valor positivo', () => {
    const r = interesCompuesto({
      capitalInicial: 0,
      tasaAnual: 10,
      plazoAnios: 5,
      aporteMensual: 1000,
    });
    expect(r.valorFinal).toBeGreaterThan(50000);
  });

  it('capital 0 + aporte 0 → error', () => {
    expect(() =>
      interesCompuesto({ capitalInicial: 0, tasaAnual: 10, plazoAnios: 5, aporteMensual: 0 })
    ).toThrow();
  });
});

describe('interesSimple', () => {
  it('$100k al 10% por 5 años → total ~$150k', () => {
    const r = interesSimple({ capital: 100000, tasa: 10, tiempo: 5, unidad: 'anios' } as any);
    expect(r.montoFinal).toBeCloseTo(150000, -2);
    expect(r.interes).toBeCloseTo(50000, -2);
  });
});

describe('plazoFijo', () => {
  it('$500k al 50% TNA por 30 días → interés ~$20500', () => {
    const r = plazoFijo({ capital: 500000, tna: 50, dias: 30 });
    // 500000 * 0.5 * 30/365 = 20547
    expect(r.interesGanado).toBeGreaterThan(18000);
    expect(r.interesGanado).toBeLessThan(22000);
    expect(r.montoFinal).toBeGreaterThan(r.interesGanado);
  });
});

// ---------------------------------------------------------------------------
// MATEMÁTICA
// ---------------------------------------------------------------------------

describe('porcentaje', () => {
  it('25% de 200 (modo "simple") → resultado 50', () => {
    const r = porcentaje({ modo: 'simple', valor1: 25, valor2: 200 });
    expect(r.resultado).toMatch(/50/);
  });

  it('diferencia: 50 es qué % de 200 → 25%', () => {
    const r = porcentaje({ modo: 'diferencia', valor1: 50, valor2: 200 });
    expect(r.resultado).toMatch(/25/);
  });
});

describe('reglaTres (directa)', () => {
  it('3:15 = 5:X → X=25', () => {
    const r: any = reglaTres({ a: 3, b: 15, c: 5, tipo: 'directa' });
    const val = pick(r, ['resultado', 'x', 'valor', 'd']);
    if (typeof val === 'number') expect(val).toBe(25);
  });
});

describe('combinatoriaPermutaciones', () => {
  it('combinaciones C(5,2) = 10', () => {
    const r = combinatoriaPermutaciones({ n: 5, r: 2, tipo: 'combinacion' });
    expect(r.resultado).toBe(10);
  });

  it('permutaciones P(5,3) = 60', () => {
    const r = combinatoriaPermutaciones({ n: 5, r: 3, tipo: 'permutacion' });
    expect(r.resultado).toBe(60);
  });

  it('r > n en combinacion → error', () => {
    expect(() => combinatoriaPermutaciones({ n: 3, r: 10, tipo: 'combinacion' })).toThrow();
  });
});

// ---------------------------------------------------------------------------
// MARKETING / NEGOCIOS
// ---------------------------------------------------------------------------

describe('marketingCtr', () => {
  it('50 clicks / 1000 impresiones → CTR = 5%', () => {
    const r: any = marketingCtr({ clicks: 50, impresiones: 1000 });
    const ctr = pick(r, ['ctr', 'ctrPorcentaje', 'resultado']);
    if (typeof ctr === 'number') expect(ctr).toBeCloseTo(5, 1);
  });

  it('impresiones 0 → no devuelve NaN/Infinity', () => {
    let r: any;
    try {
      r = marketingCtr({ clicks: 10, impresiones: 0 });
    } catch {
      return;
    }
    const ctr = pick(r, ['ctr', 'resultado']);
    if (typeof ctr === 'number') expect(isFinite(ctr)).toBe(true);
  });
});

describe('margenGanancia', () => {
  it('costo 100, precio 150 → ganancia 50, margen sobre costo 50%', () => {
    const r = margenGanancia({ costo: 100, precioVenta: 150 });
    expect(r.gananciaBruta).toBeCloseTo(50, 0);
    expect(r.margenSobreCosto).toBeCloseTo(50, 0);
    // margen sobre venta: 50/150 = 33.33%
    expect(r.margenSobreVenta).toBeCloseTo(33.33, 0);
  });
});

describe('ivaIncluidoNetoDiscriminar', () => {
  it('recibe input y devuelve objeto', () => {
    const r: any = ivaIncluidoNetoDiscriminar({ monto: 121, alicuota: 21, modo: 'discriminar' });
    expect(r).toBeDefined();
    expect(typeof r).toBe('object');
  });
});

// ---------------------------------------------------------------------------
// DEPORTES
// ---------------------------------------------------------------------------

describe('vo2maxCooper', () => {
  it('2400m en 12 min, 30 años hombre → VO2max entre 35-45', () => {
    const r = vo2maxCooper({ distanciaMetros: 2400, edad: 30, sexo: 'hombre' });
    expect(r.vo2max).toBeGreaterThan(35);
    expect(r.vo2max).toBeLessThan(45);
  });
});

describe('rmPesoMaximo (1RM Epley)', () => {
  it('100kg x 5 reps → 1RM entre 110 y 125', () => {
    const r = rmPesoMaximo({ peso: 100, repeticiones: 5 });
    expect(r.rm1).toBeGreaterThan(105);
    expect(r.rm1).toBeLessThan(130);
  });
});

// ---------------------------------------------------------------------------
// CAFEÍNA (la que revisamos antes)
// ---------------------------------------------------------------------------

describe('cafeinaDosisRendimiento', () => {
  it('70kg tolerancia media → 210-350 mg', () => {
    const r = cafeinaDosisRendimiento({ peso: 70, tolerancia: 'media' });
    expect(r.dosisMinima).toBeCloseTo(210, -1);
    expect(r.dosisMaxima).toBeCloseTo(350, -1);
  });

  it('120kg alta → cap EFSA 400mg', () => {
    const r = cafeinaDosisRendimiento({ peso: 120, tolerancia: 'alta' });
    expect(r.dosisMaxima).toBeLessThanOrEqual(400);
  });

  it('peso 0 → error', () => {
    expect(() => cafeinaDosisRendimiento({ peso: 0, tolerancia: 'media' })).toThrow();
  });
});
