
const API_BASE =  typeof window === "undefined" ? process.env.API_URL_WEB: process.env.NEXT_PUBLIC_API_URL; 

const FRONTEND_ORIGIN =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://ss-notifier.localhost:3001";

export class UnauthorizedRedirectError extends Error {
  constructor() {
    super("Unauthenticated");
    this.name = "UnauthorizedRedirectError";
  }
}

let csrfPromise: Promise<void> | null = null;

async function getServerCookies() {
  const { cookies } = await import("next/headers");
  return cookies();
}

function loadXsrfTokenFromBrowser(): string | undefined {
  if (typeof document === "undefined") {
    return undefined;
  }

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith("XSRF-TOKEN="));

  if (!match) {
    return undefined;
  }

  const [, value] = match.split("=");
  return value ? decodeURIComponent(value) : undefined;
}

async function ensureCsrfCookie(): Promise<void> {
  if (typeof window === "undefined") {
    return;
  }

  if (!csrfPromise) {
    const csrfBase = API_BASE;

    if (!csrfBase) {
      throw new Error(
        "Cannot fetch CSRF cookie: API_URL_WEB or API_URL is not defined."
      );
    }

    csrfPromise = fetch(`${csrfBase}/sanctum/csrf-cookie`, {
      credentials: "include",
    }).then(() => undefined);
  }

  await csrfPromise;
}

async function getXsrfToken(): Promise<string | undefined> {
  if (typeof window === "undefined") {
    try {
      const cookieStore = await getServerCookies();
      const value = cookieStore.get("XSRF-TOKEN")?.value;
      return value ? decodeURIComponent(value) : undefined;
    } catch {
      return undefined;
    }
  }

  return loadXsrfTokenFromBrowser();
}

async function getCookieHeader(): Promise<string | undefined> {
  if (typeof window !== "undefined") {
    return undefined;
  }

  try {
    const cookieStore = await getServerCookies();
    const serialized = cookieStore
      .getAll()
      .map(({ name, value }) => `${name}=${value}`)
      .join("; ");

    return serialized.length > 0 ? serialized : undefined;
  } catch {
    return undefined;
  }
}

async function buildHeaders(method: string, headers: HeadersInit = {}) {
  const result = new Headers(headers);
  const upperMethod = method.toUpperCase();

  if (["POST", "PUT", "PATCH", "DELETE"].includes(upperMethod)) {
    const token = await getXsrfToken();
    if (token) {
      result.set("X-XSRF-TOKEN", token);
    }
  }

  if (upperMethod !== "GET" && !result.has("Content-Type")) {
    result.set("Content-Type", "application/json");
  }

  if (!result.has("Accept")) {
    result.set("Accept", "application/json");
  }

  if (typeof window === "undefined") {
    const cookieHeader = await getCookieHeader();
    if (cookieHeader && !result.has("Cookie")) {
      result.set("Cookie", cookieHeader);
    }

    if (!result.has("Origin")) {
      result.set("Origin", FRONTEND_ORIGIN);
    }

    if (!result.has("Referer")) {
      const referer = FRONTEND_ORIGIN.endsWith("/")
        ? FRONTEND_ORIGIN
        : `${FRONTEND_ORIGIN}/`;
      result.set("Referer", referer);
    }
  }

  return result;
}

async function prepareRequest(method: string) {
  const upperMethod = method.toUpperCase();
  if (typeof window !== "undefined" && upperMethod !== "GET") {
    await ensureCsrfCookie();
  }
}

type ApiFetchOptions = RequestInit & {
  suppressRedirectOn401?: boolean;
};

export async function apiFetch(
  path: string,
  options: ApiFetchOptions = {},
  baseUrl?: string
): Promise<Response> {
  const { suppressRedirectOn401 = false, ...requestInit } = options;
  const method = requestInit.method ?? "GET";

  await prepareRequest(method);
  const headers = await buildHeaders(method, requestInit.headers);
  
  // Add locale to query string if it's a GET request
  let url = `${baseUrl ?? API_BASE}/api${path}`;
  if (method === "GET") {
    let locale = 'lv'; // Default
    if (typeof window !== "undefined") {
      // Client-side: get locale from pathname
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      locale = (pathSegments[0] === 'lv' || pathSegments[0] === 'en') ? pathSegments[0] : 'lv';
    } else {
      // Server-side: try to get locale from next-intl
      try {
        const { getLocale } = await import('next-intl/server');
        locale = await getLocale();
      } catch {
        // Fallback: try to get from headers
        try {
          const { headers } = await import('next/headers');
          const headersList = await headers();
          const pathname = headersList.get('x-pathname') || headersList.get('referer') || '';
          const pathSegments = pathname.split('/').filter(Boolean);
          locale = (pathSegments[0] === 'lv' || pathSegments[0] === 'en') ? pathSegments[0] : 'lv';
        } catch {
          locale = 'lv';
        }
      }
    }
    if (['lv', 'en'].includes(locale)) {
      const separator = path.includes('?') ? '&' : '?';
      url = `${url}${separator}locale=${locale}`;
    }
  }
  
  const response = await fetch(url, {
    ...requestInit,
    headers,
    credentials: "include",
  });

  if (response.status === 401) {
    if (suppressRedirectOn401) {
      return response;
    }

    if (typeof window === "undefined") {
      const { redirect } = await import("next/navigation");
      redirect('/login');
    } else {
      window.location.assign('/login');
      throw new UnauthorizedRedirectError();
    }
  }

  return response;
}

export async function readJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function extractErrorMessage(
  response: Response,
  fallback: string
): Promise<string> {
  try {
    const data = await response.json();
    const message =
      (data && typeof data === "object" && "message" in data
        ? (data as { message?: string }).message
        : undefined) ?? fallback;
    return message;
  } catch {
    return fallback;
  }
}