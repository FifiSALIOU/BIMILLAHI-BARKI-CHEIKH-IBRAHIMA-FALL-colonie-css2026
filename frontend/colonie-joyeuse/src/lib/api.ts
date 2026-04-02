const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(/\/+$/, "");

type ApiRequestOptions = {
  method?: string;
  token?: string | null;
  body?: string;
  headers?: Record<string, string>;
};

type ApiErrorPayload = {
  detail?: string | Array<{ msg?: string }>;
  message?: string;
};

function parseApiError(payload: unknown): string {
  const data = payload as ApiErrorPayload;
  if (!data) return "Erreur API inconnue.";
  if (typeof data.detail === "string") return data.detail;
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail.map((x) => x?.msg).filter(Boolean).join(" | ");
  }
  if (typeof data.message === "string") return data.message;
  return "Erreur API inconnue.";
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (options.token) headers.Authorization = `Bearer ${options.token}`;

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body,
  });

  if (!response.ok) {
    let payload: unknown = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }
    const detail = parseApiError(payload);
    throw new Error(detail || `Erreur HTTP ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

export { API_BASE_URL };
