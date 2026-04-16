/**
 * Conversor de Colores HEX ↔ RGB ↔ HSL
 */
export interface CodigoColorInputs { hexColor: string; red: number; green: number; blue: number; }
export interface CodigoColorOutputs { hex: string; rgb: string; hsl: string; css: string; }

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

export function codigoColorHexRgb(inputs: CodigoColorInputs): CodigoColorOutputs {
  let r: number, g: number, b: number;

  const hexInput = (inputs.hexColor || '').trim().replace('#', '');
  if (hexInput && /^[0-9a-fA-F]{6}$/.test(hexInput)) {
    r = parseInt(hexInput.slice(0, 2), 16);
    g = parseInt(hexInput.slice(2, 4), 16);
    b = parseInt(hexInput.slice(4, 6), 16);
  } else if (hexInput && /^[0-9a-fA-F]{3}$/.test(hexInput)) {
    r = parseInt(hexInput[0] + hexInput[0], 16);
    g = parseInt(hexInput[1] + hexInput[1], 16);
    b = parseInt(hexInput[2] + hexInput[2], 16);
  } else {
    r = Math.min(255, Math.max(0, Number(inputs.red) || 0));
    g = Math.min(255, Math.max(0, Number(inputs.green) || 0));
    b = Math.min(255, Math.max(0, Number(inputs.blue) || 0));
    if (r === 0 && g === 0 && b === 0 && !inputs.red && !inputs.green && !inputs.blue) {
      throw new Error('Ingresá un color HEX o valores RGB');
    }
  }

  const hex = `#${r.toString(16).padStart(2, '0').toUpperCase()}${g.toString(16).padStart(2, '0').toUpperCase()}${b.toString(16).padStart(2, '0').toUpperCase()}`;
  const rgb = `rgb(${r}, ${g}, ${b})`;
  const [h, s, l] = rgbToHsl(r, g, b);
  const hsl = `hsl(${h}°, ${s}%, ${l}%)`;

  return { hex, rgb, hsl, css: `color: ${hex}; /* ${rgb} */` };
}
