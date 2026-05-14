const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: BodyInit | Record<string, unknown> | null;
  auth?: boolean;
};

function getAuthToken() {
  return localStorage.getItem("orufy_token");
}

export function getApiBaseUrl() {
  return API_URL;
}

async function parseResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === "string"
        ? payload
        : payload?.message || payload?.error || "Request failed";
    throw new Error(message);
  }

  return payload as T;
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;
  let body: BodyInit | undefined = undefined;

  if (!isFormData && options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options.body) {
    if (isFormData) {
      body = options.body as BodyInit;
    } else if (typeof options.body === "string") {
      body = options.body;
    } else {
      body = JSON.stringify(options.body) as BodyInit;
    }
  }

  if (options.auth !== false) {
    const token = getAuthToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    body,
  });

  return parseResponse<T>(response);
}

export type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data: T;
  error?: string;
};
