import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limit Config ────────────────────────────────────────────────────────
const CONFIGS = {
  auth: { limit: 10, windowMs: 60 * 1000 },
  api: { limit: 60, windowMs: 60 * 1000 },
  email: { limit: 5, windowMs: 60 * 1000 },
} as const;

type RateLimitKey = keyof typeof CONFIGS;

// In-memory store: { key: { count, resetAt } }
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

// Cleanup old entries every 5 minutes to prevent memory leak
let lastCleanup = Date.now();
function maybeCleanup() {
  const now = Date.now();
  if (now - lastCleanup < 5 * 60 * 1000) return;
  lastCleanup = now;
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

/**
 * Extract user ID from Supabase auth cookie for per-user rate limiting.
 * Falls back to IP if not authenticated.
 */
function getRateLimitIdentifier(req: NextRequest): string {
  const ip = getClientIp(req);
  const cookieHeader = req.headers.get('cookie') || '';
  const sbCookieMatch = cookieHeader.match(/sb-[^=]+-auth-token=([^;]+)/);
  if (sbCookieMatch) {
    try {
      const decoded = decodeURIComponent(sbCookieMatch[1]);
      const parsed = JSON.parse(decoded);
      const userId = parsed?.user?.id || parsed?.[0]?.user?.id;
      if (userId) return `user:${userId}`;
    } catch {
      // fall through to IP
    }
  }
  return `ip:${ip}`;
}

function getRouteConfig(pathname: string): {
  key: RateLimitKey;
  config: (typeof CONFIGS)[RateLimitKey];
} {
  if (
    pathname.startsWith('/api/auth') ||
    pathname.includes('/auth/') ||
    pathname.includes('/sign-up') ||
    pathname.includes('/login')
  ) {
    return { key: 'auth', config: CONFIGS.auth };
  }
  if (pathname.startsWith('/api/email')) {
    return { key: 'email', config: CONFIGS.email };
  }
  return { key: 'api', config: CONFIGS.api };
}

function getProjectRef(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  return url.match(/https?:\/\/([^.]+)\./)?.[1] ?? '';
}

function injectTokenFromHeader(request: NextRequest): void {
  const token = request.headers.get('x-sb-token');
  if (!token) return;
  const hasCookie = request.cookies.getAll().some((c) => c.name.includes('auth-token'));
  if (hasCookie) return;
  const ref = getProjectRef();
  if (ref) request.cookies.set(`sb-${ref}-auth-token`, token);
}

export async function middleware(req: NextRequest) {
  injectTokenFromHeader(req);

  let supabaseResponse = NextResponse.next({ request: req });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return supabaseResponse;
  }

  maybeCleanup();

  const identifier = getRateLimitIdentifier(req);
  const { key, config } = getRouteConfig(req.nextUrl.pathname);
  const mapKey = `${key}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitMap.get(mapKey);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(mapKey, { count: 1, resetAt: now + config.windowMs });
    supabaseResponse.headers.set('X-RateLimit-Limit', String(config.limit));
    supabaseResponse.headers.set('X-RateLimit-Remaining', String(config.limit - 1));
    supabaseResponse.headers.set(
      'X-RateLimit-Reset',
      String(Math.ceil((now + config.windowMs) / 1000))
    );
    return supabaseResponse;
  }

  entry.count += 1;

  if (entry.count > config.limit) {
    const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
    return new NextResponse(
      JSON.stringify({
        error: 'Too many requests. Please slow down.',
        retryAfter,
        limit: config.limit,
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(retryAfter),
          'X-RateLimit-Limit': String(config.limit),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(Math.ceil(entry.resetAt / 1000)),
        },
      }
    );
  }

  supabaseResponse.headers.set('X-RateLimit-Limit', String(config.limit));
  supabaseResponse.headers.set('X-RateLimit-Remaining', String(config.limit - entry.count));
  supabaseResponse.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
