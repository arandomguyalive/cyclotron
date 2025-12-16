import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of ISO 3166-1 alpha-2 country codes to block
// KP: North Korea, IR: Iran, CU: Cuba, SY: Syria, RU: Russia
// ANT: Antarctica (For testing purposes, assuming no one is there)
const BLOCKED_COUNTRIES = ['KP', 'IR', 'CU', 'SY', 'RU', 'ANT'];

export function middleware(request: NextRequest) {
  // 1. Get Country Code
  // Vercel provides this in req.geo.country on Edge Middleware
  // Fallback to header for local dev/testing
  let country = (request as any).geo?.country || request.headers.get('x-vercel-ip-country') || 'US';

  // 2. Allow Simulation via Query Param (For Dev/Demo)
  // Usage: ?simulate_geo=KP
  const searchParams = request.nextUrl.searchParams;
  const simulatedGeo = searchParams.get('simulate_geo');
  if (simulatedGeo) {
    country = simulatedGeo.toUpperCase();
  }

  // 3. Check Blocklist
  if (country && BLOCKED_COUNTRIES.includes(country)) {
    // Prevent redirect loop if already on restricted page
    if (request.nextUrl.pathname.startsWith('/restricted')) {
      return NextResponse.next();
    }

    console.log(`[Middleware] Blocking Access from ${country}`);
    
    // Rewrite to the restricted page (keeps URL same, changes content)
    // Or Redirect (changes URL). Redirect is clearer for the user "why" they moved.
    return NextResponse.redirect(new URL('/restricted', request.url));
  }

  return NextResponse.next();
}

// Config: Match all paths except static files, APIs that shouldn't be blocked, etc.
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - restricted (The blocked page itself)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|restricted).*)',
  ],
};
