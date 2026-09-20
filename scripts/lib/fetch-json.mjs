const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export async function getJsonWithRetry(url) {
  for (let attempt = 0; ; attempt++) {
    try {
      const response = await fetch(url, {
        headers: { 'user-agent': 'hacecuentas-data-refresh/2.0' },
        signal: AbortSignal.timeout(20000),
      });
      if (!response.ok) {
        const error = new Error(`${response.status} ${url}`);
        error.retryable = response.status === 429 || response.status >= 500;
        throw error;
      }
      return await response.json();
    } catch (error) {
      if (error.retryable === false || attempt >= 2) throw error;
      await pause((attempt + 1) * 1000);
    }
  }
}
