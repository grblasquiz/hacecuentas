/**
 * Programa el refresh sólo después de una carrera, sprint o clasificación.
 * Launchd usa el reloj local de la Mac (Argentina): cada sesión recibe dos
 * disparos, +3 y +10 min, para cubrir la breve demora de publicación de OpenF1.
 */
import { writeFile } from 'node:fs/promises';

const now = new Date();
const sessions = await fetch('https://api.openf1.org/v1/sessions?year=2026').then((r) => {
  if (!r.ok) throw new Error(`OpenF1 HTTP ${r.status}`);
  return r.json();
});
const relevant = new Set(['Race', 'Sprint', 'Qualifying', 'Sprint Qualifying']);
const AR = 'America/Argentina/Buenos_Aires';
const calendar = [];
for (const session of sessions) {
  if (!relevant.has(session.session_name) || session.is_cancelled) continue;
  const end = new Date(session.date_end);
  if (end <= now) continue;
  for (const delay of [3, 10]) {
    const d = new Date(end.getTime() + delay * 60_000);
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-US', {
      timeZone: AR, month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hourCycle: 'h23',
    }).formatToParts(d).filter((p) => p.type !== 'literal').map((p) => [p.type, Number(p.value)]));
    calendar.push(`<dict><key>Month</key><integer>${parts.month}</integer><key>Day</key><integer>${parts.day}</integer><key>Hour</key><integer>${parts.hour}</integer><key>Minute</key><integer>${parts.minute}</integer></dict>`);
  }
}
const plist = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
  <key>Label</key><string>com.hacecuentas.formula-1</string>
  <key>ProgramArguments</key><array><string>/bin/bash</string><string>/Users/marrod/hacecuentas/scripts/formula-1-refresh-and-deploy.sh</string></array>
  <key>StartCalendarInterval</key><array>${calendar.join('')}</array>
  <key>StandardOutPath</key><string>/tmp/hc-formula-1.out</string>
  <key>StandardErrorPath</key><string>/tmp/hc-formula-1.err</string>
</dict></plist>\n`;
const target = '/Users/marrod/Library/LaunchAgents/com.hacecuentas.formula-1.plist';
await writeFile(target, plist);
console.log(`F1 launchd: ${calendar.length} ejecuciones (${calendar.length / 2} sesiones futuras), +3 y +10 minutos.`);
