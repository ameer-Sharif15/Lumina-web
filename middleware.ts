import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const host = request.headers.get('host') || '';

  // Don't rewrite requests for static files, api routes, or Next.js internals
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/favicon.ico') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract subdomain robustly
  const hostParts = host.split('.');
  let subdomain = null;

  if (host.includes('localhost')) {
    // For localhost: vendor.localhost:3000 -> subdomain is 'vendor'
    if (hostParts.length > 1 && hostParts[0] !== 'localhost') {
      subdomain = hostParts[0];
    }
  } else {
    // For production: vendor.mealtym.com -> subdomain is 'vendor'
    // Skip 'www' as it's usually the main site
    if (hostParts.length > 2 && hostParts[0] !== 'www') {
      subdomain = hostParts[0];
    }
  }

  // Define subdomain mappings
  const SUBDOMAIN_MAPPING: Record<string, string> = {
    adminctrl: '/admin',
  };

  if (subdomain && SUBDOMAIN_MAPPING[subdomain]) {
    const targetPath = SUBDOMAIN_MAPPING[subdomain];

    // CRITICAL: Prevent infinite rewrite loops.
    // If the pathname already starts with the target path, don't rewrite it again.
    if (url.pathname.startsWith(targetPath)) {
      return NextResponse.next();
    }

    // Rewrite the URL to the internal path
    url.pathname = `${targetPath}${url.pathname === '/' ? '' : url.pathname}`;
    return NextResponse.rewrite(url);
  }

  return NextResponse.next();
}
