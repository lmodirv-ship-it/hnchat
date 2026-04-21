import { NextRequest, NextResponse } from 'next/server';

// ─── Rate Limit Config ────────────────────────────────────────────────────────
const CONFIGS = {
  auth: { limit: 10, windowMs: 60 * 1000 },       // 10 req/min for auth endpoints
  api: { limit: 60, windowMs: 60 * 1000 },          // 60 req/min for general API
  email: { limit: 5, windowMs: 60 * 1000 },          // 5 req/min for email endpoints
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
  // Try to get user ID from Supabase session cookie
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

function getRouteConfig(pathname: string): { key: RateLimitKey; config: typeof CONFIGS[RateLimitKey] } {
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

export function middleware(req: NextRequest) {
  // Only rate-limit API routes
  if (!req.nextUrl.pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  maybeCleanup();

  const identifier = getRateLimitIdentifier(req);
  const { key, config } = getRouteConfig(req.nextUrl.pathname);
  const mapKey = `${key}:${identifier}`;
  const now = Date.now();
  const entry = rateLimitMap.get(mapKey);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(mapKey, { count: 1, resetAt: now + config.windowMs });
    const res = NextResponse.next();
    res.headers.set('X-RateLimit-Limit', String(config.limit));
    res.headers.set('X-RateLimit-Remaining', String(config.limit - 1));
    res.headers.set('X-RateLimit-Reset', String(Math.ceil((now + config.windowMs) / 1000)));
    return res;
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

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(config.limit));
  response.headers.set('X-RateLimit-Remaining', String(config.limit - entry.count));
  response.headers.set('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)));
  return response;
}

export const config = {
  matcher: '/api/:path*',
};
