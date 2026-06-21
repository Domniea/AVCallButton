function isRetryableRequestError(err: unknown): boolean {
  if (typeof err !== "object" || err === null) return false;
  const e = err as { response?: { status?: number }; code?: string };
  const status = e.response?.status;
  if (status === 500 || status === 502 || status === 503 || status === 504) {
    return true;
  }
  if (!e.response && (e.code === "ERR_NETWORK" || e.code === "ECONNABORTED")) {
    return true;
  }
  return false;
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  options?: { attempts?: number; delayMs?: number },
): Promise<T> {
  const attempts = options?.attempts ?? 5;
  const delayMs = options?.delayMs ?? 600;
  let lastError: unknown;

  for (let attempt = 0; attempt < attempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      if (!isRetryableRequestError(err) || attempt === attempts - 1) {
        throw err;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, delayMs * (attempt + 1)),
      );
    }
  }

  throw lastError;
}
