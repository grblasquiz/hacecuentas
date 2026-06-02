export interface Inputs { password: string; }
export interface Outputs { fuerza: string; puntaje: number; tiempoCrack: string; sugerencias: string; _insight?: any; _chart?: any; }
export function passwordStrength(i: Inputs): Outputs {
  const p = String(i.password||'');
  if(!p) throw new Error('Ingresá una contraseña');
  let score = 0; const tips:string[] = [];
  // Length
  if(p.length>=16) score+=30; else if(p.length>=12) score+=25; else if(p.length>=8) score+=15; else { score+=5; tips.push('Usá al menos 12 caracteres.'); }
  // Uppercase
  if(/[A-Z]/.test(p)) score+=15; else tips.push('Agregá mayúsculas.');
  // Lowercase
  if(/[a-z]/.test(p)) score+=15; else tips.push('Agregá minúsculas.');
  // Numbers
  if(/\d/.test(p)) score+=15; else tips.push('Agregá números.');
  // Symbols
  if(/[^A-Za-z0-9]/.test(p)) score+=15; else tips.push('Agregá símbolos (!@#$%^&*).');
  // Variety bonus
  if(new Set(p).size > p.length*0.7) score+=5;
  // Common patterns penalty
  if(/^(123|abc|qwe|password|1234)/i.test(p)) { score-=20; tips.push('Evitá patrones comunes (123, abc, qwerty).'); }
  score = Math.max(0, Math.min(100, score));
  // Crack time estimation
  let pool = 0;
  if(/[a-z]/.test(p)) pool+=26;
  if(/[A-Z]/.test(p)) pool+=26;
  if(/\d/.test(p)) pool+=10;
  if(/[^A-Za-z0-9]/.test(p)) pool+=32;
  if(pool===0) pool=26;
  const combinations = Math.pow(pool, p.length);
  const attemptsPerSec = 1e10; // 10 billion (modern GPU)
  const seconds = combinations / attemptsPerSec;
  let tiempo = '';
  if(seconds<1) tiempo='Menos de 1 segundo';
  else if(seconds<60) tiempo=`${Math.round(seconds)} segundos`;
  else if(seconds<3600) tiempo=`${Math.round(seconds/60)} minutos`;
  else if(seconds<86400) tiempo=`${Math.round(seconds/3600)} horas`;
  else if(seconds<86400*365) tiempo=`${Math.round(seconds/86400)} días`;
  else if(seconds<86400*365*1000) tiempo=`${Math.round(seconds/(86400*365))} años`;
  else if(seconds<86400*365*1e6) tiempo=`${Math.round(seconds/(86400*365*1000))} mil años`;
  else tiempo='Millones de años o más';
  let fuerza = score>=80?'Fuerte':score>=60?'Moderada':score>=40?'Débil':'Muy débil';

  const insTone = score >= 80 ? 'good' : score >= 60 ? 'neutral' : 'warn';
  const insIcon = score >= 80 ? '🔒' : score >= 60 ? '🔑' : '⚠️';
  const insText = score >= 80
    ? `Puntaje **${score}/100** (${fuerza.toLowerCase()}): resistiría por fuerza bruta unos **${tiempo.toLowerCase()}**. Sólida — no la reutilices en otros sitios.`
    : score >= 60
    ? `Puntaje **${score}/100** (${fuerza.toLowerCase()}): aguanta ~**${tiempo.toLowerCase()}** por fuerza bruta, pero se puede mejorar. ${tips.length ? tips[0] : ''}`
    : `Puntaje **${score}/100** (${fuerza.toLowerCase()}): se crackea en ~**${tiempo.toLowerCase()}**. ${tips.length ? tips[0] : 'Reforzala antes de usarla.'}`;

  const _insight = {
    title: 'Diagnóstico de tu contraseña',
    text: insText.trim(),
    tone: insTone,
    icon: insIcon,
  };

  const _chart = {
    type: 'scale',
    marker: score,
    markerLabel: `${score}/100`,
    min: 0,
    segments: [
      { nombre: 'Muy débil', max: 40, color: '#dc2626', colorDark: '#ef4444' },
      { nombre: 'Débil', max: 60, color: '#f97316', colorDark: '#fb923c' },
      { nombre: 'Moderada', max: 80, color: '#eab308', colorDark: '#facc15' },
      { nombre: 'Fuerte', max: 101, color: '#22c55e', colorDark: '#4ade80' },
    ],
    ariaLabel: `Puntaje de seguridad de ${score} sobre 100`,
  };

  return { fuerza, puntaje: score, tiempoCrack: tiempo, sugerencias: tips.length?tips.join(' '):'Tu contraseña es sólida.', _insight, _chart };
}
