/**
 * Generador de Código QR (URL, texto, WhatsApp, email, WiFi)
 * Genera la URL de un código QR usando la API de Google Charts
 */
export interface GeneradorQrInputs { tipoContenido: string; contenido: string; tamano: number; }
export interface GeneradorQrOutputs { qrUrl: string; contenidoFinal: string; tipoDetectado: string; instrucciones: string; }

export function generadorQr(inputs: GeneradorQrInputs): GeneradorQrOutputs {
  const tipo = (inputs.tipoContenido || 'texto').toLowerCase();
  const contenido = (inputs.contenido || '').trim();
  const tamano = Math.min(500, Math.max(100, Number(inputs.tamano) || 300));

  if (!contenido) throw new Error('Ingresá el contenido para generar el código QR');

  let contenidoFinal = '';
  let tipoDetectado = '';
  let instrucciones = '';

  switch (tipo) {
    case 'url': {
      const url = contenido.startsWith('http') ? contenido : `https://${contenido}`;
      try { new URL(url); } catch { throw new Error('La URL ingresada no es válida'); }
      contenidoFinal = url;
      tipoDetectado = 'URL / Enlace web';
      instrucciones = 'Al escanear, abre el navegador con la URL indicada.';
      break;
    }
    case 'whatsapp': {
      const num = contenido.replace(/[^0-9+]/g, '');
      if (num.length < 8) throw new Error('Ingresá un número de teléfono válido (con código de país, ej: +5491155551234)');
      contenidoFinal = `https://wa.me/${num.replace('+', '')}`;
      tipoDetectado = 'WhatsApp';
      instrucciones = 'Al escanear, abre un chat de WhatsApp con el número indicado.';
      break;
    }
    case 'email': {
      if (!contenido.includes('@')) throw new Error('Ingresá una dirección de email válida');
      contenidoFinal = `mailto:${contenido}`;
      tipoDetectado = 'Email';
      instrucciones = 'Al escanear, abre la app de correo para enviar un email.';
      break;
    }
    case 'telefono': {
      const tel = contenido.replace(/[^0-9+]/g, '');
      if (tel.length < 8) throw new Error('Ingresá un número de teléfono válido');
      contenidoFinal = `tel:${tel}`;
      tipoDetectado = 'Teléfono';
      instrucciones = 'Al escanear, inicia una llamada al número indicado.';
      break;
    }
    case 'wifi': {
      // Formato: SSID,contraseña
      const parts = contenido.split(',');
      if (parts.length < 2) throw new Error('Ingresá en formato: NombreRed,contraseña');
      const ssid = parts[0].trim();
      const pass = parts.slice(1).join(',').trim();
      contenidoFinal = `WIFI:T:WPA;S:${ssid};P:${pass};;`;
      tipoDetectado = 'WiFi';
      instrucciones = 'Al escanear, conecta automáticamente a la red WiFi.';
      break;
    }
    default: {
      contenidoFinal = contenido;
      tipoDetectado = 'Texto libre';
      instrucciones = 'Al escanear, muestra el texto ingresado.';
    }
  }

  const encoded = encodeURIComponent(contenidoFinal);
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${tamano}x${tamano}&data=${encoded}`;

  return { qrUrl, contenidoFinal, tipoDetectado, instrucciones };
}
