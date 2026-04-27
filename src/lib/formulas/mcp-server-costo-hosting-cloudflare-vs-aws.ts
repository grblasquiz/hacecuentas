export interface Inputs {
  requests_per_day: number;
  avg_duration_ms: number;
  memory_mb: string;
  vps_size: string;
  cold_start_ok: string;
}

export interface Outputs {
  monthly_requests: number;
  cost_cloudflare: number;
  cost_aws: number;
  cost_vercel: number;
  cost_vps: number;
  winner: string;
  cold_start_warning: string;
  breakdown: string;
}

// Precios vigentes 2026 — fuente: páginas oficiales de cada plataforma

// Cloudflare Workers (plan Paid)
const CF_FREE_REQUESTS = 10_000_000; // requests/mes incluidos gratis
const CF_PAID_BASE = 5.0; // USD/mes base del plan Paid
const CF_PRICE_PER_MILLION = 0.30; // USD por millón de requests adicionales

// AWS Lambda — us-east-1
const LAMBDA_FREE_REQUESTS = 1_000_000; // requests/mes free tier
const LAMBDA_FREE_GB_SEC = 400_000; // GB-segundos/mes free tier
const LAMBDA_PRICE_PER_REQ = 0.0000002; // USD por request
const LAMBDA_PRICE_PER_GB_SEC = 0.0000166667; // USD por GB-segundo
// ALB: ~$0.008/hora × 730h ≈ $5.84/mes mínimo por ALB + LCU variables
const ALB_BASE_MONTHLY = 5.84; // USD/mes costo base del ALB (1 ALB × 730h × $0.008)
const ALB_PRICE_PER_MILLION_REQ = 0.008; // USD por millón de LCUs (aprox req)

// Vercel Pro
const VERCEL_PRO_BASE = 20.0; // USD/mes
const VERCEL_FREE_INVOCATIONS = 1_000_000; // invocaciones incluidas
const VERCEL_OVERAGE_PER_500K = 2.0; // USD por cada 500K invocaciones adicionales

// DigitalOcean Droplets — precios fijos mensuales
const VPS_PRICES: Record<string, number> = {
  basic_1vcpu_512mb: 4.0,
  basic_1vcpu_1gb: 6.0,
  basic_2vcpu_2gb: 18.0,
  basic_2vcpu_4gb: 24.0,
};

export function compute(i: Inputs): Outputs {
  const requestsPerDay = Math.max(0, Math.round(Number(i.requests_per_day) || 0));
  const avgDurationMs = Math.max(1, Number(i.avg_duration_ms) || 200);
  const memoryMb = Number(i.memory_mb) || 256;
  const vpsSizeKey = i.vps_size || "basic_1vcpu_1gb";
  const coldStartOk = i.cold_start_ok === "yes";

  if (requestsPerDay <= 0) {
    return {
      monthly_requests: 0,
      cost_cloudflare: 0,
      cost_aws: 0,
      cost_vercel: 20,
      cost_vps: VPS_PRICES[vpsSizeKey] ?? 6,
      winner: "Ingresá una cantidad de requests por día válida",
      cold_start_warning: "",
      breakdown: "",
    };
  }

  // Requests mensuales (30 días)
  const monthlyRequests = requestsPerDay * 30;

  // ── Cloudflare Workers ─────────────────────────────────────────
  let costCloudflare = 0;
  const cfExtraRequests = Math.max(0, monthlyRequests - CF_FREE_REQUESTS);
  if (cfExtraRequests > 0) {
    costCloudflare = CF_PAID_BASE + (cfExtraRequests / 1_000_000) * CF_PRICE_PER_MILLION;
  }

  // ── AWS Lambda + ALB ───────────────────────────────────────────
  const gbPerSec = (memoryMb / 1024) * (avgDurationMs / 1000);
  const totalGbSec = gbPerSec * monthlyRequests;
  const billableGbSec = Math.max(0, totalGbSec - LAMBDA_FREE_GB_SEC);
  const billableRequests = Math.max(0, monthlyRequests - LAMBDA_FREE_REQUESTS);

  const lambdaComputeCost = billableGbSec * LAMBDA_PRICE_PER_GB_SEC;
  const lambdaInvocationCost = billableRequests * LAMBDA_PRICE_PER_REQ;
  const albCost = ALB_BASE_MONTHLY + (monthlyRequests / 1_000_000) * ALB_PRICE_PER_MILLION_REQ;
  const costAws = lambdaComputeCost + lambdaInvocationCost + albCost;

  // ── Vercel Pro ─────────────────────────────────────────────────
  const vercelExtra = Math.max(0, monthlyRequests - VERCEL_FREE_INVOCATIONS);
  const vercelOverage = Math.ceil(vercelExtra / 500_000) * VERCEL_OVERAGE_PER_500K;
  const costVercel = VERCEL_PRO_BASE + vercelOverage;

  // ── VPS DigitalOcean ───────────────────────────────────────────
  const costVps = VPS_PRICES[vpsSizeKey] ?? 6;

  // ── Ganador ────────────────────────────────────────────────────
  const costs: Array<{ name: string; cost: number }> = [
    { name: "Cloudflare Workers", cost: costCloudflare },
    { name: "AWS Lambda + ALB", cost: costAws },
    { name: "Vercel Pro", cost: costVercel },
    { name: `VPS DigitalOcean (${vpsSizeKey.replace(/_/g, " ")})`, cost: costVps },
  ];

  const sorted = [...costs].sort((a, b) => a.cost - b.cost);
  const cheapest = sorted[0];
  const winner = `${cheapest.name} — $${cheapest.cost.toFixed(2)}/mes`;

  // ── Advertencia cold starts ────────────────────────────────────
  let coldStartWarning = "";
  if (!coldStartOk) {
    const coldStartIssues: string[] = [];
    if (costAws <= costCloudflare || costAws <= costVercel) {
      coldStartIssues.push("AWS Lambda tiene cold starts de 200–800 ms (usá Provisioned Concurrency para evitarlos, +costo)");
    }
    if (costVercel <= costAws) {
      coldStartIssues.push("Vercel Serverless Functions tienen cold starts similares a Lambda");
    }
    if (coldStartIssues.length > 0) {
      coldStartWarning = coldStartIssues.join(". ") + ". Cloudflare Workers y VPS no tienen cold starts apreciables.";
    } else {
      coldStartWarning = "Con la opción más barata seleccionada, los cold starts no son un problema adicional.";
    }
  }

  // ── Desglose ───────────────────────────────────────────────────
  const breakdown = [
    `Requests/mes: ${monthlyRequests.toLocaleString("es")}`,
    `CF Workers: $${costCloudflare.toFixed(2)} (${monthlyRequests <= CF_FREE_REQUESTS ? "dentro del free tier" : `${((monthlyRequests - CF_FREE_REQUESTS) / 1_000_000).toFixed(2)}M req de pago`})`,
    `AWS Lambda: $${lambdaComputeCost.toFixed(2)} cómputo + $${lambdaInvocationCost.toFixed(2)} invocaciones + $${albCost.toFixed(2)} ALB = $${costAws.toFixed(2)}`,
    `Vercel Pro: $20 base + $${vercelOverage.toFixed(2)} overage = $${costVercel.toFixed(2)}`,
    `VPS DO: $${costVps.toFixed(2)} fijo/mes`,
  ].join("\n");

  return {
    monthly_requests: monthlyRequests,
    cost_cloudflare: Math.round(costCloudflare * 100) / 100,
    cost_aws: Math.round(costAws * 100) / 100,
    cost_vercel: Math.round(costVercel * 100) / 100,
    cost_vps: costVps,
    winner,
    cold_start_warning: coldStartWarning,
    breakdown,
  };
}
