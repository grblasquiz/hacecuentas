import { describe, expect, it } from 'vitest';
import { ADSENSE_SERVING_ENABLED, GOOGLE_CERTIFIED_CMP_ENABLED, isAdsenseExcludedPath } from '../src/lib/adsense';

describe('seguridad de serving AdSense', () => {
  it('no permite serving mientras no exista CMP certificada', () => {
    expect(GOOGLE_CERTIFIED_CMP_ENABLED).toBe(false);
    expect(ADSENSE_SERVING_ENABLED).toBe(false);
  });

  it.each(['/buscar', '/buscar?q=', '/mi-hacecuentas', '/mi/alquiler', '/login', '/recuperar-clave', '/sugerir', '/sugerencias', '/contacto', '/embed/calculadora-imc', '/descargar/resultado', '/cookies', '/privacidad', '/terminos', '/aviso-legal', '/404', '/confirmacion', '/error'])('excluye %s', (path) => {
    expect(isAdsenseExcludedPath(path)).toBe(true);
  });

  it('no excluye una calculadora editorial completa', () => {
    expect(isAdsenseExcludedPath('/calculadora-imc')).toBe(false);
  });
});
