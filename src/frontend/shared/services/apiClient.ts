export class ApiClientError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: { error?: string; [key: string]: unknown }
  ) {
    super(body.error ?? `Request failed with status ${status}`);
  }
}

export interface ActorHeaders {
  id: string;
  role: string | null;
}

async function request<T>(path: string, actor: ActorHeaders, init: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-actor-id": actor.id,
  };
  if (actor.role) headers["x-actor-role"] = actor.role;

  const res = await fetch(`/api${path}`, { ...init, headers: { ...headers, ...(init.headers as Record<string, string>) } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new ApiClientError(res.status, body);
  }
  return body as T;
}

export const apiClient = {
  get: <T>(path: string, actor: ActorHeaders) => request<T>(path, actor),
  post: <T>(path: string, actor: ActorHeaders, data?: unknown) =>
    request<T>(path, actor, { method: "POST", body: data !== undefined ? JSON.stringify(data) : undefined }),
};
