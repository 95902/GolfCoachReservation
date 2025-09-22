import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Pour l'instant, on désactive le middleware pour éviter les erreurs
  // Il sera réactivé une fois l'authentification stabilisée
  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/dashboard/:path*"]
}