import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // Laisser passer les routes publiques
  const publicPaths = ['/', '/sign-in', '/sign-up', '/onboarding', '/api/users/setup']
  const pathname = req.nextUrl.pathname
  
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Protection du dashboard - réservé aux propriétaires
  if (pathname.startsWith('/dashboard')) {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.redirect(new URL('/sign-in', req.url))
    }

    try {
      const response = await fetch(`${req.nextUrl.origin}/api/users/setup`)
      const data = await response.json()
      
      if (!data.exists || !data.isOwner) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } catch (error) {
      console.error('Erreur middleware dashboard:', error)
      return NextResponse.redirect(new URL('/', req.url))
    }
  }

  // Vérifier si un propriétaire existe et son type d'app
  try {
    const response = await fetch(`${req.nextUrl.origin}/api/users/setup`)
    const data = await response.json()
    
    if (!data.exists) {
      // Aucun propriétaire, laisser passer
      return NextResponse.next()
    }

    const { appType } = data
    
    // Contrôler l'accès selon le type d'app
    if (appType === 'ECOMMERCE') {
      // Bloquer les routes services
      if (pathname.startsWith('/services') || pathname.includes('/booking')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    } else if (appType === 'SERVICES') {
      // Bloquer les routes ecommerce
      if (pathname.startsWith('/products') || pathname.startsWith('/cart')) {
        return NextResponse.redirect(new URL('/', req.url))
      }
    }
    // Si BOTH, tout est accessible
    
  } catch (error) {
    console.error('Erreur middleware:', error)
  }
  
  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}