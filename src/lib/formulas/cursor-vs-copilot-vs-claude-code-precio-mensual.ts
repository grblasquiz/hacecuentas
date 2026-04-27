export interface Inputs {
  developers: number;
  lines_per_month: string; // 'low' | 'medium' | 'high'
  complexity: string;     // 'simple' | 'moderate' | 'complex'
  plan_type: string;      // 'individual' | 'business'
}

export interface Outputs {
  winner: string;
  cursor_total: number;
  copilot_total: number;
  claude_code_total: number;
  cody_total: number;
  aider_total: number;
  codex_total: number;
  cursor_per_dev: number;
  copilot_per_dev: number;
  claude_per_dev: number;
  cody_per_dev: number;
  aider_per_dev: number;
  codex_per_dev: number;
  ranking: string;
}

export function compute(i: Inputs): Outputs {
  const developers = Math.max(1, Math.round(Number(i.developers) || 1));
  const lines = i.lines_per_month || 'medium';
  const complexity = i.complexity || 'moderate';
  const planType = i.plan_type || 'individual';

  // ── Fixed-seat prices (USD/dev/month) ──────────────────────────────────
  // Source: cursor.com/pricing, github.com/features/copilot/plans, sourcegraph.com/pricing (2026)
  const CURSOR_INDIVIDUAL = 20;
  const CURSOR_BUSINESS   = 40;
  const COPILOT_INDIVIDUAL = 10;
  const COPILOT_BUSINESS   = 19;  // Copilot Business 2026
  const CODY_INDIVIDUAL    = 9;
  const CODY_BUSINESS      = 19;

  const cursorPerDev  = planType === 'business' ? CURSOR_BUSINESS  : CURSOR_INDIVIDUAL;
  const copilotPerDev = planType === 'business' ? COPILOT_BUSINESS : COPILOT_INDIVIDUAL;
  const codyPerDev    = planType === 'business' ? CODY_BUSINESS    : CODY_INDIVIDUAL;

  // ── Token usage model ──────────────────────────────────────────────────
  // Estimated tokens per dev per month based on lines_per_month intensity
  const TOKEN_USAGE: Record<string, { input: number; output: number }> = {
    low:    { input:   500_000, output:  150_000 },
    medium: { input: 2_000_000, output:  500_000 },
    high:   { input: 6_000_000, output: 1_500_000 },
  };

  // Complexity multiplier: longer context = more tokens per request
  const COMPLEXITY_MULT: Record<string, number> = {
    simple:   0.7,
    moderate: 1.0,
    complex:  1.6,
  };

  const baseTokens = TOKEN_USAGE[lines] ?? TOKEN_USAGE['medium'];
  const mult       = COMPLEXITY_MULT[complexity] ?? 1.0;

  const tokensIn  = baseTokens.input  * mult;
  const tokensOut = baseTokens.output * mult;

  // ── API pricing (USD per million tokens) ──────────────────────────────
  // Claude Code via Anthropic API — claude-sonnet-4 (2026)
  // Source: anthropic.com/pricing
  const CLAUDE_IN_PER_MTOK  = 3.00;
  const CLAUDE_OUT_PER_MTOK = 15.00;

  // Aider via OpenAI API — gpt-4o (2026)
  // Source: openai.com/api/pricing
  const AIDER_IN_PER_MTOK  = 2.50;
  const AIDER_OUT_PER_MTOK = 10.00;

  // Codex CLI via OpenAI API — o4-mini (2026)
  // Source: openai.com/api/pricing
  const CODEX_IN_PER_MTOK  = 1.10;
  const CODEX_OUT_PER_MTOK = 4.40;

  const M = 1_000_000;

  const claudePerDev = (tokensIn * CLAUDE_IN_PER_MTOK + tokensOut * CLAUDE_OUT_PER_MTOK) / M;
  const aiderPerDev  = (tokensIn * AIDER_IN_PER_MTOK  + tokensOut * AIDER_OUT_PER_MTOK)  / M;
  const codexPerDev  = (tokensIn * CODEX_IN_PER_MTOK  + tokensOut * CODEX_OUT_PER_MTOK)  / M;

  // ── Team totals ────────────────────────────────────────────────────────
  const cursorTotal = cursorPerDev  * developers;
  const copilotTotal = copilotPerDev * developers;
  const codyTotal    = codyPerDev    * developers;
  const claudeTotal  = claudePerDev  * developers;
  const aiderTotal   = aiderPerDev   * developers;
  const codexTotal   = codexPerDev   * developers;

  // ── Ranking ────────────────────────────────────────────────────────────
  const tools: { name: string; total: number }[] = [
    { name: 'Cursor Pro',          total: cursorTotal  },
    { name: 'GitHub Copilot Pro',  total: copilotTotal },
    { name: 'Cody Pro',            total: codyTotal    },
    { name: 'Claude Code',         total: claudeTotal  },
    { name: 'Aider (GPT-4o)',      total: aiderTotal   },
    { name: 'Codex CLI (o4-mini)', total: codexTotal   },
  ];

  tools.sort((a, b) => a.total - b.total);

  const ranking = tools
    .map((t, idx) => `${idx + 1}. ${t.name}: $${t.total.toFixed(2)}/mes`)
    .join(' | ');

  const winner = tools[0].name;
  const winnerTotal = tools[0].total.toFixed(2);
  const winnerLabel = `${winner} — $${winnerTotal}/mes total para ${developers} dev${developers !== 1 ? 's' : ''}`;

  return {
    winner: winnerLabel,
    cursor_total:     Math.round(cursorTotal  * 100) / 100,
    copilot_total:    Math.round(copilotTotal * 100) / 100,
    claude_code_total:Math.round(claudeTotal  * 100) / 100,
    cody_total:       Math.round(codyTotal    * 100) / 100,
    aider_total:      Math.round(aiderTotal   * 100) / 100,
    codex_total:      Math.round(codexTotal   * 100) / 100,
    cursor_per_dev:   Math.round(cursorPerDev  * 100) / 100,
    copilot_per_dev:  Math.round(copilotPerDev * 100) / 100,
    claude_per_dev:   Math.round(claudePerDev  * 100) / 100,
    cody_per_dev:     Math.round(codyPerDev    * 100) / 100,
    aider_per_dev:    Math.round(aiderPerDev   * 100) / 100,
    codex_per_dev:    Math.round(codexPerDev   * 100) / 100,
    ranking,
  };
}
