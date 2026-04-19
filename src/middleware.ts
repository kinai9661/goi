import { withAuth } from 'next-auth/middleware'

export default withAuth({
  pages: {
    signIn: '/login',
  },
})

export const config = {
  matcher: [
    '/generate/:path*',
    '/edit/:path*',
    '/video/:path*',
    '/gallery/:path*',
    '/admin/:path*',
  ],
}