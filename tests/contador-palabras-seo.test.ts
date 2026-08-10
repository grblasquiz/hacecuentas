import { describe, expect, it } from 'vitest';
import { hub } from '../src/lib/hubs/contador-de-palabras';

describe('contador de palabras — canonical SEO', () => {
  it('responde la consulta exacta en title, H1 y descripción', () => {
    expect(hub.title.toLowerCase()).toContain('contador de palabras');
    expect(hub.title.toLowerCase()).toContain('caracteres');
    expect(hub.h1.toLowerCase()).toContain('contador de palabras');
    expect(hub.description.toLowerCase()).toContain('contá palabras');
  });

  it('mantiene las calculadoras heredadas como reemplazadas, no reactivadas', () => {
    expect(hub.replaces).toContain('/calculadora-contador-de-palabras-y-caracteres');
    expect(hub.slug).toBe('estudio/contador-de-palabras');
  });
});
