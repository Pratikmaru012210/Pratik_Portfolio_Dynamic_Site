export const getBaseUrl = () => process.env.NEXT_PUBLIC_BE_URL || "http://localhost:3001";

interface RequestOptions extends Omit<RequestInit, "headers"> {
  headers?: Record<string, string>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function apiRequest<T = any>(
  path: string,
  options: RequestOptions = {},
  token?: string | null
): Promise<T> {
  const isServerless =
    path === "/profile" ||
    path === "/about" ||
    path.startsWith("/about/") ||
    path === "/services" ||
    path.startsWith("/services/") ||
    path === "/projects" ||
    path.startsWith("/projects/") ||
    path === "/cheatsheets" ||
    path.startsWith("/cheatsheets/") ||
    path.startsWith("/dynamic-sections") ||
    path.startsWith("/auth/") ||
    path.startsWith("/admin/") ||
    path === "/imageKitAuth" ||
    path.startsWith("/delete/");
  const url = isServerless ? `/api${path}` : `${getBaseUrl()}${path}`;
  const headers = new Headers(options.headers || {});

  // Set default content type unless body is FormData (which sets boundary automatically)
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API request failed with status ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch {
      // ignore JSON parse error
    }
    throw new Error(errorMessage);
  }

  // Handle empty or 204 response
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}
