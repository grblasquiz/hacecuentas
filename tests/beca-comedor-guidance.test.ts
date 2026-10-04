import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { hub, PERMISO, DEDUCCIONES, TABLA_CGPJ } from '../src/lib/hubs/es/tener-un-hijo';
import { PRUNING_REDIRECTS } from '../src/lib/pruning-redirects';

const page = readFileSync('src/pages/es/familia/tener-un-hijo.astro', 'utf8');
const script = page.match(/>\s*(\(function \(\) \{[\s\S]*?)<\/script>/)![1];

describe('beca comedor: orientación sin elegibilidad nacional', () => {
  it.each([0, 5000, 8400, 11000, 30000, 100000])('no asigna ayuda para renta %s, incluso con el hub clásico', rentaFamiliar => {
    let compute: any;
    runInNewContext(script, { window: { HC_HUB: { onCompute(f: any) { compute = f; } } },
      PERM: PERMISO, DED: DEDUCCIONES, CGPJ: TABLA_CGPJ });
    const output = compute({ rentaFamiliar, umbralComedor: 11000, hijosEscolares: 2 }, { id: 'escolar' });
    expect(output.total).toBe('Consulta la convocatoria');
    expect(output.rows).toEqual([]);
    expect(output.chart).toEqual([]);
    expect(output.sub).not.toMatch(/te corresponde|no habría beca|cubriría|tramo del|%/i);
  });

  it('no falla cuando el presupuesto aprobado reemplaza al hub clásico', () => {
    expect(() => runInNewContext(script, { window: {} })).not.toThrow();
  });

  it('concentra los aliases de comedor y conserva el destino de reducción de jornada', () => {
    for (const prefix of ['', '/es']) {
      expect(PRUNING_REDIRECTS[`${prefix}/calculadora-beca-comedor-escolar-espana-renta-umbrales`])
        .toBe('/es/familia/tener-un-hijo');
    }
    expect(PRUNING_REDIRECTS['/es/calculadora-reduccion-jornada-hijo-espana-salario-cotizacion'])
      .toBe('/es/familia/ayudas-por-renta');
  });

  it('la FAQ y los campos no ofrecen la escala nacional ni solicitan renta para asignar una beca', () => {
    const school = hub.cases!.items.find(c => c.id === 'escolar')!;
    const faq = hub.faq.find(f => /beca de comedor/.test(f.q))!;
    expect(JSON.stringify([school, faq])).not.toMatch(/75%|50%|tramo.*100%/);
    expect(faq.a).toContain('Una estimación no acredita el derecho a la beca');
    expect(hub.fields.some(f => ['rentaFamiliar', 'umbralComedor'].includes(f.id))).toBe(false);
  });
});
