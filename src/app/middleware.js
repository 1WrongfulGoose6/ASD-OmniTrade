import { NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/verifyJWT';
import { SESSION_COOKIE_NAME } from '@/utils/auth';

export async function middleware(request) {
    const { pathname } = request.nextUrl;

    // Routes that require authentication
    const protectedRoutes = ['/trade-backlog', '/market-data-display'];

    // Only apply middleware on these routes
    const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
    if (!isProtected) return NextResponse.next();

    // Retrieve JWT token
    const token =
        request.cookies.get(SESSION_COOKIE_NAME)?.value ||
        request.headers.get('authorization')?.replace('Bearer ', '');

    // Secret key from environment variable
    const secret = process.env.AUTH_SECRET || process.env.JWT_SECRET_KEY;
    if (!secret) {
        console.error('Missing JWT_SECRET_KEY in environment variables');
        return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
    }

    // Verify token
    const decoded = verifyJWT(token, secret);
    if (!decoded) {
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }

    // Optionally attach user info to request headers
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.id || 'unknown');
    requestHeaders.set('x-user-role', decoded.role || 'user');

    // Continue request
    const response = NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });

    // Optional: Add security headers
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
}

// Run only for selected routes
export const config = {
    matcher: ['/trade-backlog/:path*', '/market-data-display/:path*'],
};
