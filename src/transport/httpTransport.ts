import { AuthProvider } from "../auth/types";
import {
  CrittoraClientOptions,
  RequestContext,
  RequestOptions,
  RetryOptions,
} from "../types";
import { RateLimitError, RequestError, ValidationError } from "../errors";

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxAttempts: 1,
  backoffMs: 250,
  retryOn: [429, 500, 502, 503, 504],
};

export class HttpTransport {
  private readonly fetchImpl: typeof globalThis.fetch;
  private readonly retryOptions: Required<RetryOptions>;

  constructor(
    private readonly context: RequestContext,
    options: Pick<CrittoraClientOptions, "fetch" | "retry">
  ) {
    if (!options.fetch && typeof globalThis.fetch !== "function") {
      throw new ValidationError(
        "No fetch implementation available. Use Node 18+ or pass `fetch` in the client options."
      );
    }

    this.fetchImpl = options.fetch ?? globalThis.fetch;
    this.retryOptions = {
      ...DEFAULT_RETRY_OPTIONS,
      ...(options.retry ?? {}),
    };
  }

  async request<T>(
    request: RequestOptions,
    authProvider?: AuthProvider
  ): Promise<T> {
    let lastError: unknown;

    for (
      let attempt = 1;
      attempt <= this.retryOptions.maxAttempts;
      attempt += 1
    ) {
      try {
        return await this.executeRequest<T>(request, authProvider);
      } catch (error) {
        lastError = error;

        if (!this.shouldRetry(error, attempt)) {
          throw error;
        }

        await this.delay(this.retryOptions.backoffMs * attempt);
      }
    }

    throw lastError;
  }

  private async executeRequest<T>(
    request: RequestOptions,
    authProvider?: AuthProvider
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.context.timeoutMs);

    try {
      const headers = await this.buildHeaders(request.headers, authProvider);
      const response = await this.fetchImpl(
        `${this.context.baseUrl}${request.path}`,
        {
          method: request.method ?? "POST",
          headers,
          body:
            request.body === undefined ? undefined : JSON.stringify(request.body),
          signal: request.signal ?? controller.signal,
        }
      );

      const rawText = await response.text();
      const parsedBody = this.parseBody(rawText);
      const requestId = response.headers.get("x-request-id") ?? undefined;

      if (!response.ok) {
        const message = this.extractErrorMessage(parsedBody, response.status);
        const errorOptions = {
          status: response.status,
          details: parsedBody,
          requestId,
        };

        if (response.status === 429) {
          throw new RateLimitError(message, errorOptions);
        }

        throw new RequestError(message, errorOptions);
      }

      return this.unwrapBody(parsedBody) as T;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new RequestError("Request timed out", {
          details: { timeoutMs: this.context.timeoutMs },
          cause: error,
        });
      }

      if (error instanceof RequestError || error instanceof RateLimitError) {
        throw error;
      }

      throw new RequestError("Request failed", { cause: error });
    } finally {
      clearTimeout(timeout);
    }
  }

  private async buildHeaders(
    requestHeaders?: Record<string, string>,
    authProvider?: AuthProvider
  ): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...this.context.headers,
      ...requestHeaders,
    };

    if (this.context.userAgent) {
      headers["User-Agent"] = this.context.userAgent;
    }

    if (this.context.credentials?.apiKey) {
      headers["api_key"] = this.context.credentials.apiKey;
    }

    if (this.context.credentials?.accessKey) {
      headers["access_key"] = this.context.credentials.accessKey;
    }

    if (this.context.credentials?.secretKey) {
      headers["secret_key"] = this.context.credentials.secretKey;
    }

    const authorization = await authProvider?.getAuthorizationHeader();
    if (authorization) {
      headers.Authorization = authorization;
    }

    return headers;
  }

  private unwrapBody(parsedBody: unknown): unknown {
    if (
      parsedBody &&
      typeof parsedBody === "object" &&
      "body" in parsedBody &&
      typeof (parsedBody as { body?: unknown }).body === "string"
    ) {
      return this.parseBody((parsedBody as { body: string }).body);
    }

    return parsedBody;
  }

  private parseBody(rawText: string): unknown {
    if (!rawText) {
      return undefined;
    }

    try {
      return JSON.parse(rawText);
    } catch {
      return rawText;
    }
  }

  private extractErrorMessage(body: unknown, status: number): string {
    if (typeof body === "string" && body.trim()) {
      return body;
    }

    if (body && typeof body === "object") {
      const candidate = body as Record<string, unknown>;
      const message =
        candidate.message ??
        candidate.error ??
        candidate.error_description ??
        candidate.detail;

      if (typeof message === "string" && message.trim()) {
        return message;
      }
    }

    return `Request failed with status ${status}`;
  }

  private shouldRetry(error: unknown, attempt: number): boolean {
    if (attempt >= this.retryOptions.maxAttempts) {
      return false;
    }

    if (
      error instanceof RequestError &&
      typeof error.status === "number" &&
      this.retryOptions.retryOn.includes(error.status)
    ) {
      return true;
    }

    return error instanceof RateLimitError;
  }

  private async delay(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
