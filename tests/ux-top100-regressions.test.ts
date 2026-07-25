import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { calorEspecificoDeltaT } from '../src/lib/formulas/calor-especifico-delta-t';
import { ladrillosM2 } from '../src/lib/formulas/ladrillos-m2';
import { salarioMinimoParaguay2026 } from '../src/lib/formulas/salario-minimo-paraguay-2026';

describe('regresiones UX del top 100', () => {
  it('no duplica la unidad Joule entre fórmula y output', () => {
    const result = calorEspecificoDeltaT({ m: 1, c: 4186, dt: 80 });
    expect(result.calor).toBe('334880');
    expect(String(result.calor)).not.toMatch(/\bJ\b/);
  });

  it('mantiene tablas y fórmulas flagship dentro del viewport móvil', () => {
    const css = readFileSync('src/styles/calc-flagship.css', 'utf8');
    expect(css).toMatch(/\.cf-tablewrap\s*\{[\s\S]*?max-width:\s*100%/);
    expect(css).toMatch(/\.cf-2col\s*>\s*\*/);
    expect(css).toMatch(/\.cf-formula\s*\{[\s\S]*?overflow-x:\s*auto/);
    expect(css).toMatch(/\.cf-page pre\s*\{[\s\S]*?overflow-x:\s*auto/);
    expect(css).toMatch(/\.cf-dates\s*\{\s*grid-template-columns:\s*minmax\(0,\s*1fr\)/);
  });

  it('limita contenido V2, código y contexto económico en mobile', () => {
    const css = readFileSync('src/styles/calc-redesign.css', 'utf8');
    expect(css).toMatch(/\.calc-v2\s+\.v2-block\s*\{[^}]*min-width:\s*0/);
    expect(css).toMatch(/\.calc-v2\s+\.live-econ\s*\{[\s\S]*?max-width:\s*100%/);
    expect(css).toMatch(/:where\(pre\)\s*\{[^}]*max-width:\s*100%/);
  });

  it('activa el rediseño focus sin excluir edad exacta', () => {
    const layout = readFileSync('src/components/CalcLayoutV2.astro', 'utf8');
    const css = readFileSync('src/styles/calc-redesign.css', 'utf8');
    const excluded = readFileSync('src/lib/redesign-exclude.ts', 'utf8');
    expect(layout).toContain("focusRedesign && 'calc-focus'");
    expect(css).toMatch(/\.calc-focus\s+\.calc-form\s+\.fields-grid/);
    expect(excluded).not.toMatch(/'calculadora-edad-exacta'/);
  });

  it('respeta 0% de desperdicio en la calculadora de ladrillos', () => {
    const result = ladrillosM2({ m2: 10, tipo: 'hueco_12', desperdicio: 0 });
    expect(result.ladrillos).toBe(160);
    expect(result.desperdicio).toBe(0);
  });

  it('respeta una liquidación de 0 días en salario mínimo Paraguay', () => {
    const result = salarioMinimoParaguay2026({ jornada: 'diurna', dias: 0 });
    expect(result.proporcional).toBe(0);
  });

  it('activa el rediseño focus en la nueva tanda orgánica', () => {
    const layout = readFileSync('src/components/CalcLayoutV2.astro', 'utf8');
    for (const slug of [
      'calculadora-aportes-arl-colombia-empleador-empleado-riesgo',
      'calculadora-salario-diario-integrado-sdi-mexico',
      'conversor-numero-a-letras-cantidad',
      'calculadora-interes-judicial-tasa',
      'salario-minimo-paraguay-2026',
    ]) {
      expect(layout).toContain(`'${slug}'`);
    }
  });

  it('activa focus en la tanda de calculadoras con más de 100 sesiones', () => {
    const layout = readFileSync('src/components/CalcLayoutV2.astro', 'utf8');
    for (const slug of [
      'calculadora-gastos-notariales-registro-compraventa-2026',
      'calculadora-impuesto-ganancias-sueldo',
      'calculadora-prima-antiguedad-mexico',
      'calculadora-antiguedad-laboral',
      'calculadora-generacion-perteneces',
      'calculadora-horas-extras-colombia-2026',
      'calculadora-millas-latam-destino',
      'calculadora-impuesto-renta-colombia-persona-natural-2026',
      'calculadora-combustible-viaje-auto',
      'calculadora-soat-peru-precio',
      'calculadora-impuesto-industria-comercio-ica-colombia-municipios',
      'calculadora-presion-atmosferica-altitud-barometrica',
      'calculadora-convenio-hosteleria-espana-sueldo-2026-categoria',
      'calculadora-retencion-ganancias-rg-830',
      'calculadora-credito-infonavit-descuento',
      'calculadora-sancion-extemporaneidad-dian-2026',
      'calculadora-recibo-luz-codensa-epm-colombia-estrato',
      'calculadora-liquidacion-empleada-domestica-por-dias-colombia-2026',
      'calculadora-placas-auto-costo-mexico',
      'calculadora-isn-impuesto-sobre-nominas-estado',
      'calculadora-sueldo-por-hora',
      'calculadora-empleada-domestica-dias-colombia-2026',
    ]) {
      expect(layout).toContain(`'${slug}'`);
    }
  });

  it('activa focus en la tanda de 70 a 89 sesiones orgánicas', () => {
    const layout = readFileSync('src/components/CalcLayoutV2.astro', 'utf8');
    for (const slug of [
      'calculadora-patente-municipal-ecuador',
      'calculadora-recargo-nocturno-colombia-2026',
      'calculadora-reduccion-jornada-42-horas-colombia-2026',
      'calculadora-incapacidad-medica-eps-colombia',
      'calculadora-pension-alimenticia-ecuador',
      'calculadora-impuesto-timbre-nacional-colombia-2026',
      'calculadora-isr-honorarios-persona-fisica',
      'calculadora-porcion-arroz-gramos-personas',
      'calculadora-bebidas-evento-litros-por-persona',
      'calculadora-semanas-embarazo',
      'calculadora-horario-llegada-zona-horaria',
      'calculadora-tarifa-electrica-distribuidoras-chile-bt1-bt2-bt3',
      'calculadora-duracion-bateria-mah-consumo',
      'calculadora-tabla-impuesto-renta-personas-naturales-colombia-2026',
      'calculadora-canasta-basica-mexico-costo-mensual-familia',
      'calculadora-imss-cuotas-empleado-patron-mexico-2026',
      'calculadora-consumo-nafta-litros-100km',
      'calculadora-impuesto-sellos-inmueble-contrato',
      'calculadora-pago-provisional-isr-arrendamiento-mexico-2026',
    ]) {
      expect(layout).toContain(`'${slug}'`);
    }
  });
});
