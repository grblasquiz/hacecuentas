/**
 * Logger básico con prefijos por fetcher. Stdout para info, stderr para errors.
 * En CI, cada línea es captable por GitHub Actions y queda en el log del workflow.
 */

export type LogLevel = 'info' | 'warn' | 'error' | 'success' | 'skip';

const ICONS: Record<LogLevel, string> = {
  info: '·',
  warn: '!',
  error: '✗',
  success: '✓',
  skip: '⊘',
};

export function createLogger(prefix: string) {
  const log = (level: LogLevel, msg: string) => {
    const line = `[${prefix}] ${ICONS[level]} ${msg}`;
    (level === 'error' ? console.error : console.log)(line);
  };
  return {
    info: (m: string) => log('info', m),
    warn: (m: string) => log('warn', m),
    error: (m: string) => log('error', m),
    success: (m: string) => log('success', m),
    skip: (m: string) => log('skip', m),
  };
}

export type Logger = ReturnType<typeof createLogger>;
