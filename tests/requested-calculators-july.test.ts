import { describe, expect, it } from 'vitest';
import { horasTrabajadasSemanal } from '../src/lib/formulas/horas-trabajadas-semanal';
import { tallaSostenCopa } from '../src/lib/formulas/talla-sosten-copa';
import { tallaAnilloDedo } from '../src/lib/formulas/talla-anillo-dedo';
import { tamanoTvDistancia } from '../src/lib/formulas/tamano-tv-distancia';
import { homaIrQuicki } from '../src/lib/formulas/homa-ir-quicki';
import { tallaPantalonJeans } from '../src/lib/formulas/talla-pantalon-jeans';
import { numeroCaminoVida } from '../src/lib/formulas/numero-camino-vida';
import { edadMetabolica } from '../src/lib/formulas/edad-metabolica';

describe('calculadoras solicitadas en julio', () => {
  it('suma turnos diurnos y nocturnos, descansos y horas extra', () => {
    const r = horasTrabajadasSemanal({
      lunEntrada: '09:00', lunSalida: '18:00', lunDescanso: 60,
      marEntrada: '22:00', marSalida: '06:00', marDescanso: 30,
      jornadaNormal: 10, valorHora: 1000, recargoExtra: 50,
    });
    expect(r.horasDecimales).toBe(15.5);
    expect(r.horasExtra).toBe(5.5);
    expect(r.sueldoTotal).toBe(18_250);
  });

  it('convierte medidas de corpiño desde pulgadas y ofrece equivalencias', () => {
    const r = tallaSostenCopa({ contornoBajo: 30, contornoPecho: 35, unidad: 'in', sistema: 'todos' });
    expect(r.tallaEU).toMatch(/^75/);
    expect(r.tallaUS).toMatch(/^34/);
    expect(r.alternativas.length).toBeGreaterThan(4);
  });

  it('calcula talla de anillo a partir del diámetro', () => {
    const r = tallaAnilloDedo({ circunferencia: 0, diametro: 18, metodo: 'diametro', unidad: 'mm', sistema: 'todos' });
    expect(r.diametro).toBe(18);
    expect(r.tallaEU).toBe(57);
    expect(r.tallaES).toBe(17);
  });

  it('resuelve tamaño de TV y distancia en ambos sentidos', () => {
    const porDistancia = tamanoTvDistancia({ modo: 'tengo_distancia', distanciaMetros: 3, resolucion: '4k' });
    const porTv = tamanoTvDistancia({ modo: 'tengo_tv', pulgadasTv: 55, resolucion: '4k' });
    expect(porDistancia.pulgadasIdeales).toBe(51);
    expect(porTv.distanciaIdeal).toBe(2.2);
    expect(porTv.anchoTv).toBeGreaterThan(120);
  });

  it('calcula HOMA-IR, HOMA-beta y QUICKI con unidades clínicas habituales', () => {
    const r = homaIrQuicki({ glucosa: 90, unidadGlucosa: 'mgdl', insulina: 10 });
    expect(r.homaIr).toBe(2.22);
    expect(r.homaBeta).toBe(133.3);
    expect(r.quicki).toBe(0.338);
  });

  it('convierte medidas de pantalón y produce talle W/L', () => {
    const r = tallaPantalonJeans({ cintura: 80, cadera: 98, entrepierna: 81, perfil: 'mujer', ajuste: 'regular', unidad: 'cm' });
    expect(r.jeansWL).toBe('W31/L32');
    expect(r.tallaEU).toBe(r.tallaAR);
  });

  it('preserva números maestros en el camino de vida', () => {
    expect(numeroCaminoVida({ fechaNacimiento: '2000-01-08' }).numeroVida).toBe(11);
  });

  it('estima edad metabólica y gasto diario sin presentarlos como diagnóstico', () => {
    const r = edadMetabolica({ peso: 70, altura: 175, edad: 35, sexo: 'm', grasaCorporal: 18, actividad: 'moderada' });
    expect(r.tdee).toBeGreaterThan(r.rmrReal);
    expect(r.factores).toContain('No es una métrica clínica');
  });
});
