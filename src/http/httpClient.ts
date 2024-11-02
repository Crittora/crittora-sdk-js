import { CrittoraError } from "../errors/crittoraErrors";
import { Headers } from "../types";

export class HttpClient {
  private static instance: HttpClient;

  private constructor() {}

  static getInstance(): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient();
    }
    return HttpClient.instance;
  }

  async post<T>(url: string, headers: Headers, payload: unknown): Promise<T> {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: headers as unknown as Record<string, string>,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new CrittoraError(
          `HTTP error! status: ${response.status}, body: ${errorBody}`,
          "HTTP_ERROR",
          response.status
        );
      }

      const responseData = await response.json();

      if ("body" in responseData) {
        return JSON.parse(responseData.body);
      }

      throw new CrittoraError("Invalid response format", "INVALID_RESPONSE");
    } catch (error) {
      if (error instanceof CrittoraError) {
        throw error;
      }
      throw new CrittoraError(
        `Request failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        "REQUEST_ERROR"
      );
    }
  }
}
